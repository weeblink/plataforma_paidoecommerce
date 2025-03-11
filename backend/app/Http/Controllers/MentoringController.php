<?php

namespace App\Http\Controllers;

use App\Models\Mentorship;
use App\Models\MentorshipGroup;
use App\Models\UserProduct;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="MentoringGroupExibition",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="image_url",
 *         type="string"
 *     ),
 * ),
 * @OA\Schema(
 *     schema="MentoringGroupExibitionDetails",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/MentoringGroupExibition"),
 *         @OA\Schema(
 *             @OA\Property(
 *                 property="course",
 *                 ref="#/components/schemas/Course"
 *             ),
 *             @OA\Property(
 *                 property="last_class",
 *                 ref="#/components/schemas/CourseClass"
 *             ),
 *             @OA\Property(
 *                 property="mentorships",
 *                 type="array",
 *                 @OA\Items(ref="#/components/schemas/MentoringScheduleGroupResponse")
 *             )
 *         )
 *     }
 * )
 */
class MentoringController extends Controller
{

    /**
     * @OA\Get(
     *     path="/mentorings",
     *     tags={"Mentorings"},
     *     summary="List all mentorings",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of mentorings",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MentoringGroupExibition")
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
    public function listAll(Request $request)
    {
        try {

            return response()->json([
                'message'   => "Mentorships founded successfully",
                'data'      => Mentorship::listAll()
            ]);
        } catch (\Exception $e) {

            Log::error("[ MENTORING CONTROLLER ERROR ]: " . $e->getMessage());

            return response()->json([
                'error' => "An unexpected error has occurred"
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/mentorings/{id}/payment",
     *     tags={"Mentorings"},
     *     summary="Get mentorship group payment data",
     *     description="Retrieves payment information for a specific mentorship group if the user doesn't already have access",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Mentorship Group ID",
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
     *                 description="Payment data for the mentorship group"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="User already has access to this mentorship",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="User already has access to this mentorship"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group not found",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="Group not found"
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
    public function getMentorshipGroupPaymentData(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $group = MentorshipGroup::find($id);

            if (empty($group))
                return response()->json(['error' => "Group not found"], 404);

            $userProduct = UserProduct::where('group_id', $id)->where('user_id', $request->user()->id)->first();

            if ($userProduct)
                return response()->json(['error' => "User already has access to this mentorship"], 400);

            return response()->json([
                'message'       => "success",
                'data'          => MentorshipGroup::getPaymentData($group)
            ]);
        } catch (\Exception $e) {

            Log::error("[ Mentoring Controller ]: " . $e->getMessage());

            return response()->json([
                'error'     => "An unexpected error occurred",
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *    path="/mentorings/{group_id}",
     *    tags={"Mentorings"},
     *    summary="Get meet schedules with mentoring details",
     *    description="Retrieve meet schedules with mentoring details, including mentor information and student schedules.",
     *    security={{"bearer_token":{}}},
     *    @OA\Parameter(
     *        name="group_id",
     *        in="path",
     *        description="The ID of the mentoring group",
     *        required=true,
     *        @OA\Schema(
     *            type="string"
     *        )
     *    ),
     *    @OA\Response(
     *        response=200,
     *        description="Mentoring schedule retrieved successfully",
     *        @OA\JsonContent(
     *            type="object",
     *            @OA\Property(property="message", type="string", example="Mentoring groups founded"),
     *            @OA\Property(
     *                property="data",
     *                type="object",
     *                @OA\Property(property="id", type="string", example="group_001"),
     *                @OA\Property(property="title", type="string", example="Group Mentoring Schedule"),
     *                @OA\Property(property="price", type="float", example=199.99),
     *                @OA\Property(property="promotional_price", type="float", example=149.99),
     *                @OA\Property(property="qnt_students", type="integer", example=25),
     *                @OA\Property(property="purchase_deadline", type="string", format="date-time", example="2024-12-31T23:59:59Z"),
     *                @OA\Property(property="expiration_date", type="string", format="date-time", example="2025-12-31T23:59:59Z"),
     *                @OA\Property(property="type", type="string", example="mentoring"),
     *                @OA\Property(
     *                    property="mentorship",
     *                    type="object",
     *                    @OA\Property(property="id", type="string", example="mentorship_001"),
     *                    @OA\Property(property="title", type="string", example="Advanced Mentorship Program"),
     *                    @OA\Property(property="image_url", type="string", example="https://example.com/images/mentorship.jpg"),
     *                    @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T12:00:00Z"),
     *                    @OA\Property(property="updated_at", type="string", format="date-time", example="2024-06-01T12:00:00Z")
     *                ),
     *                @OA\Property(
     *                    property="course",
     *                    type="object",
     *                    @OA\Property(property="id", type="string", example="course_001"),
     *                    @OA\Property(property="title", type="string", example="Mastering Programming"),
     *                    @OA\Property(property="price", type="float", example=299.99),
     *                    @OA\Property(property="promotional_price", type="float", example=199.99),
     *                    @OA\Property(property="qnt_class", type="integer", example=30),
     *                    @OA\Property(property="qnt_students", type="integer", example=50),
     *                    @OA\Property(property="image_url", type="string", example="https://example.com/images/course.jpg"),
     *                    @OA\Property(property="is_pay", type="boolean", example=true),
     *                    @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T12:00:00Z"),
     *                    @OA\Property(property="updated_at", type="string", format="date-time", example="2024-06-01T12:00:00Z")
     *                ),
     *                @OA\Property(
     *                     property="last_class",
     *                     ref="#/components/schemas/CourseClass"
     *                 ),
     *                @OA\Property(
     *                    property="schedules_individual",
     *                    type="array",
     *                    description="Schedules for individual mentoring sessions",
     *                    @OA\Items(
     *                        type="object",
     *                        @OA\Property(property="id", type="string", example="schedule_001"),
     *                        @OA\Property(property="start_time", type="string", format="time", example="08:00"),
     *                        @OA\Property(property="end_time", type="string", format="time", example="10:00"),
     *                        @OA\Property(
     *                            property="student",
     *                            type="object",
     *                            @OA\Property(property="student_id", type="string", example="student_001"),
     *                            @OA\Property(property="name", type="string", example="John Doe")
     *                        )
     *                    )
     *                ),
     *                @OA\Property(
     *                    property="schedules_groups",
     *                    type="array",
     *                    description="Schedules for group mentoring sessions",
     *                    @OA\Items(
     *                        type="object",
     *                        @OA\Property(property="id", type="string", example="schedule_002"),
     *                        @OA\Property(property="start_time", type="string", format="time", example="14:00"),
     *                        @OA\Property(property="end_time", type="string", format="time", example="16:00"),
     *                        @OA\Property(
     *                            property="students",
     *                            type="array",
     *                            @OA\Items(
     *                                type="object",
     *                                @OA\Property(property="student_id", type="string", example="student_002"),
     *                                @OA\Property(property="name", type="string", example="Jane Doe")
     *                            )
     *                        )
     *                    )
     *                ),
     *                @OA\Property(
     *                    property="progress",
     *                    type="object",
     *                    description="Details of the user's progress in the mentoring group",
     *                    @OA\Property(property="completed_classes", type="integer", example=10),
     *                    @OA\Property(property="total_classes", type="integer", example=20),
     *                    @OA\Property(property="percentage", type="float", example=50.0)
     *                )
     *            )
     *        )
     *    ),
     *    @OA\Response(
     *        response=404,
     *        description="Mentoring schedules not found",
     *        @OA\JsonContent(
     *            type="object",
     *            @OA\Property(property="message", type="string", example="Mentoring schedules not found")
     *        )
     *    ),
     *    @OA\Response(
     *        response=500,
     *        description="Internal server error",
     *        @OA\JsonContent(
     *            type="object",
     *            @OA\Property(property="message", type="string", example="An unexpected error occurred")
     *        )
     *    )
     * )
     */
    public function mentoringDetails(Request $request, $groupId): \Illuminate\Http\JsonResponse
    {
        try {
            $response = Mentorship::getMentoringDetailsByGroupIdAndUserId($groupId, $request->user()->id);
            if (isset($response["error"])) {
                throw new Exception($response["error"]);
            }

            return response()->json([
                'message'   => "Mentoring groups founded",
                'data'      => $response
            ]);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/mentorings/{id}/groups",
     *     tags={"Mentorings"},
     *     summary="Get mentorship groups",
     *     description="Retrieves all groups associated with a specific mentorship for the authenticated user",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Mentorship ID",
     *         @OA\Schema(
     *             type="integer",
     *             format="int64"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved mentoring groups",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Mentoring groups founded"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 description="List of mentorship groups",
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
     *                 example="An unexpected error ocourred"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function getGroupsMentoring(Request $request, $id): JsonResponse
    {
        try {

            $mentorship = Mentorship::find($id);

            return response()->json([
                'message'   => "Mentoring groups founded",
                'data'      => $mentorship->getGroups($request->user()->id)
            ]);
        } catch (Exception $e) {

            Log::error("[ MENTORING CONTROLLER ERROR ]: " . $e->getMessage());

            return response()->json([
                'error'     => "An unexpected error ocourred"
            ], 500);
        }
    }
}
