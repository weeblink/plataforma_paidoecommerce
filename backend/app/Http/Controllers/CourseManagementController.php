<?php

namespace App\Http\Controllers;

use App\Http\Requests\courses_management\CreateOrUpdateCourseRequest;
use App\Models\Courses;
use \Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Schema(
 *     schema="CourseManagement",
 *    @OA\Property (
 *          property="hs_identifier",
 *          type="string"
 *    ),
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
 *          property="thumbnail",
 *          type="string",
 *          format="binary",
 *          description="Thumbnail image of the course"
 *     ),
 *     @OA\Property(
 *         property="is_pay",
 *         type="boolean"
 *     ),
 *
 *     example={"title": "Curso de PHP", "price": 100.00, "promotional_price": 50.00 }
 * )
 */

class CourseManagementController extends Controller
{

    /**
     * @OA\Get(
     *     path="/courses-management",
     *     tags={"Course Management"},
     *     summary="List all courses",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Course")
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
    public function listAll(Request $request): \Illuminate\Http\JsonResponse
    {

        try {

            $courses = Courses::listAll();

            return response()->json([
                'message'       => "success",
                'data'          => $courses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error"     => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/courses-management/{id}",
     *     tags={"Course Management"},
     *     summary="List one course",
     *     description="List one course",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Course ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="success"),
     *             @OA\Property(property="data", type="object", ref="#/components/schemas/Course")
     *         ),
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
    public function listOne(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $courseModel = Courses::find($id);

            $course = Courses::listOne($courseModel);

            return response()->json([
                'message'       => "success",
                'data'          => $course
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error"     => $e->getMessage()
            ], 500);
        }
    }

    public function search( Request $request ){
        try {

            $course = Courses::where('title', 'like', "%" . $request->query('q') . "%")->get();

            return response()->json([
                'message'       => "success",
                'data'          => $course
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error"     => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/courses-management",
     *     tags={"Course Management"},
     *     summary="Create a new course",
     *     description="Create a new course",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *           @OA\MediaType(
     *               mediaType="multipart/form-data",
     *               @OA\Schema(ref="#/components/schemas/CourseManagement")
     *           )
     *      ),
     *     @OA\Response(
     *        response=201,
     *        description="Course created successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Course created successfully"),
     *            @OA\Property(property="course_id", type="string", example="uuid")
     *        )
     *     )
     * )
     */
    public function create(CreateOrUpdateCourseRequest $request): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try {

            $courseModel = new Courses();

            $uuid = $courseModel->createOrUpdate(
                $request->input('title'),
                $request->input('price'),
                $request->input('promotional_price'),
                $request->file('thumbnail'),
                $request->input('is_pay')
            );

            DB::commit();

            return response()->json([
                'message'   => "Course created successfully",
                'course_id' => $uuid
            ]);
        } catch (\Exception $e) {

            DB::rollback();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post (
     *     path="/courses-management/update/{id}",
     *     tags={"Course Management"},
     *     summary="Update a course",
     *     description="Update a course",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Course ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(ref="#/components/schemas/CourseManagement")
     *          )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Course updated successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Course updated successfully")
     *        )
     *     )
     * )
     */
    public function update(CreateOrUpdateCourseRequest $request, $id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();

        try {

            $courseModel = Courses::find($id);

            $courseModel->createOrUpdate(
                $request->input('title'),
                $request->input('price'),
                $request->input('promotional_price'),
                $request->file('thumbnail'),
                $request->input('is_pay')
            );

            DB::commit();

            return response()->json([
                'message'   => "Course updated successfully",
            ]);
        } catch (\Exception $e) {

            DB::rollback();

            return response()->json([
                'message' => 'An unexpected error has occurred.',
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/courses-management/{id}",
     *     tags={"Course Management"},
     *     summary="Delete a course",
     *     description="Delete a course",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Course ID",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Course deleted successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Course deleted successfully")
     *        )
     *     )
     * )
     */
    public function delete(Request $request, $id): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try {

            $courseModel = Courses::find($id);
            $courseModel->deleteVideos(  );
            $courseModel->delete();

            DB::commit();

            return response()->json(['message' => "Course deleted successfully"]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Course deleted successfully',
            ], 500);
        }
    }
}
