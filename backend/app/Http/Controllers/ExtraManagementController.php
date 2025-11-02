<?php

namespace App\Http\Controllers;

use App\Http\Requests\extra_management\CreateOrUpdateExtraRequest;
use App\Models\Extra;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="ExtraCreateUpdate",
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
 *         type="string",
 *         format="binary",
 *         description="Image of the banner"
 *     ),
 *     @OA\Property(
 *         property="file_url",
 *         type="string",
 *         format="binary",
 *         description="File of the extra"
 *     ),
 *     example={"title": "Curso de PHP", "price": 100, "promotional_price": 50}
 * )
 * @OA\Schema(
 *     schema="ExtraManagement",
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
 *         property="created_at",
 *         type="string"
 *     ),
 *     example={"id": "1", "title": "Curso de PHP", "price": 100, "promotional_price": 50, "image_url": "http://localhost:8000/storage/banners/banner1.jpg", "file_url": "http://localhost:8000/storage/files/file1.pdf", "created_at": "2021-08-01 00:00:00"}
 * )
 */

class ExtraManagementController extends Controller
{
    /**
     * @OA\Get(
     *     path="/extras-management",
     *     tags={"Extras"},
     *     summary="List all extras",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of extras",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/ExtraManagement")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server Error"
     *     )
     * )
     */
    public function listAll()
    {
        try {
            $extras = Extra::all();
            return response()->json([
                'message' => 'success',
                'data' => $extras
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    public function search( Request $request )
    {
        try {

            $extras = Extra::where('title', 'like', "%" . $request->query('q') . "%")->get();

            return response()->json([
                'message' => 'success',
                'data' => $extras
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/extras-management",
     *     tags={"Extras"},
     *     summary="Create a new extra",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(ref="#/components/schemas/ExtraCreateUpdate")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Extra created",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Extra created")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server Error"
     *     )
     * )
     */
    public function create(CreateOrUpdateExtraRequest $request)
    {
        DB::beginTransaction();
        try {
            $extra = new Extra();
            $extra->createOrUpdateExtra(
                $request->input('title'),
                $request->input('price'),
                $request->input('promotional_price'),
                $request->file('image_url'),
                $request->file('file_url')
            );

            DB::commit();
            return response()->json([
                'message' => 'Extra created successfully',
                'data' => $extra
            ]);
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/extras-management/{id}",
     *     tags={"Extras"},
     *     summary="Update an extra",
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
     *             @OA\Schema(ref="#/components/schemas/ExtraCreateUpdate")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Extra updated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Extra updated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server Error"
     *     )
     * )
     */
    public function update(CreateOrUpdateExtraRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $extra = Extra::find($id);
            if (!isset($extra)) {
                return response()->json(['error' => 'Extra not found'], 404);
            }

            $extra->createOrUpdateExtra(
                $request->input('title'),
                $request->input('price'),
                $request->input('promotional_price'),
                $request->file('image_url'),
                $request->file('file_url')
            );

            DB::commit();
            return response()->json([
                'message' => 'Extra updated successfully',
                'data' => $extra
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }


    /**
     * @OA\Delete(
     *     path="/extras-management/{id}",
     *     tags={"Extras"},
     *     summary="Delete an extra",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Extra deleted",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Extra deleted")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server Error"
     *     )
     * )
     */
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $extra = Extra::find($id);
            $extra->delete();
            DB::commit();
            return response()->json(['message' => 'Extra deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
