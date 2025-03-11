<?php

namespace App\Http\Controllers;

use App\Models\Extra;
use App\Models\UserProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="ExtraExibition",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="price",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="promotional_price",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="file_url",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="is_locked",
 *         type="boolean"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string"
 *     ),
 *     example={"id": "1", "title": "Curso de PHP", "price": 100, "promotional_price": 50, "image_url": "http://localhost:8000/storage/banners/banner1.jpg", "file_url": "http://localhost:8000/storage/files/file1.pdf", "created_at": "2021-08-01 00:00:00"}
 * )
 */

class ExtraController extends Controller
{
    /**
     * @OA\Get(
     *     path="/extras/{id}/payment",
     *     tags={"Extras"},
     *     summary="Get extra product payment data",
     *     description="Retrieves payment information for a specific extra product if the user doesn't already have access",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Extra Product ID",
     *         @OA\Schema(
     *             type="integer",
     *             format="int64"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="success"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="Payment data for the extra product"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="User already has access",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="User already has access to this extra product"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Extra not found",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="Extra not found"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="An unexpected error occurred"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function getExtraPaymentData(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $extra = Extra::find($id);

            if (empty($extra))
                return response()->json(['error' => "Extra not found"], 404);

            $userProduct = UserProduct::where('extra_id', $id)->where('user_id', $request->user()->id)->first();
            if ($userProduct)
                return response()->json(['error' => "User already has access to this extra product"], 400);

            return response()->json([
                'message'       => "success",
                'data'          => Extra::getPaymentData($extra)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/extras",
     *     tags={"Extras"},
     *     summary="List all extra products",
     *     description="Retrieves all extra products available for the authenticated user",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved products",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Products founded successfully"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 description="List of extra products",
     *                 @OA\Items(
     *                     type="object"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="An unexpected error occurred"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function listAll(Request $request): \Illuminate\Http\JsonResponse
    {
        try {

            return response()->json([
                'message'       => "Products founded successfully",
                'data'          => Extra::getExtraProducts($request->user()->id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/extras/{id}/get-file",
     *     tags={"Extras"},
     *     summary="Download extra product file",
     *     description="Downloads the file associated with a specific extra product for the authenticated user",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the extra product",
     *         @OA\Schema(
     *             type="integer",
     *             format="int64"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved file",
     *         @OA\MediaType(
     *             mediaType="application/pdf",
     *             @OA\Schema(
     *                 type="string",
     *                 format="binary"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User hasn't purchased the product",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="O usuário ainda não comprou o produto"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad Request - Invalid file path format",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="Formato do caminho do arquivo inválido"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found - File does not exist"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="An unexpected error occurred"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function getFile(Request $request, $id): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        try {

            $userProduct = UserProduct::where('user_id', $request->user()->id)->where('extra_id', $id)->first();

            if (empty($userProduct))
                return response()->json(['error' => "O usuário ainda não comprou o produto"], 403);

            $filePath = explode('extras/files/', $userProduct->extra->file_url);
            if (count($filePath) !== 2) {
                return response()->json([
                    'error' => "Formato do caminho do arquivo inválido"
                ], 400);
            }

            $path = storage_path('app/public/products/extras/files/' . $filePath[1]);

            if (!File::exists($path))
                abort(404);

            return response()->file($path, [
                'Content-Type' => 'application/pdf',
                'Access-Control-Allow-Origin' => '*',
            ]);
        } catch (\Exception $e) {

            Log::error("[ Extra Controller Error ] -> {$e->getMessage()}");

            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/extras/{id}",
     *     tags={"Extras"},
     *     summary="Get specific extra product",
     *     description="Retrieves a specific extra product for the authenticated user",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the extra product",
     *         @OA\Schema(
     *             type="integer",
     *             format="int64"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved product",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Extra products founded successfully"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="Extra product details",
     *                 ref="#/components/schemas/ExtraExibition"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User hasn't purchased the product",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="O usuário ainda não comprou o produto"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="An unexpected error occurred"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function listOne(Request $request, $id): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        try {

            $userProduct = UserProduct::where('user_id', $request->user()->id)->where('extra_id', $id)->first();

            if (empty($userProduct))
                return response()->json(['error' => "O usuário ainda não comprou o produto"], 403);

            return response()->json([
                'message'       => "Extra products founded successfully",
                'data'          => $userProduct->extra
            ]);
        } catch (\Exception $e) {

            Log::error("[ Extra Controller Error ] -> {$e->getMessage()}");

            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }
}
