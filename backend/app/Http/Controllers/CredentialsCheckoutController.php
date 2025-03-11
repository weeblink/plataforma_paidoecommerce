<?php

namespace App\Http\Controllers;

use App\Http\Requests\credentials_checkout\ConfigCredentialsCheckout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use \App\Models\CredentialsCheckout;
use Exception;

class CredentialsCheckoutController extends Controller
{
    /**
     * @OA\Post(
     *     path="/config",
     *     operationId="configureCredentials",
     *     tags={"Credentials"},
     *     summary="Configura credenciais de checkout",
     *     description="Recebe credenciais e as configura para o sistema de checkout",
     *     @OA\RequestBody(
     *         required=true,
     *         description="Dados de configuração das credenciais",
     *         @OA\JsonContent(
     *             required={"app_name", "app_id", "token", "cliente_id", "cliente_secret", "expires_in"},
     *             @OA\Property(property="app_name", type="string", description="Nome do aplicativo"),
     *             @OA\Property(property="app_id", type="string", description="ID do aplicativo"),
     *             @OA\Property(property="token", type="string", description="Token de autenticação"),
     *             @OA\Property(property="cliente_id", type="string", description="ID do cliente"),
     *             @OA\Property(property="cliente_secret", type="string", description="Segredo do cliente"),
     *             @OA\Property(property="expires_in", type="string", description="Tempo de expiração do token em segundos")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Credenciais salvas com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="credentials saved")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao configurar as credenciais",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while trying to check if credentials are correct.")
     *         )
     *     )
     * )
     */
    public function config( ConfigCredentialsCheckout $request ): \Illuminate\Http\JsonResponse
    {
        try{

            $credentials = new CredentialsCheckout([
                'app_name'          => $request->app_name,
                'app_id'            => $request->app_id,
                'token'             => $request->token ?: "-",
                'client_id'         => $request->cliente_id ?: "-",
                'client_secret'     => $request->cliente_secret ?: "-",
                'expires_in'        => $request->expires_in,
                'api_key'           => $request->api_key
            ]);

            $credentials->configCredentials();

            return response()->json([
                'message'   => 'credentials saved'
            ]);

        }catch(\Exception $e){

            Log::error("[CredentialsCheckout]: " . $e->getMessage());

            return response()->json([
                'error'     => "An error occured while trying to check if credentials are correct."
            ], 500);
        }
    }

    /**
     * List all credentials.
     *
     * @OA\Get(
     *     path="/",
     *     summary="List all credentials",
     *     description="return list of all credentials saved",
     *     operationId="listAllCredentials",
     *     tags={"Credentials"},
     *     @OA\Response(
     *         response=200,
     *         description="Credenciais listadas com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="credentials finded"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="app_name", type="string", example="MeuApp"),
     *                     @OA\Property(property="app_id", type="string", example="123456"),
     *                     @OA\Property(property="token", type="string", example="abcdef123456"),
     *                     @OA\Property(property="cliente_id", type="string", example="cliente123"),
     *                     @OA\Property(property="cliente_secret", type="string", example="secret123"),
     *                     @OA\Property(property="expires_in", type="string", example="2024-11-13 12:00:00")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao listar credenciais",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while trying to list all credentials.")
     *         )
     *     )
     * )
     */
    public function listAll( Request $request ): \Illuminate\Http\JsonResponse
    {
        try{

            return response()->json([
                'message'   => "credentials finded",
                'data'      => CredentialsCheckout::listAll(  )
            ]);

        }catch(\Exception $e){
            Log::error("[CredentialsCheckout]: " . $e->getMessage());

            return response()->json([
                'error'     => "An error occured while trying to list all credentials."
            ], 500);
        }
    }

    /**
     * List available checkout applications.
     *
     * @OA\Get(
     *     path="/available-checkouts",
     *     summary="List available checkout applications",
     *     description="Returns a list of all available checkout applications with their details",
     *     operationId="listAvailableCheckouts",
     *     tags={"Checkouts"},
     *     @OA\Response(
     *         response=200,
     *         description="Checkout applications found successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Checkouts apps finded"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="string", example="appmax"),
     *                     @OA\Property(property="name", type="string", example="AppMax"),
     *                     @OA\Property(property="image_url", type="string", format="uri", example="https://example.com/image.png"),
     *                     @OA\Property(property="is_active", type="boolean", example=true),
     *                     @OA\Property(property="is_selected", type="boolean", example=false)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error listing available checkout applications",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occured while trying to list all credentials.")
     *         )
     *     )
     * )
     */
    public function listAvailableCheckouts( Request $request ): \Illuminate\Http\JsonResponse
    {
        try{
            return response()->json([
                'message'   => "Checkouts apps finded",
                'data'      => CredentialsCheckout::getAvailableApps(  )
            ]);
        }catch(\Exception $e){
            Log::error("[CredentialsCheckout]: " . $e->getMessage());

            return response()->json([
                'error'     => "An error occured while trying to list all credentials."
            ], 500);
        }
    }

    public function getCredential( Request $request, $id ) : \Illuminate\Http\JsonResponse
    {
        try{

            if( !$id ) throw new Exception("For find credentials is necessary send app_id");

            return response()->json([
                'message'   => "Credentials finded",
                'data'      => CredentialsCheckout::getCredentialApp( $id )
            ]);
        }catch(\Exception $e){
            Log::error("[CredentialsCheckout]: " . $e->getMessage());

            return response()->json([
                'error'     => "An error occured while trying to list all credentials."
            ], 500);
        }
    }
}
