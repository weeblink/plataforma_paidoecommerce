<?php

namespace App\Http\Controllers;

use App\Models\EmailMarketing;
use App\Models\EmailMarketingMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EmailMarketingMetricsController extends Controller
{
    /**
     * Function to save new metric from email
     * @param $emailId
     * @param $userId
     * @return BinaryFileResponse
     */
    public function set_opened( $emailId, $userId ): BinaryFileResponse
    {
        try{

            $emailMarketing = EmailMarketing::find($emailId);

            if( empty($emailMarketing) )
                return response()->download(public_path() . '/assets/logo-3d.png');

            $emailMetrics = new EmailMarketingMetrics();
            $emailMetrics->SetOpenedMail( $emailId, $userId );

            return response()->download(public_path() . '/assets/logo-3d.png');

        }catch(\Exception $e){
            Log::error("[EmailMarketing] - " . $e->getMessage());
            return response()->download(public_path() . '/assets/logo-3d.png');
        }
    }
}
