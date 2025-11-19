<?php

namespace App\Http\Controllers;

use App\Classes\Payments\DocumentValidator;
use App\Http\Requests\payments\CreatePaymentRequest;
use App\Models\Payment;
use App\Models\UserProduct;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="PaymentRequest",
 *     type="object",
 *     @OA\Property(
 *         property="first_name",
 *         type="string",
 *         description="Nome do cliente",
 *         example="João"
 *     ),
 *     @OA\Property(
 *         property="last_name",
 *         type="string",
 *         description="Sobrenome do cliente",
 *         example="Silva"
 *     ),
 *     @OA\Property(
 *         property="phone",
 *         type="string",
 *         description="Telefone do cliente (com DDD)",
 *         example="11987654321",
 *         maxLength=15,
 *         minLength=15
 *     ),
 *     @OA\Property(
 *         property="email",
 *         type="string",
 *         description="E-mail do cliente",
 *         example="joao.silva@example.com",
 *         maxLength=255
 *     ),
 *     @OA\Property(
 *         property="document_type",
 *         type="string",
 *         description="Tipo do documento do cliente (CPF ou CNPJ)",
 *         example="cpf",
 *         enum={"cpf", "cnpj"}
 *     ),
 *     @OA\Property(
 *         property="document_number",
 *         type="string",
 *         description="Número do documento do cliente (CPF ou CNPJ)",
 *         example="12345678901"
 *     ),
 *     @OA\Property(
 *         property="order",
 *         type="array",
 *         description="Detalhes do pedido",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(
 *                 property="product_id",
 *                 type="string",
 *                 description="ID do produto (curso, extra ou mentoria)",
 *                 example="1"
 *             ),
 *             @OA\Property(
 *                 property="discount_value",
 *                 type="number",
 *                 description="Valor do desconto",
 *                 example=20.00
 *             ),
 *             @OA\Property(
 *                 property="shipping_value",
 *                 type="number",
 *                 description="Valor do frete",
 *                 example=10.00
 *             ),
 *             @OA\Property(
 *                 property="type_payment",
 *                 type="string",
 *                 description="Tipo de pagamento",
 *                 enum={"credit_card", "invoice", "pix"},
 *                 example="credit_card"
 *             ),
 *             @OA\Property(
 *                 property="type_product",
 *                 type="string",
 *                 description="Tipo de produto",
 *                 enum={"course", "extra", "mentorship"},
 *                 example="course"
 *             )
 *         )
 *     ),
 *     @OA\Property(
 *         property="card",
 *         type="object",
 *         description="Detalhes do cartão de crédito",
 *         @OA\Property(
 *             property="number",
 *             type="string",
 *             description="Número do cartão",
 *             example="4111111111111111",
 *             maxLength=16,
 *             minLength=16
 *         ),
 *         @OA\Property(
 *             property="cvv",
 *             type="string",
 *             description="Código de segurança do cartão",
 *             example="123",
 *             maxLength=3,
 *             minLength=3
 *         ),
 *         @OA\Property(
 *             property="expiration_month",
 *             type="string",
 *             description="Mês de validade do cartão",
 *             example="12",
 *             maxLength=2,
 *             minLength=2
 *         ),
 *         @OA\Property(
 *             property="expiration_year",
 *             type="string",
 *             description="Ano de validade do cartão",
 *             example="23",
 *             maxLength=2,
 *             minLength=2
 *         ),
 *         @OA\Property(
 *             property="holder_document_number",
 *             type="string",
 *             description="Número do documento do titular do cartão (CPF ou CNPJ)",
 *             example="12345678901",
 *             minLength=11,
 *             maxLength=14
 *         ),
 *         @OA\Property(
 *             property="holder_name",
 *             type="string",
 *             description="Nome do titular do cartão",
 *             example="João Silva"
 *         ),
 *         @OA\Property(
 *             property="installments",
 *             type="integer",
 *             description="Número de parcelas do pagamento",
 *             example=6,
 *             minimum=1,
 *             maximum=12
 *         )
 *     ),
 *     @OA\Property(
 *         property="address",
 *         type="object",
 *         description="Detalhes do endereço de cobrança",
 *         @OA\Property(
 *             property="postcode",
 *             type="string",
 *             description="CEP do endereço",
 *             example="12345678",
 *             minLength=8,
 *             maxLength=8
 *         ),
 *         @OA\Property(
 *             property="street",
 *             type="string",
 *             description="Rua do endereço",
 *             example="Rua das Flores"
 *         ),
 *         @OA\Property(
 *             property="number",
 *             type="string",
 *             description="Número do endereço",
 *             example="123"
 *         ),
 *         @OA\Property(
 *             property="complement",
 *             type="string",
 *             description="Complemento do endereço (opcional)",
 *             example="Apto 101"
 *         ),
 *         @OA\Property(
 *             property="district",
 *             type="string",
 *             description="Bairro do endereço",
 *             example="Centro"
 *         ),
 *         @OA\Property(
 *             property="city",
 *             type="string",
 *             description="Cidade do endereço",
 *             example="São Paulo"
 *         ),
 *         @OA\Property(
 *             property="state",
 *             type="string",
 *             description="Estado do endereço",
 *             example="SP",
 *             maxLength=2
 *         )
 *     )
 * )
 */


