<?php

namespace App\Http\Controllers;

use App\Http\Requests\banners\CreateOrUpdateBannerRequest;
use App\Http\Requests\banners\SwapOrderBannerRequest;
use App\Models\Banner;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="BannerCreateUpdate",
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="alt",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string",
 *         format="binary",
 *         description="Image of the banner"
 *     ),
 *     @OA\Property(
 *         property="link_action",
 *         type="string"
 *     ),
 *     example={"title": "Curso de PHP", "alt": "Curso de PHP", "link_action": "http://localhost:8000/courses/1" }
 * )
 * @OA\Schema(
 *     schema="Banner",
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="alt",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="link_action",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="position",
 *         type="integer"
 *     ),
 *     example={"title": "Curso de PHP", "alt": "Curso de PHP", "image_url": "http://localhost:8000/storage/banners/banner1.jpg", "link_action": "http://localhost:8000/courses/1", "position": 1}
 * )
 */

class BannersController extends Controller
{

    /**
     * @OA\Get(
     *     path="/banners",
     *     tags={"Banners"},
     *     summary="List all banners",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Banner")
     *         ),
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Banner not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function listAll()
    {
        try {
            $banners = Banner::orderBy('position')->get();
            return response()->json([
                'message' => 'success',
                'data' => $banners
            ]);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/banners",
     *     tags={"Banners"},
     *     summary="Create a new banner",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *           @OA\MediaType(
     *               mediaType="multipart/form-data",
     *               @OA\Schema(ref="#/components/schemas/BannerCreateUpdate")
     *           )
     *      ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Banner created")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function create(CreateOrUpdateBannerRequest $request)
    {
        DB::beginTransaction();
        try {
            $banner = new Banner();
            $banner->createOrUpdateBanner(
                $request->input('title'),
                $request->input('alt'),
                $request->input('link_action'),
                $request->file('image_url'),
                $request->input('position')
            );

            DB::commit();
            return response()->json([
                'message' => 'Banner created successfully',
                'data' => $banner
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/banners/{id}",
     *     tags={"Banners"},
     *     summary="Update a banner",
     *     description="Update a banner",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Banner ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(ref="#/components/schemas/BannerCreateUpdate")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Banner updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Banner updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Banner not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function update(CreateOrUpdateBannerRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $banner = Banner::find($id);
            if (!$banner) {
                return response()->json(['error' => 'Banner not found'], 404);
            }

            $banner->createOrUpdateBanner(
                $request->input('title'),
                $request->input('alt'),
                $request->input('link_action'),
                $request->file('image_url'),
            );

            DB::commit();
            return response()->json([
                'message' => 'Banner updated successfully',
                'data' => $banner
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/banners/{id}",
     *     tags={"Banners"},
     *     summary="Delete a banner",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Banner ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Banner deleted")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Banner not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $banner = Banner::find($id);
            if (!$banner) {
                return response()->json(['error' => 'Banner not found'], 404);
            }

            Banner::rearrangePosition($banner->position);
            $banner->delete();
            DB::commit();
            return response()->json(['message' => 'Banner deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/banners/swap-order",
     *     tags={"Banners"},
     *     summary="Swap banner order",
     *     description="Swap banner order",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="banner1_id",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="banner2_id",
     *                     type="string"
     *                 ),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Banner order swapped successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Banner order swapped successfully")
     *        )
     *     )
     * )
     */
    public function swapOrder(SwapOrderBannerRequest $request): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();

        try {
            $banner1 = Banner::find($request->input('banner1_id'));
            $banner2 = Banner::find($request->input('banner2_id'));

            if (!$banner1 || !$banner2) {
                throw new \Exception("One or both banners not found.");
            }

            if (!$banner1->swapOrder($banner2)) {
                throw new \Exception("An error occurred while swapping banner order.");
            }

            DB::commit();

            return response()->json([
                'message' => "Banner order swapped successfully"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An unknown error occurred while updating banners.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
