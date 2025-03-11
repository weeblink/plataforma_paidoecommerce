<?php

namespace App\Http\Controllers;

use App\Classes\PandaVideo\PandaVideo;
use App\Http\Requests\class\CreateOrUpdateClassRequest;
use App\Http\Requests\class\SwapOrderClassesRequest;
use App\Http\Requests\class\UploadVideoCourseRequest;
use App\Models\CoursesClass;
use App\Models\CoursesModules;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Pion\Laravel\ChunkUpload\Handler\ChunkUploadHandler;
use Pion\Laravel\ChunkUpload\Handler\HandlerFactory;
use Pion\Laravel\ChunkUpload\Receiver\FileReceiver;

/**
 * @OA\Schema(
 *     schema="ClassCreateAndUpdate",
 *     required={"title", "description", "pv_video_id"},
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="description",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="pv_video_id",
 *         type="string"
 *     )
 * )
 */

class ClassesController extends Controller
{
    /**
     * @OA\Post(
     *     path="/classes/{moduleId}",
     *     tags={"Classes"},
     *     summary="Create a new class",
     *     description="Create a new class",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="moduleId",
     *         in="path",
     *         required=true,
     *         description="Module ID",
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="title",
     *                     type="string",
     *                     description="Class name"
     *                 ),
     *                 @OA\Property(
     *                     property="description",
     *                     type="string",
     *                     description="Class description"
     *                 ),
     *                 @OA\Property(
     *                     property="pv_video_id",
     *                     type="string",
     *                     description="Embed from video"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=201,
     *        description="Class created successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Class created successfully"),
     *            @OA\Property(property="class_id", type="string", example="uuid")
     *        )
     *     )
     * )
     */
    public function create(CreateOrUpdateClassRequest $request, string $moduleId): \Illuminate\Http\JsonResponse
    {
        try {
            $moduleModel = CoursesModules::find($moduleId);

            if (empty($moduleModel)) abort(404);


            $classModel = new CoursesClass();
            $classId = $classModel->createOrUpdate($moduleId, [
                'title' => $request->title,
                'description' => $request->description,
            ]);

            $moduleModel->addNewClass();

            $course = $moduleModel->course;
            $course->addNewClass();

            return response()->json([
                'message' => 'Class created successfully',
                'class_id' => $classId,
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadVideo(UploadVideoCourseRequest $request, $id): JsonResponse
    {
        try {
            $class = CoursesClass::find($id);
            if (empty($class)) abort(404);

            $receiver = new FileReceiver('file', $request, HandlerFactory::classFromRequest($request) );

            if (!$receiver->isUploaded()) {
                return response()->json(['error' => 'No file uploaded'], 400);
            }

            $handler = $receiver->receive();
            if ($handler->isFinished()) {

                $file = $handler->getFile();
                $filePath = $file->store("uploads/videos/{$id}", 'public');

                if( !$filePath )
                    throw new Exception("An unexpected error occurred while uploading the file.");

                $class->saveVideoOnPanda(
                    $file->getRealPath(),
                    $class->module->course->title,
                    $class->title
                );

                return response()->json(['done' => true, 'path' => $filePath]);
            }

            return response()->json([
                'done' => false,
                'percentage' => ($request->resumableChunkNumber / $request->resumableTotalChunks) * 100
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/classes/{id}",
     *     tags={"Classes"},
     *     summary="Update a class",
     *     description="Update a class",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Class ID",
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/ClassCreateAndUpdate")
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Class updated successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Class updated successfully")
     *        )
     *     ),
     *      @OA\Response(
     *         response=500,
     *         description="Class updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while updating class.")
     *         )
     *      )
     * )
     */
    public function update(CreateOrUpdateClassRequest $request, $id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();

        try {

            $classModel = CoursesClass::find($id);

            if (empty($classModel)) abort(404);

            $classModel->createOrUpdate($classModel->module_id, $request->only(['title', 'description']));

            DB::commit();

            return response()->json([
                'message' => 'Class updated successfully',
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => 'An error occurred while updating class.',
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/classes/{id}",
     *     tags={"Classes"},
     *     summary="Delete a class",
     *     description="Delete a class",
     *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Class ID",
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Class deleted successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Class deleted successfully")
     *        )
     *     ),
     *      @OA\Response(
     *         response=500,
     *         description="Class deleted error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error ocourred")
     *         )
     *      )
     * )
     */
    public function delete(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();

        try {

            $courseClass = CoursesClass::find($id);

            if ($courseClass === null) return response()->json(['error' => 'Class not found'], 404);

            $courseClass->deleteVideoOnPanda(  );
            $courseClass->delete();

            $module = $courseClass->module;
            $course = $module->course;

            $module->removeClass();
            $course->removeClass();

            CoursesClass::rearrangeSequence($courseClass->sequence);

            DB::commit();

            return response()->json([
                'message' => 'Class deleted successfully',
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            Log::error("[ DELETE VIDEO ] " . $e->getMessage());

            return response()->json([
                'error' => $e,
            ], 500);
        }
    }

    /**
     * @OA\Patch(
     *     path="/classes/swap-order",
     *     tags={"Classes"},
     *     summary="Swap class order",
     *     description="Swap class order",
     *     security={{"bearer_token":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="class1_id",
     *                     type="integer"
     *                 ),
     *                 @OA\Property(
     *                     property="class2_id",
     *                     type="integer"
     *                 ),
     *                 example={"class1_id": 1, "class2_id": 2}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="Class order swapped successfully",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Class order swapped successfully")
     *        )
     *     )
     * )
     */
    public function swapOrder(SwapOrderClassesRequest $request): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try {

            $class1 = CoursesClass::find($request->input('class1_id'));
            $class2 = CoursesClass::find($request->input('class2_id'));

            if (! $class1->swapOrder($class2))
                throw new \Exception("An error occurred while swap ordering class.");

            DB::commit();

            return response()->json([
                'message'   => "Class order swapped successfully"
            ]);
        } catch (\Exception $e) {

            DB::rollBack();
            return response()->json([
                'message' => 'An unknown error occurred while updating class.',
                'teste'     => $e->getMessage()
            ], 500);
        }
    }
}
