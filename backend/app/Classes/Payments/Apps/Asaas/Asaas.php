<?php

namespace App\Classes\Payments\Apps\Asaas;

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

class Asaas extends Checkout implements AppCheckoutInterface 
{
    protected string $urlHomolog = "https://api-sandbox.asaas.com/v3";
    protected string $urlHomologAuth = "";

    protected string $urlDeploy = "https://api.asaas.com/v3";
    protected string $urlDeployAuth = "";

    protected string $mode = "dev";

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
            'name'                          => $client->firstName . " " . $client->lastName,
            'cpfCnpj'                       => $client->documentNumber,
            'email'                         => $client->email,
            'phone'                         => $client->phone,
            'mobilePhone'                   => $client->phone,
            'address'                       => $client->address->street,
            'addressNumber'                 => $client->address->number,
            'complement'                    => $client->address->complement,
            'province'                      => $client->address->district,
            'postalCode'                    => $client->address->postcode,
            'notificationDisabled'          => true,
        ];

        $url = $this->getBaseUrl() . "/customers";
        $response = $this->request( $url, "POST", $data, 'json', $this->api_key );
        $client->setClientIdPlataform( $response->id );

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
        // Não existe criação de order
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

        $asaasTypePayment = [
            'pix'           => "PIX",
            'invoice'       => "BOLETO",
            'credit_card'   => "CREDIT_CARD"
        ];

        $payment = [
            'customer'          => $client->getClientIdPlataform(),
            'billingType'       => $asaasTypePayment[$order->typePayment],
            'value'             => ($order->productsValue/100),
            'dueDate'           => now()->format('Y-m-d'),
            'remoteIp'          => $client->ip
        ];  

        if( $order->typePayment === 'credit_card' ){

            $card = $order->getCard();

            Log::debug($card);

            $payment['creditCard'] = [
                'holderName'        => $card['holder_name'],
                'number'            => $card['number'],
                'expiryMonth'       => $card['expiration_month'],
                'expiryYear'        => $card['expiration_year'],
                'ccv'               => $card['cvv']
            ];
        }

        Log::debug('preparando request');

        $url = "{$this->getBaseUrl()}/payments";
        $response = $this->request( $url, "POST", $payment, "json", $this->api_key);

        $url = "{$this->getBaseUrl()}/payments/{$response->id}/billingInfo";
        $paymentInfo = $this->request( $url, "GET", [], 'none', $this->api_key);

        Log::debug('voltou request');

        $paymentData                        = new PaymentData();
        $paymentData->type                  = $order->typePayment;
        $paymentData->status                = 'PENDENTE';
        $paymentData->pay_reference         = $response->id;
        $paymentData->pix_qrcode            = $paymentInfo->pix?->encodedImage ?? null;
        $paymentData->pix_emv               = $paymentInfo->pix?->payload ?? null;
        $paymentData->pix_expiration        = $paymentInfo->pix?->expirationDate ?? null;
        $paymentData->invoice_expiration    = null;
        $paymentData->invoice_digitable     = $paymentInfo->bankSlip?->barCode ?? null;
        $paymentData->invoice_code          = $paymentInfo->bankSlip?->nossoNumero ?? null;
        $paymentData->invoice_link          = $paymentInfo->bankSlip?->bankSlipUrl ?? null;

        return $paymentData;
    }

    /**
     * Function to read webhook payment Authorized
     * @param $webhookData
     * @return array
     */
    public function checkStatusPayment($webhookData): array
    {
        $data = $webhookData['payment'];
        $reference = $data['id'];

        $payment = Payment::where('payment_identifier',  $reference)->first(  );

        if( empty($payment) ){

            Log::debug('[ Appmax Webhook ] - Not found payment with this ID: ' . $data['id']);
            return ['status' => 'not_founded'];
        }

        return [
            'payment'   => $payment,
            'status'    =>  $webhookData['event'] === "PAYMENT_CONFIRMED"
                ? "PAGO"
                : "RECUSADO"
        ];
    }
}