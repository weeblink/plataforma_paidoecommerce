<?php

namespace App\Http\Controllers;

use App\Http\Requests\whatsapp_campaigns\CreateWhatsappCampaignRequest;
use App\Models\WhatsappCampaigns;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 *     name="WhatsApp Campaigns",
 *     description="API Endpoints for WhatsApp campaign management"
 * )
 */
class WhatsappCampaignsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/whatsapp-campaigns",
     *     summary="List all WhatsApp campaigns",
     *     operationId="listAllWhatsappCampaigns",
     *     tags={"WhatsApp Campaigns"},
     *     @OA\Response(
     *         response=200,
     *         description="Campaigns retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Campaign finded correctly"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Unexpected error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occourred")
     *         )
     *     )
     * )
     */
    public function listAll( Request $request ) : JsonResponse
    {
        try{

            return response()->json([
                'message'   => "Campaign finded correctly",
                'data'      => WhatsappCampaigns::listAll()
            ]);

        }catch (Exception $e){
            Log::error("[ WHATSAPP CAMPAIGN CONTROLLER ]: " . $e->getMessage());

            return response()->json([
                'error'     => "An unexpected error occourred"
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/whatsapp-campaigns/create",
     *     summary="Create a new WhatsApp campaign",
     *     operationId="createWhatsappCampaign",
     *     tags={"WhatsApp Campaigns"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"groups_id", "title", "msg1"},
     *             @OA\Property(property="groups_id", type="array", @OA\Items(type="integer"), description="Array of group IDs"),
     *             @OA\Property(property="title", type="string", description="Campaign title"),
     *             @OA\Property(property="msg1", type="string", description="First message content"),
     *             @OA\Property(property="msg2", type="string", nullable=true, description="Second message content"),
     *             @OA\Property(property="msg3", type="string", nullable=true, description="Third message content"),
     *             @OA\Property(property="msg4", type="string", nullable=true, description="Fourth message content"),
     *             @OA\Property(property="msg5", type="string", nullable=true, description="Fifth message content")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Campaign created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Campaign created successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Unexpected error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occourred")
     *         )
     *     )
     * )
     */
    public function createNewCampaign( CreateWhatsappCampaignRequest $request ) : JsonResponse
    {
        try{

            $messages = [
                'msg1'  => $request->msg1,
                'msg2'  => $request->msg2,
                'msg3'  => $request->msg3,
                'msg4'  => $request->msg4,
                'msg5'  => $request->msg5,
            ];

            $campaign = new WhatsappCampaigns();
            $campaign->createNewCampaign(
                $request->groups_id,
                $request->title,
                $messages
            );

            return response()->json([
                'message'   => 'Campaign created successfully',
            ]);

        }catch(Exception $e){

            Log::error("[ WHATSAPP CAMPAIGN CONTROLLER ]: " . $e->getMessage());

            return response()->json([
                'error'     => "An unexpected error occourred"
            ], 500);
        }
    }
}
