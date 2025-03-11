<?php

namespace App\Http\Controllers;

use App\Models\UserProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="UserProductRequest",
 *     type="object",
 *     @OA\Property(
 *         property="user_id",
 *         type="string",
 *         description="ID do usuário",
 *     ),
 *  )
 */

class UserProductController extends Controller
{

    /**
     * @OA\Get(
     *     path="/user/{id}/products",
     *     tags={"User"},
     *     summary="Get user's products",
     *     description="Retrieve a list of products associated with the user.",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Products retrieved successfully",
     *        @OA\JsonContent(
     *            @OA\Property(
     *                property="products",
     *                type="array",
     *                @OA\Items(
     *                    @OA\Property(property="id", type="integer", example=1),
     *                    @OA\Property(property="name", type="string", example="Product Name"),
     *                    @OA\Property(property="price", type="number", format="float", example=99.99)
     *                )
     *            )
     *        )
     *     )
     * )
     */
    public function getUserProducts($id): \Illuminate\Http\JsonResponse
    {
        try {
            $userProducts = UserProduct::query()
                ->leftJoin('courses', 'user_products.course_id', '=', 'courses.id')
                ->leftJoin('mentorships', 'user_products.mentorship_id', '=', 'mentorships.id')
                ->leftJoin('extras', 'user_products.extra_id', '=', 'extras.id')
                ->where('user_products.user_id', $id)
                ->get([
                    "user_products.type_product",
                    DB::raw("COALESCE(courses.title, mentorships.title, extras.title) as name"),
                    'user_products.id',
                ]);

            if ($userProducts->isEmpty()) {
                return response()->json([
                    'message' => 'No products found for the user.',
                    'data' => [],
                ]);
            }

            $dataResponse = $userProducts->map(function ($product) {
                return [
                    'product_id' => $product->id,
                    'product_type' => $product->type_product,
                    'name' => $product->name,
                ];
            });

            return response()->json([
                'message' => 'Success data products',
                'data' => $dataResponse,
            ]);
        } catch (\Exception $e) {
            Log::Info("Error: {$e->getMessage()}");
            return response()->json([
                'error' => "An unexpected error occurred"
            ], 500);
        }
    }
}
