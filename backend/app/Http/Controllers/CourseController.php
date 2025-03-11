<?php

namespace App\Http\Controllers;

use App\Models\Courses;
use App\Models\CoursesClass;
use App\Models\MentorshipGroup;
use App\Models\UserProduct;
use App\Models\UserCourseClassProgress;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Schema(
 *     schema="CourseUserList",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="imageUrl",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="isLocked",
 *         type="boolean"
 *     )
 * )
 * @OA\Schema(
 *     schema="CourseClassFile",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="class_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="path",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="size",
 *         type="string"
 *     )
 * )
 * @OA\Schema(
 *     schema="CourseClass",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="module_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="description",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="views",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="sequence",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="pv_video_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="files",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CourseClassFile")
 *     )
 * )
 * @OA\Schema(
 *     schema="CourseModule",
 *     @OA\Property(
 *         property="id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="course_id",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="sequence",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="qtd_timeclass",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="qtd_classes",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="classes",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CourseClass")
 *     )
 * )
 * @OA\Schema(
 *     schema="Course",
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
 *         type="number"
 *     ),
 *     @OA\Property(
 *         property="promotional_price",
 *         type="number"
 *     ),
 *     @OA\Property(
 *         property="qnt_classes",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="qnt_students",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="modules",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CourseModule")
 *     )
 * )
 */

class CourseController extends Controller
{

    /**
     * @OA\Get(
     *     path="/courses",
     *     tags={"Course"},
     *     summary="List all courses",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="message", type="string", example="success"),
     *                 @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/CourseUserList"))
     *             )
     *
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid or missing token")
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
    public function listAll(Request $request): JsonResponse
    {
        try {

            $courses = Courses::listCoursesAvailable($request->user()->id);

            return response()->json([
                'message'     => "success",
                'data'        => $courses
            ]);
        } catch (Exception $e) {

            Log::error("[ COURSE CONTROLLER ERROR]: {$e->getMessage()}");

            return response()->json([
                'error'     => "An unexpected error occurred"
            ]);
        }
    }

    /**
     * @OA\Get(
     *     path="/courses/{id}",
     *     tags={"Course"},
     *     summary="Get course by id",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the course",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(ref="#/components/schemas/Course")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid or missing token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Course not found")
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
    public function listOne(Request $request, $id): JsonResponse
    {
        try {

            $course = Courses::find($id);

            if( empty($course) ) return response()->json(['message' => "course not found"], 404);

            if (!$course->is_pay) {
                return response()->json([
                    'message'       => "success",
                    'data'          => Courses::listOneWithUserInfo($course, $request->user()->id),
                ]);
            }

            $userProduct = UserProduct::where('course_id', $id)->where('user_id', $request->user()->id)->first();

            if (empty($userProduct) && ! UserProduct::hasAnyMentorshipCourse( $request->user()->id, $id ) )
                return response()->json(['error' => "You don't have access to this product"], 403);

            if (empty($course))
                return response()->json(['error' => "Course not found"], 404);

            return response()->json([
                'message'       => "success",
                'data'          => Courses::listOneWithUserInfo($course, $request->user()->id),
            ]);
        } catch (Exception $e) {

            Log::error("[ COURSE CONTROLLER ERROR]: {$e->getMessage()} - {$e->getFile()} - {$e->getLine()}");

            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }

    public function getCoursePaymentData(Request $request, $id): JsonResponse
    {
        try {

            $course = Courses::find($id);

            if (empty($course))
                return response()->json(['error' => "Course not found"], 404);

            $userProduct = UserProduct::where('course_id', $id)->where('user_id', $request->user()->id)->first();
            if ($userProduct)
                return response()->json(['error' => "User already has access to this course"], 400);

            return response()->json([
                'message'       => "success",
                'data'          => Courses::getPaymentData($course)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error'     => "An unexpected error occurred"
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/courses/{classId}/watched",
     *     tags={"Course"},
     *     summary="Mark class as watched",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="classId",
     *         in="path",
     *         required=true,
     *         description="ID of the class",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Class marked as watched")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid or missing token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Class not found")
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
    public function markClassAsWatched(Request $request, $productId, $classId): JsonResponse
    {
        return $this->markClassAsWatchedStatus($request, $productId, $classId, true);
    }

    /**
     * @OA\Post(
     *     path="/courses/{classId}/not-watched",
     *     tags={"Course"},
     *     summary="Mark class as not watched",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="classId",
     *         in="path",
     *         required=true,
     *         description="ID of the class",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Class marked as not watched")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid or missing token")
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
    public function markClassAsNotWatched(Request $request, $productId, $classId): JsonResponse
    {
        return $this->markClassAsWatchedStatus($request, $productId, $classId, false);
    }

    private function markClassAsWatchedStatus(Request $request, $productId, $classId, bool $isWatched): JsonResponse
    {
        DB::beginTransaction();

        try {
            $class = CoursesClass::find($classId);

            if (empty($class)) {
                return response()->json(['error' => "Class not found"], 404);
            }

            list( $productType, $productItemId ) = $this->getProductType( $productId );

            $user = $request->user();
            $userProduct = UserProduct::getUserProduct(
                $user->id,
                $productType,
                $class->module->course->id
            );

            if ($userProduct === null && $class->is_pay ) {
                return response()->json(['error' => "The user has not yet purchased this course"], 403);
            }

            $progress = UserCourseClassProgress::getProgressUser($user->id, $classId, $productType, $productItemId);
            $userProduct->setLastClassSeen($classId);

            if ($progress === null) {
                $class->addNewView();
            }

            $userCourseProgress = $progress ?? new UserCourseClassProgress();
            $userCourseProgress->createOrUpdateProgress($userProduct->id, $classId, 0, 0, $isWatched);

            DB::commit();

            return response()->json([
                'message' => "Class marked as " . ($isWatched ? 'watched' : 'not watched')
            ]);
        } catch (Exception $e) {
            DB::rollback();

            Log::error($e->getMessage() . " -  {$e->getFile()} - {$e->getLine()}");

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Function to
     * @param $productId
     * @return array|null
     * @throws Exception
     */
    private function getProductType( $productId ): ?array
    {
        $product = Courses::find($productId);

        if( ! empty($product) )
            return ['course', $product->id];

        $product = MentorshipGroup::find($productId);

        if( ! empty($product) )
            return ['mentorship', $product->id];

        throw new Exception("Product not found");
    }

    /**
     * Function to check if exists a userProducts created for free course
     *
     * @param Request $request
     * @param $course_id
     * @return JsonResponse
     */
    public function checkFreeCourse( Request $request, $course_id ): JsonResponse
    {
        try {
            $userCourse = UserProduct::where('user_id', $request->user()->id)
                ->where('course_id', $course_id)
                ->first();

            if( ! empty($userCourse) )
                return response()->json(['message' => "Curso gratuito já pertencente ao usuário"]);

            $newUserCourse = new UserProduct();
            $newUserCourse->user_id = $request->user()->id;
            $newUserCourse->payment_id = null;
            $newUserCourse->type_product = 'course';
            $newUserCourse->course_id = $course_id;

            if( !$newUserCourse->save() )
                throw new Exception("An error occured while saving user courses");

            return response()->json(['message' => "Curso adicionado ao usuário"]);

        }catch(Exception $e){

            Log::error($e->getMessage());

            return response()->json([
                'error'     => "An unexpected error occurred",
            ], 500);
        }
    }
}
