<?php

namespace App\Http\Controllers;

use App\Http\Requests\mentoring_schedule\CreateMentoringGroupScheduleRequest;
use App\Http\Requests\mentoring_schedule\CreateMentoringScheduleRequest;
use App\Http\Requests\mentoring_schedule\UpdateMentoringScheduleRequest;
use App\Models\Calendar;
use App\Models\CalendarTime;
use App\Models\MeetScheduled;
use App\Models\MentorshipGroup;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="MentoringScheduleRequest",
 *     type="object",
 *     required={"dates"},
 *     @OA\Property(
 *         property="dates",
 *         type="array",
 *         description="Array of dates and times",
 *         @OA\Items(
 *             type="object",
 *             required={"date", "times"},
 *             @OA\Property(
 *                 property="date",
 *                 type="string",
 *                 format="date",
 *                 description="Date in the format YYYY-MM-DD"
 *             ),
 *             @OA\Property(
 *                 property="times",
 *                 type="array",
 *                 description="Array of time intervals",
 *                 @OA\Items(
 *                     type="object",
 *                     required={"start_time", "end_time"},
 *                     @OA\Property(
 *                         property="start_time",
 *                         type="string",
 *                         description="Start time in the format HH:mm"
 *                     ),
 *                     @OA\Property(
 *                         property="end_time",
 *                         type="string",
 *                         description="End time in the format HH:mm"
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *     example={
 *         "dates": {
 *             {
 *                 "date": "12/12/2024",
 *                 "times": {
 *                     {"start_time": "08:00", "end_time": "10:00"},
 *                     {"start_time": "14:00", "end_time": "16:00"},
 *                 }
 *             },
 *             {
 *                 "date": "13/12/2024",
 *                 "times": {
 *                     {"start_time": "09:00", "end_time": "11:00"},
 *                 }
 *             }
 *         }
 *     }
 * )
 * @OA\Schema(
 *     schema="MentoringScheduleResponse",
 *     type="array",
 *     @OA\Items(
 *         @OA\Property(
 *             property="id",
 *             type="string",
 *             description="Calendar ID"
 *         ),
 *         @OA\Property(
 *             property="user",
 *             type="object",
 *             description="User information",
 *             @OA\Property(
 *                 property="id",
 *                 type="string",
 *                 description="User ID"
 *             ),
 *             @OA\Property(
 *                 property="username",
 *                 type="string",
 *                 description="User name"
 *             )
 *         ),
 *         @OA\Property(
 *             property="date",
 *             type="string",
 *             format="date",
 *             description="Available date"
 *         ),
 *         @OA\Property(
 *             property="times",
 *             type="array",
 *             description="List of available time slots",
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
 *                     description="Start time of the time slot"
 *                 ),
 *                 @OA\Property(
 *                     property="end_time",
 *                     type="string",
 *                     format="time",
 *                     description="End time of the time slot"
 *                 )
 *             )
 *         )
 *     )
 * ),
 * @OA\Schema(
 *    schema="MentoringScheduleUpdateRequest",
 *    type="object",
 *    @OA\Property(
 *        property="date",
 *        type="string",
 *        format="date",
 *        description="Date in format DD/MM/YYYY",
 *        example="11/12/2024"
 *    ),
 *    @OA\Property(
 *        property="times",
 *        type="array",
 *        description="Array of time intervals for the given date",
 *        @OA\Items(
 *            type="object",
 *            @OA\Property(
 *                property="start_time",
 *                type="string",
 *                format="time",
 *                description="Start time in format HH:mm",
 *                example="08:00"
 *            ),
 *            @OA\Property(
 *                property="end_time",
 *                type="string",
 *                format="time",
 *                description="End time in format HH:mm",
 *                example="10:00"
 *            )
 *        )
 *    )
 * ),
 * @OA\Schema(
 *    schema="MentoringScheduleGroupResponse",
 *    @OA\Property(
 *       property="name",
 *       type="string"
 *    ),
 *    @OA\Property(
 *       property="date",
 *       type="string"
 *    )
 * ),
 * @OA\Schema(
 *   schema="MentoringScheduleGroupRequest",
 *   type="object",
 *   required={"title", "description", "group_id", "date", "start_time", "end_time"},
 *   @OA\Property(property="title", type="string", example="Mentoria Grupo 1"),
 *   @OA\Property(property="description", type="string", example="Mentoria sobre Laravel"),
 *   @OA\Property(property="group_id", type="string", example="089f8e7f-c005-424d-a13f-1eedb0b45e39"),
 *   @OA\Property(property="date", type="string", example="25/12/2024"),
 *   @OA\Property(property="start_time", type="string", example="14:00"),
 *   @OA\Property(property="end_time", type="string", example="15:00")
 * )
 */
class MentoringScheduleManagementController extends Controller
{

    /**
     * @OA\Get(
     *     path="/mentoring/schedule",
     *     tags={"Mentoring Schedules"},
     *     summary="List all calendar times",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/MentoringScheduleResponse")
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
     *             @OA\Property(property="error", type="string", example="Calendar Time not found")
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
            $schedules = CalendarTime::getAllTimes();

            return response()->json([
                'message' => 'success',
                'data' => $schedules
            ]);
        } catch (\Exception $e) {

            Log::error("[ Mentoring Schedule Management ] -> {$e->getMessage()} | {$e->getFile()} | {$e->getLine()}");

            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/mentoring/schedule/calendar",
     *     tags={"Mentoring Schedules"},
     *     summary="Get all scheduled meetings for the admin user",
     *     description="Retrieves a list of all scheduled meetings including individual and group meetings",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="title", type="string", example="Meeting with John"),
     *                     @OA\Property(property="description", type="string", example="Weekly progress review"),
     *                     @OA\Property(property="date", type="string", example="25/12/2024"),
     *                     @OA\Property(property="start_time", type="string", example="14:30"),
     *                     @OA\Property(property="end_time", type="string", example="15:30"),
     *                     @OA\Property(property="mentoring_title", type="string", nullable=true, example="Advanced Python Course"),
     *                     @OA\Property(
     *                         property="group",
     *                         type="object",
     *                         @OA\Property(property="title", type="string", nullable=true, example="Group A")
     *                     ),
     *                     @OA\Property(
     *                         property="students",
     *                         type="array",
     *                         @OA\Items(
     *                             type="object",
     *                             @OA\Property(property="id", type="string", example="123e4567-e89b-12d3-a456-426614174000"),
     *                             @OA\Property(property="name", type="string", example="John Doe")
     *                         )
     *                     ),
     *                     @OA\Property(property="type", type="string", enum={"individual", "group"}, example="individual")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
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
    public function getCalendarMeetings(Request $request): \Illuminate\Http\JsonResponse
    {
        try {

            return response()->json([
                'message'   => 'success',
                'data'      => MeetScheduled::getScheduledMeets($request->user()->id)
            ]);
        } catch (\Exception $e) {

            Log::error("[ MeetScheduleController ERROR ] -> " . $e->getMessage());

            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/mentoring/schedule/groups",
     *     tags={"Mentoring Schedules"},
     *     summary="Get all groups",
     *     description="Retrieves a list of all groups to schedule",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             properties={
     *                 @OA\Property(property="message", type="string", example="Groups founded successfully"),
     *                 @OA\Property(
     *                     property="data",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         properties={
     *                             @OA\Property(property="id", type="string", example="4c21abb9-6f43-4f6a-b866-00d40948b763"),
     *                             @OA\Property(property="title", type="string", example="Grupo 01")
     *                         }
     *                     )
     *                 )
     *             }
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             type="object",
     *             properties={
     *                 @OA\Property(property="message", type="string", example="Unauthenticated")
     *             }
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             type="object",
     *             properties={
     *                 @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *             }
     *         )
     *     )
     * )
     */
    public function getAllGroups(): \Illuminate\Http\JsonResponse
    {
        try {

            return response()->json([
                'message'   => 'Groups founded successfully',
                'data'      => MentorshipGroup::getAllGroups()
            ]);
        } catch (\Exception $e) {

            Log::error("[ MeetScheduleController ERROR ] " . $e->getMessage());

            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring/schedule",
     *     tags={"Mentoring Schedules"},
     *     summary="Create admin Mentoring Schedules",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(ref="#/components/schemas/MentoringScheduleRequest")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Mentoring Schedule created",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Mentoring Schedule created successfully"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/MentoringScheduleResponse")
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
    public function create(CreateMentoringScheduleRequest $request)
    {
        DB::beginTransaction();
        try {
            $params = $request->all();

            $user = $request->user();

            $userCalendar = Calendar::getCalendarByUserId($user->id);

            if (!$userCalendar) {
                $calendar  = new Calendar();

                $userCalendar = $calendar->createOrUpdateCalendar($user->id);
            }

            foreach ($params['dates'] as $date) {
                foreach ($date['times'] as $time) {
                    $startDate = $date['date'] . " " . $time['start_time'];
                    $endDate = $date['date'] . " " . $time['end_time'];

                    $calendarTime = CalendarTime::getCalendarTimeByCalendarIdAndStartDateAndEndDate($startDate, $endDate, $userCalendar->id);

                    if (isset($calendarTime)) {
                        return response()->json([
                            'message' => 'Some of these times are already scheduled!',
                        ], 400);
                    }

                    $calendarTimes = new CalendarTime();

                    $calendarTimes->createOrUpdateCalendarTime(
                        $userCalendar->id,
                        Carbon::createFromFormat('d/m/Y H:i', $startDate)->format('Y-m-d H:i:s'),
                        Carbon::createFromFormat('d/m/Y H:i', $endDate)->format('Y-m-d H:i:s'),
                        true
                    );
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Mentoring Schedule created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/mentoring/schedule/create/groups",
     *     tags={"Mentoring Schedules"},
     *     summary="Create Mentoring Schedule for a group",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/MentoringScheduleGroupRequest")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Mentoring group schedule created",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Mentoring group schedule created successfully"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="error",
     *                 type="string",
     *                 example="Validation error"
     *             ),
     *             @OA\Property(
     *                 property="details",
     *                 type="object",
     *                 additionalProperties={
     *                     "type": "array",
     *                     "items": {
     *                         "type": "string"
     *                     }
     *                 }
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
    public function createGroupSchedule(CreateMentoringGroupScheduleRequest $request)
    {
        DB::beginTransaction();
        try {
            $validatedData = $request->validated();

            $user = $request->user();

            $userCalendar = Calendar::getCalendarByUserId($user->id);

            if (!$userCalendar) {
                $calendar  = new Calendar();

                $userCalendar = $calendar->createOrUpdateCalendar($user->id);
            }

            foreach ($validatedData as $schedule) {
                $meetSchedule = new MeetScheduled();

                $startDate = $schedule['date'] . " " . $schedule['start_time'];
                $endDate = $schedule['date'] . " " . $schedule['end_time'];

                $calendarTime = CalendarTime::getCalendarTimeByCalendarIdAndStartDateAndEndDate($startDate, $endDate, $userCalendar->id);

                if (isset($calendarTime)) {
                    return response()->json([
                        'message' => 'Some of these times are already scheduled!',
                    ], 400);
                }

                $calendarTime = new CalendarTime();

                $calendarTime->createOrUpdateCalendarTime(
                    $userCalendar->id,
                    Carbon::createFromFormat('d/m/Y H:i', $startDate)->format('Y-m-d H:i:s'),
                    Carbon::createFromFormat('d/m/Y H:i', $endDate)->format('Y-m-d H:i:s'),
                    true
                );

                $meetSchedule->createOrUpdateMeetScheduled(
                    $schedule['group_id'],
                    $calendarTime->id,
                    true,
                    true,
                    $schedule['title'],
                    $schedule['description']
                );
            }

            DB::commit();
            return response()->json([
                'message' => 'Mentoring Schedule created successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/mentoring/schedule/{id}",
     *     tags={"Mentoring Schedules"},
     *     summary="Update Mentoring Schedule for a group",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Calendar ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(ref="#/components/schemas/MentoringScheduleUpdateRequest")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Mentoring Schedule updated",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Mentoring Schedule created successfully"
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/MentoringScheduleResponse")
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
    public function update(UpdateMentoringScheduleRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $params = $request->all();

            $calendar = Calendar::find($id);
            if (!isset($calendar)) {
                return response()->json(['error' => 'Calendar not found'], 404);
            }

            CalendarTime::deleteAllCalendarTimesByCalendarIdAndDate($calendar->id, $params['date']);

            foreach ($params['times'] as $time) {
                $startDate = $params['date'] . " " . $time['start_time'];
                $endDate = $params['date'] . " " . $time['end_time'];

                $calendarTime = CalendarTime::getCalendarTimeByCalendarIdAndStartDateAndEndDate($startDate, $endDate, $calendar->id);
                if (isset($calendarTime)) {
                    return response()->json([
                        'message' => 'Some of these times are already scheduled!',
                    ], 400);
                }

                $calendarTimes = new CalendarTime();

                $calendarTimes->createOrUpdateCalendarTime(
                    $calendar->id,
                    Carbon::createFromFormat('d/m/Y H:i', $startDate)->format('Y-m-d H:i:s'),
                    Carbon::createFromFormat('d/m/Y H:i', $endDate)->format('Y-m-d H:i:s'),
                    true
                );
            }

            DB::commit();
            return response()->json([
                'message' => 'Mentoring Schedule updated successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/mentoring/schedule/{id}",
     *     tags={"Mentoring Schedules"},
     *     summary="Delete all mentoring schedules by calendar id",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Calendar ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Mentoring schedule deleted")
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
     *             @OA\Property(property="error", type="string", example="Mentoring schedule not found")
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
            $calendar = Calendar::find($id);
            if (!$calendar) {
                return response()->json(['error' => 'Calendar not found'], 404);
            }

            CalendarTime::deleteAllCalendarTimesByCalendarId($calendar->id);

            DB::commit();
            return response()->json(['message' => 'Mentoring Schedules deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
