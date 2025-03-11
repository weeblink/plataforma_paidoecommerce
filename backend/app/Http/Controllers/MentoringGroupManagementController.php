<?php

namespace App\Http\Controllers;

use App\Http\Requests\mentorship_groups\CreateOrUpdateMentorshipGroupRequest;
use App\Models\MentorshipGroup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="MentoringGroupCreateUpdate",
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="course_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="mentorship_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="price",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="price_promotional",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="purchase_deadline",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="expiration_date",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="type",
 *         type="string",
 *         enum={"group", "single"}
 *     ),
 *     example={"title": "Curso de PHP", "course_id": "1", "mentorship_id": "1", "price": 100, "price_promotional": 50, "purchase_deadline": "2021-08-01 00:00:00", "expiration_date": "2021-08-01 00:00:00", "type": "group"}
 * )
 * @OA\Schema(
 *     schema="MentoringGroupManagement",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="course_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="mentorship_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="price",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="price_promotional",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="qnt_students",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="purchase_deadline",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="expiration_date",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="type",
 *         type="string",
 *         enum={"group", "single"}
 *     ),
 *     example={"id": "1", "title": "Curso de PHP", "course_id": "1", "mentorship_id": "1", "price": 100, "price_promotional": 50, "qnt_students": 10, "purchase_deadline": "2021-08-01 00:00:00", "expiration_date": "2021-08-01 00:00:00", "type": "group"}
 * )
 */
class MentoringGroupManagementController extends Controller
{

    /**
     * @OA\Get(
     *     path="/mentoring/group-management/{id}",
     *     tags={"Mentoring Group Management"},
     *     summary="List all group by mentoring",
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
     *         description="List of group by mentoring",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MentoringGroupManagement")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden"
     *     )
     * )
     */
    public function listAllByManagement(string $mentorshipId)
    {
        try {
            $mentorshipGroups = MentorshipGroup::where('mentorship_id', $mentorshipId)->get();
            return response()->json([
                'message' => 'success',
                'data' => $mentorshipGroups
            ]);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring/group-management",
     *     tags={"Mentoring Group Management"},
     *     summary="Create a group",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/MentoringGroupCreateUpdate")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Group created"
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
    public function create(CreateOrUpdateMentorshipGroupRequest $request)
    {
        try {
            $params = $request->all();

            $mentorship = new MentorshipGroup();
            $mentorship->createOrUpdateMentorshipGroup(
                $params['mentorship_id'],
                $params['course_id'],
                $params['title'],
                $params['price'],
                $params['price_promotional'],
                0, // qnt_students
                $params['purchase_deadline'],
                $params['expiration_date'],
                $params['type']
            );

            return response()->json([
                'message' => 'Mentorship group created successfully',
                'data' => $mentorship
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring/group-management/{id}",
     *     tags={"Mentoring Group Management"},
     *     summary="Update a group",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Group ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/MentoringGroupCreateUpdate")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group updated"
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
    public function update(CreateOrUpdateMentorshipGroupRequest $request, $id)
    {
        try {
            $params = $request->all();

            $mentorship = MentorshipGroup::find($id);
            $mentorship->createOrUpdateMentorshipGroup(
                "",
                $params['course_id'],
                $params['title'],
                $params['price'],
                $params['price_promotional'],
                $mentorship->qnt_students,
                $params['purchase_deadline'],
                $params['expiration_date'],
                $params['type']
            );

            return response()->json([
                'message' => 'Mentorship group updated successfully',
                'data' => $mentorship
            ]);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }


    /**
     * @OA\Delete(
     *     path="/mentoring/group-management/{id}",
     *     tags={"Mentoring Group Management"},
     *     summary="Delete a group",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Group ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group deleted"
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
            $mentorship = MentorshipGroup::find($id);
            $mentorship->delete();

            DB::commit();
            return response()->json([
                'message' => 'Mentorship group deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
