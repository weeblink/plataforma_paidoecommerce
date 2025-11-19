<?php

namespace App\Classes\Payments;


use App\Models\CustomerModel;
use App\Models\Order;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

abstract class Checkout {

    protected string $token;
    protected string $app_id;
    protected string $app_name;
    protected string|null $client_secret;
    protected string|null $client_id;
    protected string $mode = 'deploy';
    protected int $credentialsId;
    protected $expires_in;
    protected string|null $api_key;

    public function __construct(
        int $credentialsId,
        string $app_id,
        string $app_name,
        string|null $client_secret,
        string|null $client_id,
        $expires_in,
        string $token,
        string|null $api_key
    )
    {
        $this->credentialsId = $credentialsId;
        $this->app_id = $app_id;
        $this->app_name = $app_name;
        $this->client_secret = $client_secret;
        $this->client_id = $client_id;
        $this->expires_in = $expires_in;
        $this->token = $token;
        $this->api_key = $api_key;
    }

    /**
     * Function to get base url for mode app
     * @return string
     */
    abstract protected function getBaseUrl(   ) : string;

    /**
     * Functio  to get base url auth for mode app
     * @return string
     */
    abstract protected function getBaseUrlAuth(   ) : string;

    /**
     * Function to create customer on Appmax
     * @param Client $client
     * @return Client
     * @throws GuzzleException
     */
    abstract protected function createCustomerIntegration( Client $client ) : Client;

    /**
     * Function to refresh token
     * @return void
     * @throws GuzzleException
     * @throws Exception
     */
    abstract protected function refreshToken(  ) : void;

    /**
     * Function to create Order on Integration
     * @param \App\Classes\Payments\Order $order
     * @return \App\Classes\Payments\Order
     * @throws GuzzleException
     */
    abstract protected function createOrderIntegration(\App\Classes\Payments\Order $order ) : \App\Classes\Payments\Order;

    /**
     * Function to execute payment on plataform
     * @param Client $client
     * @param Order $order
     * @return PaymentData
     */
    abstract protected function executePayment(Client $client, \App\Classes\Payments\Order $order ) : \App\Classes\Payments\PaymentData;

    /**
     * Function to read webhook payment Authorized
     * @param $webhookData
     * @return array
     */
    abstract public function checkStatusPayment( $webhookData ) : array;

    /**
     * @param Order $order
     * @param CustomerModel $customer
     * @param array|null $card
     * @return PaymentData
     * @throws GuzzleException
     */
    protected function pay(Order $order, CustomerModel $customer, array|null $card = [] ) : \App\Classes\Payments\PaymentData
    {
        list( $orderClass, $customerClass ) = $this->createClassesData( $order, $customer, $card );

        $clientPlataform = $this->createCustomerIntegration( $customerClass );

        $orderClass->customerId = $customerClass->getClientIdPlataform();

        $orderPlataform = $this->createOrderIntegration( $orderClass );

        return $this->executePayment(
            $clientPlataform,
            $orderPlataform
        );
    }

    /**
     * Function to create classes
     * @param Order $order
     * @param CustomerModel $customer
     * @param array $card
     * @return array
     */
    protected function createClassesData( Order $order, CustomerModel $customer, $card = [] ) : array
    {
        $address = new Address([
            'postcode'  => $customer->postcode,
            'street'    => $customer->street,
            'number'    => $customer->number,
            'complement'=> $customer->complement,
            'district'  => $customer->district,
            'city'      => $customer->city,
            'state'     => $customer->state
        ]);

        $client = new Client([
            'firstName'         => $customer->first_name,
            'lastName'          => $customer->last_name,
            'email'             => $customer->email,
            'phone'             => $customer->phone,
            'address'           => $address,
            'ip'                => $customer->ip,
            'documentNumber'    => $customer->document_number
        ]);

        $orderClass = new \App\Classes\Payments\Order([
            'customerId'    => $customer->id, // Temporally
            'productsValue' => $order->products_value,
            'discountValue' => $order->discount_value,
            'shippingValue' => $order->shipping_value,
            'typePayment'   => $order->type_payment,
            'card'          => $card,
        ]);

        $orderClass->setProducts([
            [
                'sku'           => '01',
                'name'          => 'Courso Clube dos Foguetes',
                'quantity'      => 1,
                'unit_value'    => $order->products_value,
                'type'          => 'digital',
            ]
        ]);

        return [$orderClass, $client];
    }

    /**
     * Function to make requests
     * @param string $url
     * @param string $method
     * @param array $data
     * @param string $contentType
     * @return mixed
     * @throws GuzzleException
     * @throws Exception
     */
    protected function request(
        string $url,
        string $method = "GET",
        array $data = [],
        string $contentType = "json",
        string $token = ''
    ) : \stdClass
    {
        try {
            if ($this->expires_in !== null && now() > $this->expires_in) {
                $this->refreshToken();
            }

            $client = new \GuzzleHttp\Client();

            $options = [
                'headers' => [
                    'access_token' => $token,
                ],
            ];

            if ($contentType === "json") {
                $options['json'] = $data;
            } elseif ($contentType === "form") {
                $options['form_params'] = $data;
                $options['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            Log::debug($options);

            $response = $client->request($method, $url, $options);
            $responseData = json_decode($response->getBody()->getContents());

            // Caso a Appmax responda 200 com { success: false }
            if (isset($responseData->success) && !$responseData->success) {
                if (isset($responseData->text)) {
                    // Aqui já subimos o motivo limpo para o controller
                    throw new \Exception($responseData->text, 400);
                }

                throw new \Exception('Erro ao processar pagamento na integração.', 400);
            }

            return $responseData;

        } catch (\GuzzleHttp\Exception\RequestException $e) {

            // Aqui tratamos 400/422/etc vindos da Appmax
            Log::debug('[Checkout::request] HTTP error: ' . $e->getMessage());

            if ($e->hasResponse()) {
                $body = (string) $e->getResponse()->getBody();
                Log::debug('[Checkout::request] Response body: ' . $body);

                $json = json_decode($body, true);

                if (json_last_error() === JSON_ERROR_NONE && isset($json['text'])) {
                    // Joga para cima já com a mensagem exata deles
                    throw new \Exception($json['text'], 400);
                }
            }

            // Se não conseguir interpretar, relança a própria RequestException
            throw $e;

        } catch (\Exception $e) {
            Log::debug('[Checkout::request] General error: ' . $e->getMessage());
            // Relança como está, SEM embrulhar de novo
            throw $e;
        }
    }
}
