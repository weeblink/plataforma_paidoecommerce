<?php

namespace App\Jobs;

use App\Classes\WS\WhatsappService\WhatsappService;
use GuzzleHttp\Client;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendWhatsappCampaign implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly string $groupJid,
        private readonly string $message
    )
    {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try{
            Log::debug("[ WHATSAPP CAMPAIGN SENDED ] : " . $this->groupJid);
            WhatsappService::sendCampaign( $this->groupJid, $this->message );
        }catch(\Exception $e){
            Log::error("[ WHATSAPP CAMPAIGN ERROR ] : " . $e->getMessage());
        }
    }
}
