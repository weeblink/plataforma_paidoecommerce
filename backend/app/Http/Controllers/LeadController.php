<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Mockery\Exception;

/**
 * @OA\Schema(
 *     schema="Lead",
 *     @OA\Property(
 *         property="id",
 *         type="integer"
 *     ),
 *     @OA\Property(
 *         property="name",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="email",
 *         type="string"
 *     ),
 *     @OA\Property(
 *         property="phone",
 *         type="string"
 *     ),
 *     @OA\Property(
 *          property="cpf",
 *          type="string"
 *      ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time"
 *     ),
 *     example={"id": 1, "name": "João", "email": "m@exemplo.com", "phone": "123456789", "cpf": "99999999999", "created_at": "2021-09-01T12:00:00Z"}
 * )
 */

class LeadController extends Controller {
    /**
     * @OA\Get(
     *     path="/leads",
     *     tags={"Leads"},
     *     summary="List all leads",
     *     description="List all leads",
     *     security={{"bearer_token":{}}},
     *     @OA\Response(
     *        response=200,
     *        description="List of leads",
     *        @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Lead")
     *        )
     *     )
     * )
     */
    public function listAll() {
        try{

            $userModel = new User();
            $leads = $userModel->getLeads();

            return response()->json([
                'message'   => "success",
                'data'      => $leads
            ]);

        }catch(\Exception $e){
            return response()->json([
                'error'     => 'An unexpected error has occurred'
            ], 500);
        }
    }

    public function search( Request $request )
    {
        try{

            $userModel = new User();

            return response()->json([
                'message'   => 'success',
                'data'      => $userModel->searchLeads( $request->query('q') )
            ]);

        }catch(Exception $e){
            return response()->json([
                'error' => "An unexpected error has occurred"
            ], 500);
        }
    }
}