class PaymentController extends Controller
{

    /**
     * @OA\Post(
     *     path="/payments/create",
     *     summary="Cria um novo pagamento",
     *     operationId="createPayment",
     *     tags={"Payments"},
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 type="object",
     *                 required={"first_name", "last_name", "phone", "email", "document_type", "document_number", "order", "card", "address"},
     *                 @OA\Property(property="first_name", type="string"),
     *                 @OA\Property(property="last_name", type="string"),
     *                 @OA\Property(property="phone", type="string", maxLength=15, minLength=15),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="document_type", type="string", enum={"cpf", "cnpj"}),
     *                 @OA\Property(property="document_number", type="string"),
     *                 @OA\Property(
     *                     property="order",
     *                     type="object",
     *                     required={"product_id", "discount_value", "shipping_value", "type_payment", "type_product"},
     *                     @OA\Property(property="product_id", type="integer"),
     *                     @OA\Property(property="discount_value", type="number", format="float"),
     *                     @OA\Property(property="shipping_value", type="number", format="float"),
     *                     @OA\Property(property="type_payment", type="string", enum={"credit_card", "invoice", "pix"}),
     *                     @OA\Property(property="type_product", type="string", enum={"course", "extra", "mentorship"})
     *                 ),
     *                 @OA\Property(
     *                     property="card",
     *                     type="object",
     *                     @OA\Property(property="number", type="string", minLength=16, maxLength=16),
     *                     @OA\Property(property="cvv", type="string", minLength=3, maxLength=3),
     *                     @OA\Property(property="expiration_month", type="string", minLength=2, maxLength=2),
     *                     @OA\Property(property="expiration_year", type="string", minLength=2, maxLength=2),
     *                     @OA\Property(property="holder_document_number", type="string", minLength=11, maxLength=14),
     *                     @OA\Property(property="holder_name", type="string"),
     *                     @OA\Property(property="installments", type="integer", minimum=1, maximum=12)
     *                 ),
     *                 @OA\Property(
     *                     property="address",
     *                     type="object",
     *                     required={"postcode", "street", "number", "district", "city", "state"},
     *                     @OA\Property(property="postcode", type="string", minLength=8, maxLength=8),
     *                     @OA\Property(property="street", type="string"),
     *                     @OA\Property(property="number", type="string"),
     *                     @OA\Property(property="complement", type="string"),
     *                     @OA\Property(property="district", type="string"),
     *                     @OA\Property(property="city", type="string"),
     *                     @OA\Property(property="state", type="string", maxLength=2)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Pagamento criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="success"),
     *             @OA\Property(property="payment_id", type="integer", example=123)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro inesperado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Ocorreu um erro inesperado")
     *         )
     *     )
     * )
     */
    public function createPayment(CreatePaymentRequest $request): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $params = $request->validated();
            $params['ip'] = $request->ip();
            $user = $request->user();

            // Validar se usuário está autenticado
            if (!$user) {
                return response()->json([
                    'error' => 'Usuário não autenticado'
                ], 401);
            }

            // Validar tipo de produto
            $validProductTypes = ['course', 'extra', 'mentorship'];
            if (!in_array($params['order']['type_product'], $validProductTypes)) {
                return response()->json([
                    'error' => 'Tipo de produto inválido'
                ], 400);
            }

            // Obter coluna do produto
            try {
                $productColumnId = UserProduct::getProductColumn($params['order']['type_product']);
            } catch (Exception $e) {
                Log::error("[PaymentController] Invalid product type: " . $e->getMessage());
                return response()->json([
                    'error' => 'Tipo de produto inválido'
                ], 400);
            }

            // Verificar se usuário já possui o produto
            $userProduct = UserProduct::where($productColumnId, $params['order']['product_id'])
                ->where('user_id', $user->id)
                ->first();

            if ($userProduct) {
                return response()->json([
                    'error' => 'Você já possui este produto'
                ], 403);
            }

            // Validar documento
            if (!DocumentValidator::validate($params['document_number'], $params['document_type'])) {
                return response()->json([
                    'error' => 'O número do documento informado é inválido'
                ], 400);
            }

            // Validar documento do titular do cartão (se aplicável)
            if (
                $params['order']['type_payment'] === 'credit_card' && 
                isset($params['card']['holder_document_number'])
            ) {
                if (!DocumentValidator::validate($params['card']['holder_document_number'], 'cpf')) {
                    return response()->json([
                        'error' => 'O CPF do titular do cartão é inválido'
                    ], 400);
                }
            }

            // Criar pagamento
            $payment = new Payment();
            
            try {
                $paymentId = $payment->createNewPayment($params, $user->id);
            } catch (GuzzleException $e) {
                Log::error("[PaymentController] Guzzle error: " . $e->getMessage());
                
                // Erros específicos de gateway
                if (strpos($e->getMessage(), 'Connection') !== false) {
                    throw new Exception('Erro de conexão com o processador de pagamento. Tente novamente.');
                }
                
                throw new Exception('Erro ao processar pagamento no gateway');
            }

