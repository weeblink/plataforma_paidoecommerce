<?php

namespace App\Http\Controllers;

use App\Http\Requests\email_marketing\EmailMarketingSendRequest;
use App\Models\EmailMarketing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Mockery\Exception;

class EmailMarketingController extends Controller
{
    /**
     * @OA\Post(
     *     path="/email-marketing/send",
     *     tags={"Email Marketing"},
     *     summary="Send new email marketing",
     *     description="Send new email marketing to Leads",
     *     security={{"bearer_token": {}}},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\MediaType(
     *              mediaType="multipart/form-data",
     *              @OA\Schema(
     *                  schema="EmailMarketing",
     *                  @OA\Property(
     *                      property="broadcast",
     *                      type="boolean",
     *                  ),
     *                  @OA\Property (
     *                      property="contacts",
     *                      type="json",
     *                  ),
     *                  @OA\Property (
     *                      property="message",
     *                      type="string",
     *                  ),
     *                  @OA\Property (
     *                      property="type_action",
     *                      type="string",
     *                  ),
     *                  @OA\Property (
     *                      property="link",
     *                      type="string"
     *                  ),
     *                  @OA\Property(
     *                       property="file",
     *                       type="string",
     *                       format="binary",
     *                       description="File"
     *                   ),
     *                  example={"broadcast":true,"contacts": "[]", "message": "Mensagem de teste", "type_action": "link", "link": "https://imperiumdigital.com.br", "file": null}
     *              )
     *          )
     *     ),
     *     @OA\Response (
     *          response="200",
     *          description="success",
     *          @OA\JsonContent(
     *              @OA\Property (property="message", type="string", example="Successfully scheduled email sending"),
     *          )
     *     ),
     *     @OA\Response (
     *          response=403,
     *          description="Unauthorized",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Unauthorized")
     *          )
     *     ),
     *      @OA\Response(
     *           response=500,
     *           description="Internal Server Error",
     *           @OA\JsonContent(
     *               @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *           )
     *       )
     * )
     */
    public function send( EmailMarketingSendRequest $request ): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try{

            $emailMarketingModel = new EmailMarketing();

            $leads = $emailMarketingModel->getAllLeads();
            $emailMarketingModel->saveNewEmail( $request->all(  ), $leads );

            $emailMarketingModel->scheduleMail( $leads );

            DB::commit();

            return response()->json([
                'message'   => "Successfully scheduled email sending"
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/email-marketing/{email_id}",
     *     summary="Remove a scheduled email",
     *     description="Deletes an email scheduled for sending by its ID",
     *     tags={"Email Marketing"},
     *     @OA\Parameter(
     *         name="email_id",
     *         in="path",
     *         required=true,
     *         description="ID of the email to be deleted",
     *         @OA\Schema(type="uuid")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Email sending removed",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="Email sending removed")
     *         )
     *     ),
     *     @OA\Response(
     *          response=404,
     *          description="Email not founded",
     *          @OA\JsonContent(
     *              type="object",
     *              @OA\Property(property="error", type="string", example="Email not founded")
     *          )
     *      ),
     *     @OA\Response(
     *         response=500,
     *         description="Unexpected error occurred",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function remove( Request $request, $email_id ): \Illuminate\Http\JsonResponse
    {

        try {

            $emailMarketing = EmailMarketing::find($email_id);

            if (empty($emailMarketing))
                return response()->json(['error' => 'Email not founded'], 404);

            $emailMarketing->removeFileIfExists(  );

            if( ! $emailMarketing->scheduled ) {
                $emailMarketing->delete();
                return response()->json(['message' => "Email sending removed"]);
            }

            $emailMarketing->removeScheduledEmails(  );
            $emailMarketing->delete();

            return response()->json(['message' => "Email sending removed"]);

        }catch(\Exception $e){

            return response()->json(['error' => "An unexpected error occurred"], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/email-marketing/metrics/{email_id}",
     *     summary="Get metrics for a specific email",
     *     description="Retrieves metrics for the specified email marketing campaign by its ID.",
     *     operationId="getEmailMetrics",
     *     tags={"Emails"},
     *     @OA\Parameter(
     *         name="email_id",
     *         in="path",
     *         required=true,
     *         description="ID of the email marketing campaign",
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Metrics founded",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="metrics founded"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="string", example="9d67237d-5564-4311-b64f-7d67fa62407c"),
     *                 @OA\Property(property="broadcast", type="boolean", example=true),
     *                 @OA\Property(property="subject", type="string", example="Email final! 3"),
     *                 @OA\Property(property="message", type="string", example="essa é um email de teste"),
     *                 @OA\Property(property="contacts_count", type="integer", example=0),
     *                 @OA\Property(property="scheduled", type="boolean", example=false),
     *                 @OA\Property(property="schedule_time", type="string", nullable=true, example=null),
     *                 @OA\Property(property="type_action", type="string", example="link"),
     *                 @OA\Property(property="link", type="string", example="https://imperiumdigital.com.br"),
     *                 @OA\Property(property="file_url", type="string", example=""),
     *                 @OA\Property(property="leads_seen", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="email", type="string", example="asarmond82@gmail.com"),
     *                         @OA\Property(property="name", type="string", example="Arthur Souza Armond")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Email not found",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="error", type="string", example="Email not founded")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Unexpected error occurred",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="error", type="string", example="An unexpected error occurred")
     *         )
     *     )
     * )
     */
    public function metrics( Request $request, $email_id ): \Illuminate\Http\JsonResponse
    {
        try{

            $emailMarketing = EmailMarketing::find($email_id);

            if( empty($emailMarketing) )
                return response()->json(['error' => 'Email not founded'], 404);

            return response()->json([
                'message'   => 'metrics founded',
                'data'      => $emailMarketing->getMetrics()
            ]);

        }catch(\Exception $e){
            return response()->json(['error' => "An unexpected error occurred"], 500);
        }
    }

    public function getEmails( Request $request ): \Illuminate\Http\JsonResponse
    {
        try{

            $emailMarketingModel = new EmailMarketing();
            return response()->json([
                'message'   => 'emails founded',
                'data'      => $emailMarketingModel->getEmails()
            ]);

        }catch(\Exception $e){
            return response()->json(['error' => "An unexpected error occurred", 'title' => $e->getMessage()], 500);
        }
    }
}
