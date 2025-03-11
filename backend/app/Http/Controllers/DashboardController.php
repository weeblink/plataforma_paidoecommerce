<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Courses;
use App\Models\Extra;
use App\Models\Mentorship;
use App\Models\MentorshipGroup;
use App\Models\User;
use App\Models\UserProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *    schema="DashboardStudent",
 *    @OA\Property(
 *        property="courses",
 *        type="array",
 *        @OA\Items(ref="#/components/schemas/CourseUserList")
 *    ),
 *    @OA\Property(
 *        property="banners",
 *        type="array",
 *        @OA\Items(ref="#/components/schemas/Banner")
 *    ),
 *    @OA\Property(
 *        property="mentorings_groups",
 *        type="array",
 *        @OA\Items(ref="#/components/schemas/MentoringGroupExibition")
 *    ),
 *    @OA\Property(
 *        property="extras",
 *        type="array",
 *        @OA\Items(ref="#/components/schemas/ExtraExibition")
 *    ),
 * ),
 * @OA\Schema(
 *   schema="DashboardAdmin",
 *   @OA\Property(
 *     property="course_active_statistics",
 *     type="object",
 *     @OA\Property(property="active_courses", type="integer"),
 *     @OA\Property(property="courses_added_this_month", type="integer")
 *   ),
 *   @OA\Property(
 *     property="leads_statistics",
 *     type="object",
 *     @OA\Property(property="leads_added_this_month", type="integer"),
 *     @OA\Property(property="total_leads", type="integer")
 *   ),
 *   @OA\Property(
 *     property="extra_statistics",
 *     type="object",
 *     @OA\Property(property="extras_added_this_month", type="integer"),
 *     @OA\Property(property="total_extras", type="integer")
 *   ),
 *   @OA\Property(
 *     property="mentorship_statistics",
 *     type="object",
 *     @OA\Property(property="mentorships_added_this_month", type="integer"),
 *     @OA\Property(property="total_mentorships", type="integer")
 *   ),
 *   @OA\Property(
 *     property="leads_per_month",
 *     type="array",
 *     @OA\Items(
 *       type="object",
 *       @OA\Property(property="name", type="string"),
 *       @OA\Property(property="total", type="integer")
 *     )
 *   ),
 *   @OA\Property(
 *     property="last_five_sales",
 *     type="array",
 *     @OA\Items(
 *       type="object",
 *       @OA\Property(property="sale_id", type="integer"),
 *       @OA\Property(property="user_name", type="string"),
 *       @OA\Property(property="user_email", type="string"),
 *       @OA\Property(property="product_price", type="number", format="float")
 *     )
 *   ),
 *   @OA\Property(
 *     property="last_month_sales_count",
 *     type="integer"
 *   ),
 *   @OA\Property(
 *     property="students_per_mentorship",
 *     type="object",
 *     @OA\Property(
 *       property="config",
 *       type="object",
 *       additionalProperties={
 *         "type": "object",
 *         @OA\Property(property="label", type="string")
 *       }
 *     ),
 *     @OA\Property(
 *       property="data",
 *       type="array",
 *       @OA\Items(
 *         type="object",
 *         @OA\Property(property="name", type="string"),
 *         @OA\Property(property="value", type="integer")
 *       )
 *     )
 *   ),
 *   @OA\Property(
 *     property="students_per_course",
 *     type="object",
 *     @OA\Property(
 *       property="config",
 *       type="object",
 *       additionalProperties={
 *         "type": "object",
 *         @OA\Property(property="label", type="string")
 *       }
 *     ),
 *     @OA\Property(
 *       property="data",
 *       type="array",
 *       @OA\Items(
 *         type="object",
 *         @OA\Property(property="name", type="string"),
 *         @OA\Property(property="value", type="integer")
 *       )
 *     )
 *   ),
 *   @OA\Property(
 *     property="extra_sales_monthly",
 *     type="array",
 *     @OA\Items(
 *       type="object",
 *       @OA\Property(property="month", type="string"),
 *       additionalProperties={
 *         "type": "integer"
 *       }
 *     )
 *   )
 * )
 */
class DashboardController extends Controller
{
    /**
    * @OA\Get(
    *     path="/dashboard/student",
    *     tags={"Dashboard"},
    *     summary="Get student dashboard",
    *     security={{"bearer_token":{}}},
    *     @OA\Response(
    *         response=200,
    *         description="Student dashboard",
    *         @OA\JsonContent(ref="#/components/schemas/DashboardStudent")
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
    public function student(Request $request): \Illuminate\Http\JsonResponse
    {
        try {

            $courses = Courses::listUserCoursesUnlocked($request->user()->id);
            $banners = Banner::orderBy('position')->get();
            $mentoringsGroups = MentorshipGroup::listUserMentoringGroupsUnlocked($request->user()->id);
            $extras = Extra::listUserExtraUnlocked($request->user()->id);

            $data = [
                'courses' => $courses,
                'banners' => $banners,
                'mentorings_groups' => $mentoringsGroups,
                'extras' => $extras
            ];

            return response()->json([
                'message'     => "success",
                'data'        => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'     => $e->getMessage()
            ]);
        }
    }

    public function getStudentsPerMentorship()
    {
        return $this->getFormattedResponse(UserProduct::getStudentsPerMentorship());
    }

    public function getStudentsPerCourse()
    {
        return $this->getFormattedResponse(UserProduct::getStudentsPerCourse());
    }

    private function getFormattedResponse(array $data)
    {
        $config = [
            'total' => ['label' => 'Total'],
        ];

        foreach ($data as $item) {
            $config[$item['name']] = ['label' => $item['label']];
        }

        return [
            'data' => $data,
            'config' => $config,
        ];
    }

    /**
    * @OA\Get(
    *     path="/dashboard/admin",
    *     tags={"Dashboard"},
    *     summary="Get admin dashboard",
    *     security={{"bearer_token":{}}},
    *     @OA\Response(
    *         response=200,
    *         description="Admin dashboard",
    *         @OA\JsonContent(ref="#/components/schemas/DashboardAdmin")
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
    public function admin(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $courseActiveStatistics = Courses::getCourseActiveStatistics();
            $leadsStatistics = User::getLeadStatistics();
            $extraStatistics = Extra::getExtraStatistics();
            $mentorshipStatistics = Mentorship::getMentorshipStatistics();

            $leadsPerMonth = User::getLeadsPerMonth();
            $lastFiveSales = UserProduct::getLastFiveSales();
            $lastMonthSalesCount = UserProduct::getSalesCountThisMonth();

            $studentsPerMentorship = $this->getStudentsPerMentorship();
            $studentsPerCourse = $this->getStudentsPerCourse();
            $extraSalesMonthly = UserProduct::getMonthlyExtraSales();

            $data = [
                'course_active_statistics' => $courseActiveStatistics,
                'leads_statistics' => $leadsStatistics,
                'extra_statistics' => $extraStatistics,
                'mentorship_statistics' => $mentorshipStatistics,
                'leads_per_month' => $leadsPerMonth,
                'last_five_sales' => $lastFiveSales,
                'last_month_sales_count' => $lastMonthSalesCount,
                'students_per_mentorship' => $studentsPerMentorship,
                'students_per_course' => $studentsPerCourse,
                'extra_sales_monthly' => $extraSalesMonthly,
            ];

            return response()->json([
                'message'     => "success",
                'data'        => $data
            ]);
        } catch (\Exception $e) {

            Log::error("[ DASHBOARD CONTROLLER ] -> {$e->getMessage()} | {$e->getFile()} | {$e->getLine()}");

            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }
}
