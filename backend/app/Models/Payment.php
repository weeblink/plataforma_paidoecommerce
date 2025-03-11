<?php

namespace App\Models;

use App\Classes\Payments\Apps\Appmax\Appmax;
use App\Classes\Payments\Apps\Asaas\Asaas;
use App\Classes\Payments\DocumentValidator;
use App\Classes\Payments\PaymentData;
use App\Jobs\SendEmailJob;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class Payment extends Model
{
    use HasFactory;

    public $timestamps = true;
    public $incrementing = true;

    protected $table = 'payments';
    protected $primaryKey = 'id';

    protected $fillable = [
        'status',
        'customer_id',
        'order_id',
        'checkout_id',
        'payment_identifier',
        'type',
        'pix_code',
        'pix_qrcode',
        'pix_expiration',
        'invoice_digitable',
        'invoice_code',
        'invoice_link',
        'invoice_expiration'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $maxId = self::max('id') ?? 0;
            $model->id = $maxId + 1;
        });
    }

    public function customer(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CustomerModel::class, 'id', 'customer_id');
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Order::class, 'id', 'order_id');
    }

    public function checkout(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CredentialsCheckout::class, 'id', 'checkout_id');
    }

    /**
     * @param array $data
     * @param $userId
     * @return int
     * @throws GuzzleException
     * @throws Exception
     */
    public function createNewPayment(array $data, $userId): int
    {
        // TODO: Implementar lógica para múltiplos apps de checkout
        $appCheckout = CredentialsCheckout::first();

        if (empty($appCheckout))
            throw new Exception("App checkout not found");

        $data['order']['products_value'] = $this->getProductValue(
            $data['order']['product_id'],
            $data['order']['type_product'],
        );

        $app        = $this->getInstanceApp($appCheckout);
        $customer   = $this->createCustomer($data, $userId);
        $order      = $this->createOrder($data['order'], $customer);

        $pData = $app->makePayment($order, $customer, $data['card']);

        $payment = self::create([
            'status' => $pData->status,
            'customer_id' => $customer->id,
            'order_id' => $order->id,
            'checkout_id' => $appCheckout->id,
            'payment_identifier' => $pData->pay_reference,
            'type' => $pData->type,
            'pix_code' => $pData->pix_emv,
            'pix_qrcode' => $pData->pix_qrcode,
            'pix_expiration' => $pData->pix_expiration,
            'invoice_digitable' => $pData->invoice_digitable,
            'invoice_code' => $pData->invoice_code,
            'invoice_link' => $pData->invoice_link,
            'invoice_expiration' => $pData->invoice_expiration,
        ]);

        if (!$payment) {
            throw new Exception("An error occurred while saving payment");
        }

        if ($pData->type === "pix" || $pData->type === "invoice") {
            $this->sendPaymentEmail($pData, $customer);
        }

        return $payment->id;
    }

    private function sendPaymentEmail(PaymentData $pData, CustomerModel $customer): void
    {
        $details = [
            'subject'       => "A sua compra está esperando por você!",
            'message'       => "Olá, {$customer->email}! A compra do seu produto está esperando por você em nossa plataforma. Pra poder finalizar o seu pagamento basta seguir os passos abaixo.",
            'viewName'      => 'mail.payment',
            'pData'         => $pData,
            'mail'          => $customer->email,
            'username'      => $customer->first_name
        ];

        Log::debug("[Email Payment] - Sending email payment remember");
        SendEmailJob::dispatch($details);
    }

    /**
     * Function to get Course Value
     * @param string $productId
     * @param string $typeProduct
     * @return float
     * @throws Exception
     */
    private function getProductValue(string $productId, string $typeProduct): float
    {
        $productMap = [
            'mentorship'    => MentorshipGroup::class,
            'course'        => Courses::class,
            'extra'         => Extra::class,
        ];

        if (!array_key_exists($typeProduct, $productMap)) {
            throw new InvalidArgumentException("Invalid product type: {$typeProduct}");
        }

        $product = $productMap[$typeProduct]::find($productId);

        if( ! $product )
            throw new ModelNotFoundException("Product not found with ID: {$productId}");

        return ( $product instanceof MentorshipGroup)
            ? ( $product->price_promotional ?? $product->price )
            : ( $product->promotional_price ?? $product->price );
    }

    /**
     * Function to convert float value to cents
     * @param float $price
     * @return int
     */
    private function convertToCents(float $price): int
    {
        return intval($price * 100);
    }

    /**
     * Function to create new Order
     * @param array $order
     * @param CustomerModel $customer
     * @return Order
     * @throws Exception
     */
    private function createOrder(array $order, CustomerModel $customer): Order
    {
        $order['customer_id'] = $customer->id;
        $order['discount_value'] = $this->convertToCents($order['discount_value']);
        $order['shipping_value'] = $this->convertToCents($order['shipping_value']);
        $order['products_value'] = $this->convertToCents($order['products_value']);

        $orderModel = new Order($order);

        if (!$orderModel->save())
            throw new Exception("Order not saved");

        return $orderModel;
    }

    /**
     * Function to create customer with data request
     * @param array $data
     * @param $userId
     * @return CustomerModel
     * @throws Exception
     */
    private function createCustomer(array $data, $userId): CustomerModel
    {

        if( ! DocumentValidator::validate( $data['document_number'], $data['document_type'] ) )
            throw new Exception("Invalid CPF");

        $customer = new CustomerModel(
            $this->getSerializedCustomer([...$data, 'user_id' => $userId])
        );

        if (!$customer->save())
            throw new Exception("Unable to create customer");

        return $customer;
    }

    /**
     * Function to get data from customer serialized
     * @param array $data
     * @return array
     */
    private function getSerializedCustomer(array $data): array
    {
        $data = array_merge($data, $data['address']);
        unset($data['address']);
        return $data;
    }

    /**
     * Function to get instance of class from app checkout
     * @param CredentialsCheckout $credentials
     * @return Appmax | Asaas
     * @throws Exception
     */
    private function getInstanceApp(CredentialsCheckout $credentials): Appmax | Asaas
    {
        $instances = [
            'appmax'    => Appmax::class,
            'asaas'     => Asaas::class
        ];

        $className = $instances[$credentials->app_id] ?? null;

        if (!$className) {
            throw new Exception("App checkout not found");
        }

        return new $className(
            $credentials->id,
            $credentials->app_id,
            $credentials->app_name,
            $credentials->cliente_secret,
            $credentials->cliente_id,
            $credentials->expires_in,
            $credentials->token,
            $credentials->api_key
        );
    }

    /**
     * @throws Exception
     */
    public function checkPayment($dataPayment): void
    {
        Log::debug(json_encode($dataPayment));

        // Checar se o cliente existe na base de dados
        $customer = User::where('email', $dataPayment['client_email'])->first();

        if (empty($customer)) throw new Exception("Customer email is not in our database");

        // Checar se produto existe na base de dados
        $product = null;
        if ($dataPayment["type_product"] == "course") {
            $product = Courses::where('hs_identifier', $dataPayment['product_id'])->first();
        }

        if ($dataPayment["type_product"] == "extra") {
            $product = Extra::where('hs_identifier', $dataPayment['product_id'])->first();
        }

        if ($dataPayment["type_product"] == "mentorship") {
            $product = Mentorship::where('hs_identifier', $dataPayment['product_id'])->first();
        }

        if (empty($product)) throw new Exception("Product is not in our database");

        // Formatar status do pagamento
        $statusPayment = [
            'paid'      => "PAGO",
            'refused'   => "RECUSADO",
            'error'     => "RECUSADO",
            'refunded'  => "RECUSADO",
            'chargeback' => "RECUSADO",
            'overdue'   => "RECUSADO"
        ];

        $status = $statusPayment[$dataPayment['payment_status']];

        if ($status === "RECUSADO") {
            $productColumnId = UserProduct::getProductColumn($dataPayment['order']['type_product']);

            $userProduct = UserProduct::where('user_id', $customer->id)
                ->where($productColumnId, $product->id)
                ->first();

            if (!empty($userProduct)) {
                $product->removeStudent();
                $userProduct->delete();
            }
        }

        $paymentExists = Payment::where('plataform_pay_id', $dataPayment['payment_id'])->first();
        $payment = empty($paymentExists) ?  new Payment() : $paymentExists;

        // Salvar registro
        $payment->status = $status;
        $payment->plataform_pay_id = $dataPayment['payment_id'];

        if (! $payment->save())
            throw new Exception("An error occured while saving payment");

        // Liberar curso para usuário
        if ($status === "PAGO") {
            $newUserProduct = new UserProduct();
            $newUserProduct->addNew($customer->id, $dataPayment['type_product'], $product->id, $payment->id);
        }
    }

    /**
     * Function to change status with data from webhook
     * @param $data
     * @param string $app_name
     * @return void
     * @throws Exception
     */
    public function changeStatusPayment($data, string $app_id): void
    {
        $credentials = CredentialsCheckout::where('app_id', $app_id)->first();

        if (!$credentials) throw new Exception("App checkout not found");

        $appCheckout = $this->getInstanceApp($credentials);

        $arrStatus = $appCheckout->checkStatusPayment($data);

        if ($arrStatus['status'] !== "not_founded") {

            $payment = $arrStatus['payment'];
            $payment->status = $arrStatus['status'];

            if (!$payment->save())
                throw new Exception("An error occured while saving payment");

            if ($payment->status === "PAGO") {

                Log::debug("[Customer Pay] - " . $payment->customer->first_name . " | " . $payment->id);

                $this->unlockProduct($payment);
                $this->sendUnlockEmail($payment->customer, $payment->order, $payment->order->user_product);

                if( $payment->order->type_product == "mentorship" ){

                    $whatGroup = new WhatsappGroups();
                    $whatGroup->handleGroupOrder( $payment );
                }
            }
        }
    }

    /**
     * Function to unlock product for user
     * @param Payment $payment
     * @return void
     * @throws Exception
     */
    private function unlockProduct(Payment $payment): void
    {
        $newUserProduct = new UserProduct();
        $productType = $payment->order->type_product;

        Log::debug("{$this->getProductTypeColumn($productType)} -> {$payment->order->product_id}");

        $newUserProduct->fill([
            'user_id'       => $payment->customer->user->id,
            'payment_id'    => $payment->id,
            'type_product'  => $payment->order->type_product,
            $this->getProductTypeColumn($productType)   => $payment->order->product_id,
        ]);

        if (!$newUserProduct->save())
            throw new Exception("An error occured while saving user courses");
    }

    /**
     * Function to get column name of table user product
     * @param string $type
     * @return string
     */
    private function getProductTypeColumn( string $type ): string
    {
        $productColumns = [
            'course' => 'course_id',
            'extra' => 'extra_id',
            'mentorship' => 'group_id'
        ];

        if (!isset($productColumns[$type])) {
            throw new \InvalidArgumentException("Invalid product type: {$type}");
        }

        return $productColumns[$type];
    }

    /**
     * Function to send email when payment is authorized
     * @param CustomerModel $customer
     * @param Order $order
     * @return void
     */
    private function sendUnlockEmail(CustomerModel $customer, Order $order): void
    {
        $details = [
            'subject'       => "Pagamento recebido com sucesso!",
            'message'       => "Olá, {$customer->first_name}! O pagamento da sua compra foi recebido com sucesso e seu acesso ao produto já foi liberado em nossa plataforma! Por favor, acesse a plataforma para verificar os novos conteúdos desbloqueados",
            'viewName'      => 'mail.payment-received',
            'order'         => $order,
            'customer'      => $customer,
            'mail'          => $customer->email,
            'username'      => $customer->first_name
        ];

        Log::debug("[Email Payment Received] - Sending email payment received");
        SendEmailJob::dispatch($details);
    }
}
