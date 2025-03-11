<?php

namespace App\Http\Controllers;

use App\Models\Participants;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Participants",
 *     description="API Endpoints for participants management"
 * )
 */
class ParticipantsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/participants/count",
     *     tags={"Participants"},
     *     summary="Get total count of participants",
     *     description="Returns the total number of participants in the system",
     *     @OA\Response(
     *         response=200,
     *         description="Participants count retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Count participants get successfully"),
     *             @OA\Property(property="qnt_participants", type="integer", example=100)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal Server Error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An unexpected error occourred")
     *         )
     *     )
     * )
     */
    public function qntParticipants(  ) : JsonResponse
    {
        try{

            return response()->json([
                'message'   => "Count participants get successfully",
                'qnt_participants'  => Participants::getParticipantsGroups()
            ]);

        }catch(Exception $e){
            return response()->json([
                'error'     => "An unexpected error occourred"
            ], 500);
        }
    }
}
