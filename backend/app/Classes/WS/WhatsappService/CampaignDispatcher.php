<?php

namespace App\Classes\WS\WhatsappService;

use App\Jobs\SendWhatsappCampaign;
use App\Models\WhatsappGroups;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Random\RandomException;

class CampaignDispatcher{

    private array $jobs = [];
    private int $cumulativeDelay = 0;
    private Carbon $baseDelay;

    public function __construct(
        private readonly array $messages,
        private readonly Collection $whatsappGroups
    ){
        $this->baseDelay = now();
    }

    /**
     * Function to dispatch for all groups
     * @return void
     * @throws RandomException
     */
    public function dispatch(): void
    {
        try{
            collect($this->whatsappGroups)->each(function ($group) {
                $this->dispatchSingleCampaign($group);
                $this->incrementDelay();
            });
        }catch(\Exception $e){
            $this->cancelPendingJobs();
            throw $e;
        }
    }

    /**
     * Function to dispatch and store the campaign job
     *
     * @param WhatsappGroups $group
     * @return void
     * @throws RandomException
     */
    private function dispatchSingleCampaign(WhatsappGroups $group) : void
    {
        $this->jobs[] = SendWhatsappCampaign::dispatch(
            $group->whatsapp_id,
            $this->getRandomMessage()
        )->delay($this->calculateDelay());
    }

    /**
     * Function to increment cumulative Delay
     *
     * @return void
     * @throws RandomException
     */
    private function incrementDelay() : void
    {
        $this->cumulativeDelay += random_int(4,8);
    }

    /**
     * Function to get random message on array
     *
     * @return string
     */
    private function getRandomMessage() : string
    {
        return $this->messages[array_rand($this->messages)];
    }

    /**
     * Function to cancel all pending jobs dispatched
     * @return void
     */
    private function cancelPendingJobs() : void
    {
        collect($this->jobs)->each(function($job){
            $job->delete();
        });
    }

    /**
     * Function to calculate Delay of send message
     *
     * @return Carbon
     * @throws RandomException
     */
    private function calculateDelay() : Carbon
    {
        return $this->baseDelay
            ->copy()
            ->addSeconds($this->cumulativeDelay + random_int(1,4));
    }
}
