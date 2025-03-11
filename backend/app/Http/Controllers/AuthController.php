<?php

namespace App\Http\Controllers;

use App\Http\Requests\auth\LoginRequest;
use App\Http\Requests\auth\RecoveryPasswordRequest;
use App\Http\Requests\auth\RegisterRequest;
use App\Http\Requests\auth\ResetPasswordRequest;
use App\Http\Requests\auth\VerifyTokenResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use function Illuminate\Log\log;

/**
 * @OA\Schema(
 *     schema="UserProfile",
 *     required={"name","cpf","user_type","phone", "token"},
 *     @OA\Property(
 *          property="name",
 *          type="string",
 *     ),
 *     @OA\Property(
 *          property="cpf",
 *          type="string"
 *     ),
 *     @OA\Property(
 *          property="user_type",
 *          type="string"
 *     ),
 *     @OA\Property(
 *          property="phone",
 *          type="string"
 *     ),
 *     @OA\Property(
 *          property="token",
 *          type="string"
 *     )
 * )
 */

class AuthController extends Controller
{

    /**
     * @OA\Post(
     *     path="/login",
     *     tags={"Auth"},
     *     summary="Login",
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="email",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="password",
     *                     type="string"
     *                 ),
     *                 example={"email": "m@exemplo.com", "password": "123456"}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="OK",
     *        @OA\JsonContent(
     *           @OA\Property(property="message", type="string", example="Login Success"),
     *          @OA\Property(
     *             property="data",
     *            type="object",
     *           @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxIn0")
     *       )
     *    ),
     *        )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad Request",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid input data")
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
    public function login(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        try {

            $userModel = new User();
            $login = $userModel->login($request->only('email', 'password'));

            if (! $login['logged'])
                return response()->json(['error' => 'Credenciais inválidas'], 400);

            return response()->json([
                'message'   => "Login Success",
                'data'      => [
                    'user'     => $login['user']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/logout",
     *     tags={"Auth"},
     *     summary="Logout",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *        response=200,
     *        description="OK",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Logout Success")
     *        )
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
    public function logout(): \Illuminate\Http\JsonResponse
    {
        try {

            Auth::logout();
            return response()->json(['message' => "Logout Success"]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An unexpected error occurred'
            ], 500);
        }
    }

    // const formSchema = z.object({
    //     name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    //     cpf: z.string().refine((value) => value.replace(/\D/g, '').length === 11, {
    //       message: 'Insira um CPF válido',
    //     }),
    //     email: z.string().email('Insira um email válido'),
    //     password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    //   })

    /**
     * @OA\Post(
     *     path="/register",
     *     tags={"Auth"},
     *     summary="Register",
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="name",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="cpf",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="email",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="password",
     *                     type="string"
     *                 ),
     *                  @OA\Property(
     *                      property="confirmPassword",
     *                      type="string"
     *                  ),
     *                 example={"name": "Maria", "cpf": "123.456.789-09", "email": "m@exemplo.com", "password": "123456", "confirmPassword": "123456"}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="OK",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Register Success")
     *        )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad Request",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid input data")
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
    public function register(RegisterRequest $request): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();

        try {

            $userModel = new User();
            $token = $userModel->register($request->input('name'), $request->input('cpf'), $request->input('email'), $request->input('password'));

            DB::commit();

            return response()->json([
                'message'   => "Register Success",
                'data'      => [
                    'token'     => $token
                ]
            ]);
        } catch (\Exception $e) {

            DB::rollback();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/password/recover",
     *     tags={"Auth"},
     *     summary="Forgot Password",
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="email",
     *                     type="string"
     *                 ),
     *                 example={"email": "m@exemplo.com"}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="OK",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Recover Password Success"),
     *        )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad Request",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid input data")
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
    public function requestPasswordRecovery(RecoveryPasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        try {

            $userModel = new User();
            $userModel->passwordRecovery($request->input('email'));

            return response()->json(['message' => "Recover Password Success"]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/password/reset",
     *     tags={"Auth"},
     *     summary="Reset Password",
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="token",
     *                     type="string"
     *                 ),
     *                 @OA\Property(
     *                     property="password",
     *                     type="string"
     *                 ),
     *                  @OA\Property(
     *                       property="confirmPassword",
     *                       type="string"
     *                   ),
     *                 example={"token": "123456", "password": "123456", "confirmPassword": "123456"}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *        response=200,
     *        description="OK",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string", example="Reset Password Success"),
     *        )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad Request",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid input data")
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
    public function resetPassword(ResetPasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        try {

            $userModel = new User();
            $userModel->resetPassword($request->input('token'), $request->input('password'));

            return response()->json(['message' => "Reset Password Success"]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/refresh_token",
     *     tags={"Auth"},
     *     summary="Refresh Token",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *          response=200,
     *          description="Token refreshed",
     *          @OA\JsonContent(ref="#/components/schemas/UserProfile")
     *     ),
     *     @OA\Response(
     *          response=403,
     *          description="Unauthorized",
     *          @OA\JsonContent(
     *              @OA\Property (property="message", type="string", example="Unauthenticated")
     *          )
     *     )
     * )
     */
    public function refreshToken(Request $request): \Illuminate\Http\JsonResponse|array
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message'   => "Unauthenticated",
                'user'      => $user
            ], 403);
        }

        $user->currentAccessToken()->delete();

        return [
            'status' => 'success',
            'data' => [
                'user' => $user->getSerializedUserData()
            ]
        ];
    }

    public function verifyTokenResetPassword(VerifyTokenResetRequest $request): \Illuminate\Http\JsonResponse
    {
        try {

            $userModel = new User();
            $token = $request->input('token');

            if (! $userModel->isValidToken($token)) {
                return response()->json([
                    'error'     => "Invalid Token"
                ], 403);
            }

            return response()->json([
                'message'   => "Valid Token!"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => "An unexpected error occurred",
                'teste' => $e->getMessage()
            ], 500);
        }
    }
}
