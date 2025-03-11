<?php

namespace App\Http\Controllers;

use App\Http\Requests\connections\CreateConnectionRequest;
use App\Models\Connections;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ConnectionsController extends Controller
{
    /**
     * @OA\Post(
     *     path="/connections",
     *     tags={"Connections"},
     *     summary="Create a new connection",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="My Connection")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="connection_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(
     *                     property="name",
     *                     type="array",
     *                     @OA\Items(type="string", example="The name field is required.")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error has occurred.")
     *         )
     *     )
     * )
     */
    public function create( CreateConnectionRequest $request ): \Illuminate\Http\JsonResponse
    {
        try{

            $existingConnections = Connections::all();

            if( count( $existingConnections ) > 0 )
                return response()->json(['error'    => "Você só pode ter 1 conexão vinculada por vez"], 400);

            $connection = Connections::createNew( $request->name );

            return response()->json([
                'success' => true,
                'connection_id' => $connection->id
            ]);

        }catch(\Exception $e){

            Log::error("[CONNECTION CONTROLLER ERROR]: {$e->getMessage()}");

            return response()->json([
                'error'    => "An unexpected error has occurred."
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/connections",
     *     tags={"Connections"},
     *     summary="List all connections",
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="My Connection")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error has occurred.")
     *         )
     *     )
     * )
     */
    public function listAll( Request $request ): \Illuminate\Http\JsonResponse
    {
        try{

            return response()->json([
                'status'        => 'success',
                'data'   => Connections::listAll()
            ]);

        }catch(\Exception $e){
            Log::error("[CONNECTION CONTROLLER ERROR]: {$e->getMessage()}");

            return response()->json([
                'error'    => "An unexpected error has occurred."
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/connections/{id}",
     *     tags={"Connections"},
     *     summary="Delete a specific connection",
     *     description="Deletes a connection from the database based on the provided ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the connection to delete",
     *         @OA\Schema(
     *             type="integer",
     *             format="int64",
     *             example=1
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Connection successfully deleted",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Connection deleted successfully"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Connection not found",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="Connection not found"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="An unexpected error has occurred."
     *             )
     *         )
     *     )
     * )
     */
    public function delete( Request $request, $id ): \Illuminate\Http\JsonResponse {
        try{

            $connection = Connections::find( $id );

            if( empty( $connection ) )
                return response()->json(['error' => 'Connection not found'], 404);

            $url = env("WS_WHATSAPP_URL") . "/connection/{$connection->id}/remove";
            $response = $this->requestWsWhatsapp( $url, "DELETE" );

            if( $response['status'] !== 'success' )
                throw new Exception("An unexpected error has occourred when try disconect socket");

            if( !$connection->delete() )
                throw new \Exception("An unexpected error has occurred.", 500);

            return response()->json([
                'message' => 'Connection deleted successfully'
            ]);

        }catch(\Exception $e){

            Log::error("[CONNECTION CONTROLLER ERROR]: {$e->getMessage()} | {$e->getLine()}");

            return response()->json([
                'error'    => "An unexpected error has occurred."
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/{id}/qr-code",
     *     tags={"Connections"},
     *     summary="Generate QR Code for a specific connection",
     *     description="Generates a QR code for a connection identified by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Connection ID",
     *         @OA\Schema(type="integer", format="int64")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="QR Code generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Qr Code generated correctly"),
     *             @OA\Property(property="qrcode", type="string", example="data:image/png;base64,...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Connection not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Connection not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error has occurred.")
     *         )
     *     )
     * )
     */
    public function getQrCode( Request $request, $id ): \Illuminate\Http\JsonResponse
    {
        try{

            $connection = Connections::find($id);

            if( empty( $connection ) )
                return response()->json(['error' => 'Connection not found'], 404);

            $data = $this->getQrCodeApi($connection);

            if( $data[ 'status' ] == 'error' )
                throw new Exception($data['error']);

            return response()->json([
                'message'    => "Qr Code generated correctly",
                'qrcode'     => $data['qrcode']
            ]);

        }catch (\Exception $e){
            Log::error("[CONNECTION CONTROLLER ERROR]: {$e->getMessage()}");

            return response()->json([
                'error'    => "An unexpected error has occurred."
            ], 500);
        } catch (GuzzleException $e) {
            Log::error("[CONNECTION CONTROLLER ERROR]: {$e->getMessage()}");

            return response()->json([
                'error'    => "An unexpected error has occurred."
            ], 500);
        }
    }

    /**
     * @param Connections $connection
     * @return mixed
     * @throws Exception
     */
    private function getQrCodeApi( Connections $connection ): mixed
    {
        $url = env("WS_WHATSAPP_URL") . "/connection/{$connection->id}/create-qrcode";

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . env("WS_WHATSAPP_TOKEN"),
                'Content-Type: application/json'
            ]
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if (curl_errno($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception($error);
        }

        curl_close($curl);

        Log::debug($response);

        $data = json_decode($response, true);

        return $data;
    }

    private function requestWsWhatsapp( $url, $method = 'POST', $data = null, $additionalOptions = [] )
    {
        $defaultOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . env("WS_WHATSAPP_TOKEN"),
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10
        ];

        switch (strtoupper($method)) {
            case 'GET':
                $defaultOptions[CURLOPT_HTTPGET] = true;
                break;
            case 'POST':
                $defaultOptions[CURLOPT_POST] = true;
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            case 'PUT':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'PUT';
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            case 'DELETE':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'DELETE';
                break;
            case 'PATCH':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'PATCH';
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            default:
                throw new \InvalidArgumentException("HTTP method '{$method}' not supported");
        }

        // Merge default options with additional options
        $curlOptions = $additionalOptions + $defaultOptions;

        $curl = curl_init();
        curl_setopt_array($curl, $curlOptions);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        if (curl_errno($curl)) {
            throw new \Exception(curl_error($curl));
        }

        $data = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to decode JSON response');
        }

        return $data;
    }
}
