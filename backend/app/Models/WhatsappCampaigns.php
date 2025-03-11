<?php

namespace App\Models;

use App\Classes\WS\WhatsappService\CampaignDispatcher;
use App\Jobs\SendWhatsappCampaign;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Random\RandomException;

class WhatsappCampaigns extends Model
{

    use HasUuids;

    protected $table = 'whatsapp_campaigns';
    protected $fillable = ['groups_id', 'title', 'msg1', 'msg2', 'msg3', 'msg4', 'msg5'];

    public $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Function to get all Campaigns
     * @return Collection
     */
    public static function listAll() : Collection
    {
        return self::all()
            ->map(function($campaign){
               return [
                   'id' => $campaign->id,
                   'title' => $campaign->title,
                   'groups_ids'     => json_decode($campaign->groups_ids, true),
                   'messages'       => [
                       'msg1' => $campaign->msg1,
                       'msg2' => $campaign->msg2,
                       'msg3' => $campaign->msg3,
                       'msg4' => $campaign->msg4,
                       'msg5' => $campaign->msg5,
                   ],
                   'participants'   => $campaign->participants,
                   'created_at'     => $campaign->created_at,
               ];
            });
    }

    /**
     * Function to create a new Campaign and send jobs
     *
     * @param array $groupsIds
     * @param string $title
     * @param array $messages
     * @return void
     * @throws RandomException
     */
    public function createNewCampaign( array $groupsIds, string $title, array $messages ): void
    {

        $whatsappGroups = WhatsappGroups::whereIn('id', $groupsIds)
            ->withCount('participants')
            ->get();

        ( new CampaignDispatcher($messages, $whatsappGroups) )->dispatch();

        $serializedGroupsId = json_encode($groupsIds);

        Log::debug($whatsappGroups);

        $this->title = $title;
        $this->groups_id = $serializedGroupsId;
        $this->fill($messages);
        $this->participants = $whatsappGroups->sum('participants_count');

        if( !$this->save() ) throw new \Exception("An unexpected error occurred while trying to save whatsapp campaign");
    }
}