            DB::commit();

            return response()->json([
                'message' => 'success',
                'payment_id' => $paymentId
            ], 201);

        } catch (Exception $e) {
            DB::rollback();

            Log::error("[PaymentController::createPayment] Error: " . $e->getMessage() . " | Line: " . $e->getLine() . " | File: " . $e->getFile());

            if ($e instanceof \GuzzleHttp\Exception\ClientException && $e->hasResponse()) {
                $response = json_decode($e->getResponse()->getBody()->getContents(), true);

                if (isset($response['text'])) {
                    $errorMessage = $response['text']; // mensagem REAL do gateway
                    $statusCode = 400;
                }
            }

            // Determinar tipo de erro e retornar mensagem apropriada
            $errorMessage = 'Não foi possível processar o pagamento. Por favor, tente novamente.';
            $statusCode = 500;

            // Erros conhecidos
            if (strpos($e->getMessage(), 'gateway') !== false) {
                $errorMessage = 'Erro ao comunicar com o processador de pagamento. Tente novamente em alguns instantes.';
            } elseif (strpos($e->getMessage(), 'App checkout not found') !== false) {
                $errorMessage = 'Sistema de pagamento não configurado. Entre em contato com o suporte.';
                $statusCode = 503;
            } elseif (strpos($e->getMessage(), 'Product not found') !== false) {
                $errorMessage = 'Produto não encontrado';
                $statusCode = 404;
            } elseif (strpos($e->getMessage(), 'Customer') !== false) {
                $errorMessage = 'Erro ao processar informações do cliente. Verifique os dados e tente novamente.';
                $statusCode = 400;
            }

            return response()->json([
                'error' => $errorMessage
            ], $statusCode);
        }
    }

    /**
     * @OA\Get(
     *     path="/payments/{payment_id}",
     *     summary="Obtém os dados de um pagamento específico",
     *     operationId="getPaymentData",
     *     tags={"Payments"},
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="payment_id",
     *         in="path",
     *         description="ID do pagamento",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dados do pagamento",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="status", type="string"),
     *                 @OA\Property(property="type", type="string"),
     *                 @OA\Property(property="pix_code", type="string"),
     *                 @OA\Property(property="pix_qrcode", type="string"),
     *                 @OA\Property(property="pix_expiration", type="string"),
     *                 @OA\Property(property="invoice_digitable", type="string"),
     *                 @OA\Property(property="invoice_code", type="string"),
     *                 @OA\Property(property="invoice_link", type="string"),
     *                 @OA\Property(property="invoice_expiration", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pagamento não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="O pagamento não existe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Você não tem permissão para acessar esta página")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro inesperado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Ocorreu um erro inesperado")
     *         )
     *     )
     * )
     */
    public function getPaymentData(Request $request, $payment_id): \Illuminate\Http\JsonResponse
    {
        try {

            $payment = Payment::find($payment_id);

            if (empty($payment))
                return response()->json(['error' => "The payment does not exist"], 404);

            if ($payment->customer->user_id != $request->user()->id)
                return response()->json(['error' => "You do not have permission to access this page"], 403);

            return response()->json([
                'message'       => 'success',
                'data'          => [
                    'status'                => $payment->status,
                    'type'                  => $payment->type,
                    'pix_code'              => $payment->pix_code,
                    'pix_qrcode'            => $payment->pix_qrcode,
                    'pix_expiration'        => $payment->pix_expiration,
                    'invoice_digitable'     => $payment->invoice_digitable,
                    'invoice_code'          => $payment->invoice_code,
                    'invoice_link'          => $payment->invoice_link,
                    'invoice_expiration'    => $payment->invoice_expiration,
                ]
            ]);
        } catch (\Exception $e) {

            Log::error("[PaymentController]: " . $e->getMessage());

            return response()->json([
                'error' => "An unexpected error has occurred"
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/payments/{app_id}/status",
     *     summary="Atualiza o status de um pagamento via webhook",
     *     operationId="updateStatusPayment",
     *     tags={"Payments"},
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="app_id",
     *         in="path",
     *         description="Nome do aplicativo que está enviando a notificação",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 type="object",
     *                 additionalProperties=true
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Status de pagamento atualizado com sucesso"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro inesperado",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Ocorreu um erro inesperado")
     *         )
     *     )
     * )
     */
    public function updateStatusPayment(Request $request, $app_id): void
    {
        DB::beginTransaction();
        try {

            // TODO: Implement Whitelist to receive comunications
            Log::debug("[Webhook] - Comunication received");

            $params = $request->all();

            $payment = new Payment();
            $payment->changeStatusPayment($params, $app_id);

            DB::commit();
        } catch (\Exception $e) {

            DB::rollback();

            Log::error("[PaymentController - Webhook]: " . $e->getMessage() . " | " . $e->getLine());
        }
    }
}
