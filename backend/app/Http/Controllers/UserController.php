<?php

namespace App\Http\Controllers;

use App\Http\Requests\user\UpdateProfileRequest;
use App\Models\User;
use \Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
* @OA\Schema(
*     schema="EditProfile",
*     @OA\Property(
*         property="name",
*         type="string"
*     ),
*     @OA\Property(
*         property="phone",
*         type="string"
*     ),
*     @OA\Property(
*         property="password",
*         type="string"
*     ),
*     @OA\Property(
*         property="confirmPassword",
*         type="string"
*     ),
*     example={"name": "João", "phone": "123456789", "password": "123456", "confirmPassword": "123456"}
* )
*/

class UserController extends Controller {
    /**
    * @OA\Put(
    *     path="/profile/{id}",
    *     tags={"User"},
    *     summary="Edit profile",
    *     description="Edit profile",
    *     security={{"bearer_token":{}}},
    *     @OA\Parameter(
    *         name="id",
    *         in="path",
    *         description="User ID",
    *         required=true,
    *         @OA\Schema(
    *             type="integer"
    *         )
    *     ),
    *     @OA\RequestBody(
    *         @OA\MediaType(
    *             mediaType="application/json",
    *             @OA\Schema(ref="#/components/schemas/EditProfile")
    *         )
    *     ),
    *     @OA\Response(
    *        response=200,
    *        description="Profile updated successfully",
    *        @OA\JsonContent(
    *            @OA\Property(property="message", type="string", example="Profile updated successfully")
    *        )
    *     )
    * )
     */
    public function updateProfile(UpdateProfileRequest $request, $id): \Illuminate\Http\JsonResponse
    {

        DB::beginTransaction();

        try{

            $userModel = User::find($id);

            $userModel->updateProfile(
                $request->input('name'),
                $request->input('phone'),
                $request->input('password')
            );

            DB::commit();

            return response()->json([
                'message'   => "Profile updated successfully"
            ]);

        }catch(\Exception $e){

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/profile",
     *     tags={"User"},
     *     summary="Get profile",
     *     description="Get profile of the authenticated user",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profile data",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Success data profile"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Arthur"),
     *                 @OA\Property(property="phone", type="string", example="31975547967"),
     *                 @OA\Property(property="cpf", type="string", example="99999999999"),
     *                 @OA\Property(property="user_type", type="string", example="ADMIN"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Unexpected error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function getProfileData(Request $request): \Illuminate\Http\JsonResponse
    {
        try {

            $user = $request->user();
            $profileData = $user->getProfileData();

            return response()->json([
                'message' => "Success data profile",
                'data' => $profileData
            ], 200);

        }catch (\Exception $e){
            return response()->json([
                'error' => "An unexpected error occurred"
            ], 500);
        }
    }
}
