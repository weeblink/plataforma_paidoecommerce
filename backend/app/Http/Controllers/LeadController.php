<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddNewLead;
use App\Http\Requests\AllowAccessLeadRequest;
use App\Models\Order;
use App\Models\User;
use App\Models\UserProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'teste'     => $e->getMessage(),
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

    public function delete( Request $request, $id ){
        try{

            $lead = User::find($id);

            if( !$lead )
                return response()->json(['error' => "Não foi possível localizar o lead desejado"], 404);

            Order::where('customer_id', $lead->id)->delete();

            if( ! $lead->delete() )
                return response()->json(['error' => 'Ocorreu um erro inesperado ao tentar remover o lead'], 500);

            return response(null, 204);

        }catch(Exception $e){
            return response()->json([
                'error' => "An unexpected error has occurred"
            ], 500);
        }
    }

    public function allowAccess(AllowAccessLeadRequest $request, $id){
        try{

            $lead = User::find($id);

            if( !$lead )
                return response()->json(['error' => "Não foi possível localizar o lead desejado"], 404);

            $query = UserProduct::where('user_id', $lead->id);
        
            // Only add conditions for non-null values
            if ($request->course_id) {
                $query->where('course_id', $request->course_id);
            }
            
            if ($request->extra_id) {
                $query->where('extra_id', $request->extra_id);
            }
            
            if ($request->group_id) {
                $query->where('group_id', $request->group_id);
            }
            
            $existingProduct = $query->first();
            
            if(!$existingProduct){
                $newUserProduct = new UserProduct([
                    'user_id'       => $id,
                    'payment_id'    => null,
                    'course_id'     => $request->course_id,
                    'extra_id'      => $request->extra_id,
                    'group_id'      => $request->group_id,
                    'type_product'  => $request->type_product
                ]);

                if( !$newUserProduct->save() )
                    return response()->json(['error' => 'Ocorreu um erro inesperado ao tentar salvar liberação'], 500);  
            }                      

            return response(null, 204);

        }catch(Exception $e){
            return response()->json([
                'error' => "An unexpected error has occurred"
            ], 500);
        }
    }

    public function removeAccess( Request $request, $id, $productId ){
        try {
            $lead = User::findOrFail($id);

            if(!$lead)
                return response()->json(['error' => 'Ocorreu um erro inesperado ao tentar encontrar o lead'], 404);
            
            $userProduct = UserProduct::where('user_id', $lead->id)
                ->where('id', $productId)
                ->firstOrFail();
                
            $userProduct->delete();
            
            return response(null, 204);
            
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Ocorreu um erro ao remover o acesso: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addNew(AddNewLead $request){
        DB::beginTransaction();
        try{
            $userModel = new User();
            $token = $userModel->register($request->input('name'), $request->input('cpf'), $request->input('email'), $request->input('password'), true);
            DB::commit();

            return response()->json([
                'message'   => "Register Success",
                'data'      => [
                    'token'     => $token
                ]
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Ocorreu um erro ao remover o acesso: ' . $e->getMessage()
            ], 500);
        }
    }
}
