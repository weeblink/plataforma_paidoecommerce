<?php

namespace App\Http\Controllers;

use App\Http\Requests\meet_schedules\CreateOrUpdateMeetSchedulesRequest;
use App\Models\CalendarTime;
use App\Models\MeetingStudentScheduled;
use App\Models\MeetScheduled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="MeetScheduleRequest",
 *     type="object",
 *     required={"group_id", "calendar_time_id", "title", "description"},
 *     @OA\Property(
 *         property="group_id",
 *         type="string",
 *         description="ID of the group"
 *     ),
 *     @OA\Property(
 *         property="calendar_time_id",
 *         type="string",
 *         description="ID of the calendar time"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the meet"
 *     ),
 *     @OA\Property(
 *         property="description",
 *         type="string",
 *         description="Description of the meet"
 *     ),
 *     example={
 *         "group_id": "0e1ef5f5-4122-4d2c-b01a-fca411de7d33",
 *         "calendar_time_id": "0e1ef5f5-4122-4d2c-b01a-fca411de7d33",
 *         "title": "string",
 *         "description": "string"
 *     }
 * )
 * @OA\Schema(
 *     schema="MeetScheduleResponse",
 *     type="array",
 *     @OA\Items(
 *         @OA\Property(
 *             property="user",
 *             type="object",
 *             description="Mentor details",
 *             @OA\Property(
 *                 property="id",
 *                 type="string",
 *                 description="User ID"
 *             ),
 *             @OA\Property(
 *                 property="name",
 *                 type="string",
 *                 description="User name"
 *             )
 *         ),
 *         @OA\Property(
 *             property="date",
 *             type="string",
 *             format="date",
 *             description="Schedule date in YYYY-MM-DD format"
 *         ),
 *         @OA\Property(
 *             property="times",
 *             type="array",
 *             description="List of available times",
 *             @OA\Items(
 *                 type="object",
 *                 @OA\Property(
 *                     property="id",
 *                     type="string",
 *                     description="Calendar time ID"
 *                 ),
 *                 @OA\Property(
 *                     property="start_time",
 *                     type="string",
 *                     format="time",
 *                     description="Start time in HH:mm format"
 *                 ),
 *                 @OA\Property(
 *                     property="end_time",
 *                     type="string",
 *                     format="time",
 *                     description="End time in HH:mm format"
 *                 )
 *             )
 *         )
 *     )
 * ),
 */
class MeetScheduleController extends Controller
{

    /**
     * @OA\Get(
     *     path="/meet/schedule",
     *     tags={"Meet Schedules"},
     *     summary="List all meet schedules",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MeetScheduleResponse")
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
     *             @OA\Property(property="error", type="string", example="Meet schedules not found")
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
    public function listAll(): \Illuminate\Http\JsonResponse
    {
        try {

            $meetSchedules = MeetScheduled::getAllMeetSchedules();
            return response()->json([
                'message' => 'success',
                'data' => $meetSchedules
            ]);
        } catch (\Exception $e) {

            Log::error($e->getMessage());

            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/meet/schedule",
     *     tags={"Meet Schedules"},
     *     summary="Create Meet Schedule for a student",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(ref="#/components/schemas/MeetScheduleRequest")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Meet Schedule created",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Meet Schedule created successfully"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/MeetScheduleResponse")
     *             )
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
    public function create(CreateOrUpdateMeetSchedulesRequest $request): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $params = $request->all();

            $meetScheduled = new MeetScheduled();

            $meetScheduled->createOrUpdateMeetScheduled(
                $params['group_id'],
                $params['calendar_time_id'],
                true,
                false,
                $params['title'],
                $params['description'],
            );

            $studentScheduled = new MeetingStudentScheduled();
            $studentScheduled->createOrUpdateMeetStudentScheduled($request->user()->id, $meetScheduled->id);

            DB::commit();

            return response()->json([
                'message' => 'Meet Schedule created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/meet/schedule/mark-as-unavailable/{id}",
     *     tags={"Meet Schedules"},
     *     summary="Mark a meet schedule as unavailable",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the meet schedule to mark as unavailable",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Meet schedule successfully marked as unavailable",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Meet schedule marked as unavailable")
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
     *             @OA\Property(property="error", type="string", example="Meet schedule not found")
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
    public function markAsUnavailable($id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $meetScheduled = MeetScheduled::find($id);
            if (!$meetScheduled) {
                return response()->json(['error' => 'Meet schedule not found'], 404);
            }

            $meetScheduled->is_available = false;
            $meetScheduled->save();
            DB::commit();
            return response()->json(['message' => 'Meet schedule marked as unavailable']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/meet/schedule/mark-as-present/{id}",
     *     tags={"Meet Schedules"},
     *     summary="Mark a meet schedule as present",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the meet schedule to mark as present",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Meet schedule successfully marked as present",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Meet schedule marked as present")
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
     *             @OA\Property(property="error", type="string", example="Meet schedule or student not found")
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
    public function markAsPresent(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $student = $request->user();

            $meetingStudentScheduled = MeetingStudentScheduled::find($id);

            if (isset($meetingStudentScheduled)) {
                return response()->json(['error' => 'Student has already marked as a present in this mentoring'], 404);
            }

            $meetingStudentScheduled = new MeetingStudentScheduled();
            $meetingStudentScheduled->createOrUpdateMeetStudentScheduled($student->id, $id);

            DB::commit();
            return response()->json(['message' => 'Student mark as present successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/meet/schedule/{id}",
     *     tags={"Meet Schedules"},
     *     summary="Delete a meet schedule",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Calendar time ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Meet schedule deleted")
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
     *             @OA\Property(property="error", type="string", example="Meet schedule not found")
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
    public function delete($id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $meetScheduled = MeetScheduled::find($id);
            if (!$meetScheduled) {
                return response()->json(['error' => 'Meet schedule not found'], 404);
            }

            $meetScheduled->delete();
            DB::commit();
            return response()->json(['message' => 'Meet schedule deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
