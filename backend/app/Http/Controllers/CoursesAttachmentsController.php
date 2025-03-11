<?php

namespace App\Http\Controllers;

use App\Http\Requests\attachments\SaveAttachmentRequest;
use App\Models\Courses;
use App\Models\CoursesAttachments;
use App\Models\CoursesClass;
use Illuminate\Http\Request;

class CoursesAttachmentsController extends Controller
{
    /**
    * @OA\Get(
    *     path="/attachments/{class_id}",
    *     tags={"Classes Attachments"},
    *     summary="List all Attachments",
    *     description="List all Attachments",
    *     security={{"bearer_token": {}}},
    *     @OA\Parameter(
    *         name="class_id",
    *         in="path",
    *         required=true,
    *         description="Classe ID",
    *         @OA\Schema(
    *             type="string"
    *         )
    *     ),
    *     @OA\Response(
    *         response=200,
    *         description="success",
    *         @OA\JsonContent(
    *             @OA\Property(property="message", type="string", example="success"),
    *             @OA\Property(property="data", type="array", @OA\Items(
    *                 @OA\Property(property="id", type="string", example="9d473bbf-1af4-429d-abf6-2f791515f664"),
    *                 @OA\Property(property="title", type="string", example="Arquivo 01"),
    *                 @OA\Property(property="path", type="string", example="http://localhost:8000/storage/courses/attachments/9d473bbf-1af4-429d-abf6-2f791515f664/Arquivo_01.pdf"),
    *                 @OA\Property(property="size", type="number", example=1.5),
    *             ))
    *         )
    *     ),
    *     @OA\Response(
    *         response=404,
    *         description="Not Found",
    *         @OA\JsonContent(
    *             @OA\Property(property="error", type="string", example="Class not founded")
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
    public function listAll( $classId ): \Illuminate\Http\JsonResponse
    {
        try{
            $attachments = new CoursesAttachments();
            $attachments = $attachments->listAll( $classId );

            return response()->json( [
                'message' => 'success',
                'data' => $attachments
            ]);

        }catch(\Exception $e){
            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }


    /**
     * @OA\Post(
     *      path="/attachments/{class_id}",
     *      tags={"Classes Attachments"},
     *      summary="Save new Attachment for Classe",
     *      description="Save new Attachment for Classe",
     *      security={{"bearer_token": {}}},
     *      @OA\Parameter(
     *          name="class_id",
     *          in="path",
     *          required=true,
     *          description="Classe ID",
     *          @OA\Schema(
     *              type="string"
     *          )
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  schema="CourseAttachment",
     *                  @OA\Property(
     *                      property="title",
     *                      type="string"
     *                  ),
     *                  @OA\Property(
     *                      property="file",
     *                      type="string",
     *                      format="binary",
     *                      description="File"
     *                  ),
     *                  example={"title":"Arquivo 01", "file": "<binary>"}
     *              )
     *          )
     *      ),
     *     @OA\Response(
     *          response=200,
     *          description="success",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="File added successfully"),
     *              @OA\Property(property="attachment_id", type="string", example="9d473bbf-1af4-429d-abf6-2f791515f664"),
     *          )
     *      ),
     *     @OA\Response(
     *          response=403,
     *          description="Unauthorized",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Unauthorized")
     *          )
     *      ),
     *     @OA\Response(
     *          response=404,
     *          description="Not Found",
     *          @OA\JsonContent(
     *              @OA\Property(property="error", type="string", example="Class not founded")
     *          )
     *      ),
     *     @OA\Response(
     *          response=500,
     *          description="Internal Server Error",
     *          @OA\JsonContent(
     *              @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *          )
     *      )
     * )
     */
    public function saveAttachment( SaveAttachmentRequest $request, $class_id ): \Illuminate\Http\JsonResponse
    {
        try{

            $classModel = CoursesClass::find($class_id);

            if( empty( $classModel ) )
                return response(  )->json(['error' => 'Class not founded'], 404);

            $attachment = new CoursesAttachments();
            $attachment->saveFile(
                $request->input('title'),
                $request->file('file'),
                $class_id,
            );

            return response()->json([
                'message' => 'File added successfully',
                'attachment_id' => $attachment->id
            ], 200);

        }catch(\Exception $e){
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete (
     *     path="/attachments/{attachment_id}",
     *     tags={"Classes Attachments"},
     *     summary="Delete Attachment",
     *     description="Delete Attachment",
     *     security={{"bearer_token": {}}},
     *     @OA\Parameter(
     *          name="class_id",
     *          in="path",
     *          required=true,
     *          description="Classe ID",
     *          @OA\Schema(
     *              type="string"
     *          )
     *      ),
     *     @OA\Response(
     *           response=200,
     *           description="success",
     *           @OA\JsonContent(
     *               @OA\Property(property="message", type="string", example="Attachment has been deleted"),
     *           )
     *       ),
     *      @OA\Response(
     *           response=403,
     *           description="Unauthorized",
     *           @OA\JsonContent(
     *               @OA\Property(property="message", type="string", example="Unauthorized")
     *           )
     *       ),
     *      @OA\Response(
     *           response=404,
     *           description="Not Found",
     *           @OA\JsonContent(
     *               @OA\Property(property="error", type="string", example="Attachment not founded")
     *           )
     *       ),
     *      @OA\Response(
     *           response=500,
     *           description="Internal Server Error",
     *           @OA\JsonContent(
     *               @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *           )
     *       )
     * )
     */
    public function deleteAttachment( Request $request, $attchment_id ): \Illuminate\Http\JsonResponse
    {
        try{

            $attachment = CoursesAttachments::find($attchment_id);

            if( empty( $attachment ) )
                return response(  )->json(['error' => 'Attachment not founded'], 404);

            $attachment->deleteAttachment();

            return response()->json([
                'message' => 'Attachment has been deleted'
            ], 200);

        }catch(\Exception $e){
            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }
}
