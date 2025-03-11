<?php

namespace App\Http\Controllers;

use App\Http\Requests\modules\CreateOrUpdateModulesRequest;
use App\Http\Requests\modules\SwapOrderModuleRequest;
use App\Models\CoursesModules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Schema(
 *     schema="CourseModulesUpdate",
 *     @OA\Property(
 *         property="title",
 *         type="string"
 *     ),
 * )
 * */

class ModulesController extends Controller {

    /**
    * @OA\Post(
    *     path="/modules/{course_id}",
    *     tags={"Modules"},
    *     summary="Create a new module",
    *     description="Create a new module",
    *     security={{"bearer_token":{}}},
     *     @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          description="Course ID",
     *          @OA\Schema(
     *              type="string"
     *          )
     *      ),
     *     @OA\RequestBody(
     *          @OA\MediaType(
     *              mediaType="application/json",
     *              @OA\Schema(
     *                  @OA\Property(
     *                      property="title",
     *                      type="string"
     *                  ),
     *                  example={"title": "Módulo 01"}
     *              )
     *          )
     *    ),
    *     @OA\Response(
    *        response=201,
    *        description="Module created successfully",
    *        @OA\JsonContent(
    *            @OA\Property(property="message", type="string", example="Module created successfully"),
    *            @OA\Property(property="module_id", type="string", example="uuid")
    *        )
    *     )
    * )
    */
    public function create( CreateOrUpdateModulesRequest $request, $course_id ): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try{

            $moduleModel = new CoursesModules();
            $moduleId = $moduleModel->createOrUpdateModule( $course_id, $request->input('title') );

            DB::commit();

            return response()->json([
                'message'   => 'Module created successfully',
                'module_id' => $moduleId
            ]);

        }catch(\Exception $e){

            DB::rollback();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
    * @OA\Put(
    *     path="/modules/{id}",
    *     tags={"Modules"},
    *     summary="Update a module",
    *     description="Update a module",
    *     security={{"bearer_token":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         required=true,
    *         description="Module ID",
    *         @OA\Schema(
    *             type="integer"
    *         )
    *     ),
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(ref="#/components/schemas/CourseModulesUpdate")
    *     ),
    *     @OA\Response(
    *        response=200,
    *        description="Module updated successfully",
    *        @OA\JsonContent(
    *            @OA\Property(property="message", type="string", example="Module updated successfully")
    *        )
    *     )
    * )
    */
    public function update( CreateOrUpdateModulesRequest $request, $id): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try{

            $moduleModel = CoursesModules::find($id);

            if( empty($moduleModel) ) abort(404);

            $moduleModel->createOrUpdateModule(
                $moduleModel->course_id,
                $request->input('title')
            );

            DB::commit();

            return response()->json([
                'message' => 'Module updated successfully',
            ]);

        }catch(\Exception $e){

            DB::rollback();

            return response()->json([
                'error' => 'An unexpected error occurred',
            ], 500);
        }
    }

    /**
    * @OA\Delete(
    *     path="/modules/{id}",
    *     tags={"Modules"},
    *     summary="Delete a module",
    *     description="Delete a module",
    *     security={{"bearer_token":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         required=true,
    *         description="Module ID",
    *         @OA\Schema(
    *             type="integer"
    *         )
    *     ),
    *     @OA\Response(
    *        response=200,
    *        description="Module deleted successfully",
    *        @OA\JsonContent(
    *            @OA\Property(property="message", type="string", example="Module deleted successfully")
    *        )
    *     )
    * )
    */
    public function delete( Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try{

           $moduleModel = CoursesModules::find($id);

           if( empty($moduleModel) ) abort(404);

           $moduleModel->deleteVideos(  );

            CoursesModules::rearrangeSequence( $moduleModel->sequence );
            $moduleModel->delete();

            DB::commit();

            return response()->json([
                'message' => 'Module deleted successfully',
            ]);

        }catch(\Exception $e){

            DB::rollback();

            return response()->json([
                'error' => 'An unexpected error occurred',
            ], 500);
        }
    }

    /**
    * @OA\Patch(
    *     path="/modules/swap-order",
    *     tags={"Modules"},
    *     summary="Swap module order",
    *     description="Swap module order",
    *     security={{"bearer_token":{}}},
    *     @OA\RequestBody(
    *         @OA\MediaType(
    *             mediaType="application/json",
    *             @OA\Schema(
    *                 @OA\Property(
    *                     property="module1_id",
    *                     type="integer"
    *                 ),
    *                 @OA\Property(
    *                     property="module2_id",
    *                     type="integer"
    *                 ),
    *                 example={"module1_id": 1, "module2_id": 2}
    *             )
    *         )
    *     ),
    *     @OA\Response(
    *        response=200,
    *        description="Module order swapped successfully",
    *        @OA\JsonContent(
    *            @OA\Property(property="message", type="string", example="Module order swapped successfully")
    *        )
    *     )
    * )
    */
    public function swapOrder( SwapOrderModuleRequest $request ): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try{

            $module1 = CoursesModules::find($request->input('module1_id'));
            $module2 = CoursesModules::find($request->input('module2_id'));

            if( ! $module1->swapOrder( $module2 ) )
                throw new \Exception("An unexpected error occurred");

            DB::commit();

            return response()->json([
                'message' => 'Module order updated successfully',
            ]);

        }catch(\Exception $e){

            DB::rollback();
            return response()->json([
                'error' => 'An unexpected error occurred',
            ], 500);
        }
    }

}
