<?php

namespace App\Http\Controllers;

use App\Models\WhatsappGroups;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use JsonException;

/**
 * @OA\Tag(
 *     name="Whatsapp Groups",
 *     description="API Endpoints for whatsapp groups management"
 * )
 */
class WhatsappGroupsController extends Controller
{

    public function listAll( Request $request ) : JsonResponse
    {
        try{

            return response()->json([
                'message'   => "Groups Whatsapp get successfully",
                'groups'    => WhatsappGroups::listAll()
            ]);

        }catch(Exception $e){

            Log::error("[ WHATSAPP GROUPS CONTROLLER ] : {$e->getMessage()}");

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/whatsapp-groups/count",
     *     tags={"WhatsappGroups"},
     *     summary="Get total count of WhatsApp groups",
     *     description="Returns the total number of WhatsApp groups in the system",
     *     @OA\Response(
     *         response=200,
     *         description="Groups count retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Groups count get successfully"),
     *             @OA\Property(property="qnt_groups", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error has occurred")
     *         )
     *     )
     * )
     */
    public function qntGroups( Request $request ) : JsonResponse
    {
        try{

            return response()->json([
                'message'       => "Groups count get successfully",
                'qnt_groups'    => WhatsappGroups::getGroupsCount()
            ]);

        }catch(Exception $e){

            Log::error("[ WHATSAPP GROUPS CONTROLLER ] : {$e->getMessage()}");

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
