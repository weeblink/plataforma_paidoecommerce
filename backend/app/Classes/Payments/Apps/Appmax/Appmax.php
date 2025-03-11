<?php

namespace App\Classes\Payments\Apps\Appmax;

use App\Classes\Payments\Apps\Appmax\methods\CreditCardAppmax;
use App\Classes\Payments\Apps\Appmax\methods\InvoiceAppmax;
use App\Classes\Payments\Apps\Appmax\methods\PixAppmax;
use App\Classes\Payments\Checkout;
use App\Classes\Payments\Client;
use App\Classes\Payments\PaymentData;
use App\Interfaces\AppCheckoutInterface;
use App\Models\CredentialsCheckout;
use App\Models\CustomerModel;
use App\Models\Order;
use App\Models\Payment;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class Appmax extends Checkout implements AppCheckoutInterface
{

    protected string $urlHomolog = "https://homolog.sandboxappmax.com.br/api/v3";
    protected string $urlHomologAuth = "";

    protected string $urlDeploy = "https://admin.appmax.com.br/api/v3";
    protected string $urlDeployAuth = "";

    protected string $mode = "deploy";

    /**
     * Function to get base url for mode app
     * @return string
     */
    protected function getBaseUrl() : string
    {
        return $this->mode === "deploy" ? $this->urlDeploy : $this->urlHomolog;
    }

    /**
     * Functio  to get base url auth for mode app
     * @return string
     */
    protected function getBaseUrlAuth() : string
    {
        return $this->mode === "deploy" ? $this->urlDeployAuth : $this->urlHomologAuth;
    }

    /**
     * Function to create customer on Appmax
     * @param Client $client
     * @return Client
     * @throws GuzzleException
     */
    protected function createCustomerIntegration( Client $client ) : Client {

        $data = [
            'access-token'                  => $this->token,
            'firstname'                     => $client->firstName,
            'lastname'                      => $client->lastName,
            'email'                         => $client->email,
            'telephone'                     => $client->phone,
            'postcode'                      => $client->address->postcode,
            'address_city'                  => $client->address->city,
            'address_state'                 => $client->address->state,
            'address_street_number'         => $client->address->number,
            'address_street'                => $client->address->street,
            'address_street_complement'     => $client->address->complement,
            'address_street_district'       => $client->address->district,
            'ip'                            => $client->ip,
            'products'                      => [],
            'tracking'                      => null
        ];

        $url = $this->getBaseUrl() . "/customer";
        $response = $this->request( $url, "POST", $data );
        $client->setClientIdPlataform( $response->data->id );

        return $client;
    }

    /**
     * Function to make Payment by Interface
     * @param Order $order
     * @param CustomerModel $customer
     * @param array $card
     * @return PaymentData
     * @throws GuzzleException
     */
    public function makePayment(Order $order, CustomerModel $customer, array|null $card = null): PaymentData
    {
        return $this->pay( $order, $customer, $card );
    }

    /**
     * Function to refresh token
     * @return void
     * @throws Exception
     */
    protected function refreshToken(): void
    {
        // Não existe refresh Token
    }

    /**
     * Function to create Order on Integration
     * @param \App\Classes\Payments\Order $order
     * @return \App\Classes\Payments\Order
     * @throws GuzzleException
     */
    protected function createOrderIntegration(\App\Classes\Payments\Order $order): \App\Classes\Payments\Order
    {
        $products = array_map( function( $data ) {
            return [
                'sku'                   => $data['sku'],
                'name'                  => $data['name'],
                'qty'                   => $data['quantity'],
                'digital_product'       => 1,
            ];
        }, $order->getProducts() );

        $data = [
            'access-token'      => $this->token,
            'total'             => ( $order->productsValue / 100 ), // TODO: Implement function to calculate total
            'customer_id'       => $order->customerId,
            'discount'          => ( $order->discountValue / 100 ),
            'shipping'          => ( $order->shippingValue / 100 ),
            'products'          => $products
        ];


        $url = $this->getBaseUrl() . "/order";
        $response = $this->request( $url, "POST", $data );
        Log::debug("Novo ID de pedido: " . $response->data->id);
        $order->setOrderIdPlataform( $response->data->id );

        return $order;
    }

    /**
     * Function to execute payment on plataform
     * @param Client $client
     * @param \App\Classes\Payments\Order $order
     * @return PaymentData
     * @throws GuzzleException
     */
    protected function executePayment(Client $client, \App\Classes\Payments\Order $order): PaymentData
    {
        $sufixUrl = "";
        $method = null;

        switch ($order->typePayment){
            case 'pix':

                $method = new PixAppmax( $client->documentNumber );
                $sufixUrl = "pix";
                break;
            case 'invoice':

                $method = new InvoiceAppmax( $client->documentNumber );
                $sufixUrl = "boleto";
                break;
            case 'credit_card':

                $method = new CreditCardAppmax( $client->documentNumber, $order->getCard() );
                $sufixUrl = "credit-card";
                break;
        }

        $payment['access-token']    = $this->token;
        $payment['payment']         = $method->getPaymentData();
        $payment['customer']        = ['customer_id' => $order->customerId];
        $payment['cart']            = ['order_id' => $order->getOrderIdPlataform()];

        Log::debug('preparando request');

        $url = "{$this->getBaseUrl()}/payment/$sufixUrl";
        $response = $this->request( $url, "POST", $payment, "json", true);

        Log::debug('voltou request');

        $paymentData                        = new PaymentData();
        $paymentData->type                  = $order->typePayment;
        $paymentData->status                = 'PENDENTE';
        $paymentData->pay_reference         = $order->getOrderIdPlataform();
        $paymentData->pix_qrcode            = $response->data?->pix_qrcode ?? null;
        $paymentData->pix_emv               = $response->data?->pix_emv ?? null;
        $paymentData->pix_expiration        = $response->data?->pix_expiration_date ?? null;
        $paymentData->invoice_expiration    = $response->data?->due_date ?? null;
        $paymentData->invoice_digitable     = $response->data?->digitable_line ?? null;
        $paymentData->invoice_code          = $response->data?->boleto_payment_code ?? null;
        $paymentData->invoice_link          = $response->data?->pdf ?? null;

        return $paymentData;
    }

    private function generateTokenCard( array $card )
    {
        $data = [
            'access-token'          => $this->token,
            'card'      => [
                'number'            => $card['number'],
                'cvv'               => $card['cvv'],
                'month'             => (int)$card['expiration_month'],
                'year'              => (int)$card['expiration_year'],
                'name'              => $card['holder_name']
            ]
        ];

        $url = $this->getBaseUrl() . "/tokenize/card";
        $response = $this->request( $url, "POST", $data );

        return $response->data->token;
    }


    /**
     * Function to read webhook payment Authorized
     * @param $webhookData
     * @return array
     */
    public function checkStatusPayment($webhookData): array
    {
        $data = $webhookData['data'];
        $reference = $data['id'];

        $payment = Payment::where('payment_identifier',  $reference)->first(  );

        if( empty($payment) ){

            Log::debug('[ Appmax Webhook ] - Not found payment with this ID: ' . $data['id']);
            return ['status' => 'not_founded'];
        }

        return [
            'payment'   => $payment,
            'status'    =>  $data['status'] === "aprovado"
                ? "PAGO"
                : "RECUSADO"
        ];
    }
}
