<?php

namespace App\Http\Controllers;

use App\Http\Requests\mentorships\CreateOrUpdateMentorshipRequest;
use App\Models\Mentorship;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="MentoringCreateUpdate",
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string",
 *         format="binary",
 *         description="Image of the mentoring"
 *     ),
 *     example={"title": "Curso de PHP" }
 * )
 * @OA\Schema(
 *     schema="MentoringManagement",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string"
 *     ),
 *     example={"id": "1", "title": "Curso de PHP", "image_url": "http://localhost:8000/storage/banners/banner1.jpg", "created_at": "2021-08-01 00:00:00"}
 * )
 */
class MentoringManagementController extends Controller
{

    /**
     * @OA\Get(
     *     path="/mentoring-management",
     *     tags={"Mentoring Management"},
     *     summary="List all mentorings",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of mentorings",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MentoringManagement")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error"
     *     )
     * )
     */
    public function listAll()
    {
        try {
            $mentorship = Mentorship::all();
            return response()->json([
                'message' => 'success',
                'data' => $mentorship
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring-management",
     *     tags={"Mentoring Management"},
     *     summary="Create a new mentoring",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *           @OA\MediaType(
     *               mediaType="multipart/form-data",
     *               @OA\Schema(ref="#/components/schemas/MentoringCreateUpdate")
     *           )
     *      ),
     *     @OA\Response(
     *         response=201,
     *         description="Mentoring created"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error"
     *     )
     * )
     */
    public function create(CreateOrUpdateMentorshipRequest $request)
    {
        DB::beginTransaction();
        try {
            $mentorship = new Mentorship();
            $mentorship->createOrUpdateMentorship(
                $request->input('title'),
                $request->file('image_url'),
            );

            DB::commit();
            return response()->json([
                'message' => 'Mentorship created successfully',
                'data' => $mentorship
            ]);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring-management/{id}",
     *     tags={"Mentoring Management"},
     *     summary="Update a mentoring",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Mentorship ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\RequestBody(
     *          required=true,
     *           @OA\MediaType(
     *               mediaType="multipart/form-data",
     *               @OA\Schema(ref="#/components/schemas/MentoringCreateUpdate")
     *           )
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Mentoring updated"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error"
     *     )
     * )
     */
    public function update(CreateOrUpdateMentorshipRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $mentorship = Mentorship::find($id);
            $mentorship->createOrUpdateMentorship(
                $request->input('title'),
                $request->file('image_url'),
            );

            DB::commit();
            return response()->json([
                'message' => 'Mentorship updated successfully',
                'data' => $mentorship
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/mentoring-management/{id}",
     *     tags={"Mentoring Management"},
     *     summary="Delete a mentoring",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Mentorship ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Mentoring deleted"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error"
     *     )
     * )
     */
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $mentorship = Mentorship::find($id);
            $mentorship->delete();

            DB::commit();
            return response()->json([
                'message' => 'Mentorship deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
