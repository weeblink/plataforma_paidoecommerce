<?php

namespace App\Models;

use App\Classes\WS\WhatsappService\WhatsappService;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class WhatsappGroups extends Model
{
    use HasUuids;

    protected $table = 'whatsapp_groups';
    protected $primaryKey = 'id';

    public $timestamps = false;

    public function participants()
    {
        return $this->hasMany(Participants::class, 'whatsapp_group_id');
    }

    /**
     * Function to get whatsapp group count
     * @return int
     */
    public static function getGroupsCount(  ) : int
    {
        return self::count(  );
    }

    public static function listAll(  )
    {
        return self::get()
            ->map(function($group){
                return self::listOne($group);
            });
    }

    public static function listOne(WhatsappGroups $group){
        return [
            'id'            => $group->id,
            'jid'           => $group->whatsapp_id,
            'created_at'    => (new DateTime($group->creation))->format('d/m/Y H:i'),
            'subject'       => $group->subject
        ];
    }

    /**
     * Function to handle creation groups for orders
     *
     * @param Payment $payment
     * @return void
     * @throws Exception
     */
    public function handleGroupOrder( Payment $payment ): void
    {
        // TODO: Check uuid used on payment
        $groupMentorship = MentorshipGroup::find($payment->order->product_id);

        if( empty($groupMentorship) )
            throw new Exception("Was not possibile find mentorship group");

        $connection = Connections::first();

        if( empty($connection) ) {
            Log::error("[ WHATSAPP WEB SERVICE ]: No one connection created");
            return;
        }

        try{

            // Get user data
            $phone = preg_replace( '/[\s()\-]/', '', $payment->customer->phone );
            $phone = "55" . substr_replace($phone, '', '2', '1');

            if( $groupMentorship->type == 'single' || empty($groupMentorship->whatsappGroups) ){

                // Create group
                $data = WhatsappService::createGroup(
                    $payment->customer->first_name. " " . $payment->customer->last_name,
                    $groupMentorship->title,
                    (new DateTime($groupMentorship->expiration_date))->format('d/m/Y'),
                    $groupMentorship->type == 'single',
                    [$phone]
                );

                $whatsappGroup                      = new WhatsappGroups();
                $whatsappGroup->group_mentorship_id = $groupMentorship->id;
                $whatsappGroup->connection_id       = $connection->id;
                $whatsappGroup->whatsapp_id         = $data['jid'];
                $whatsappGroup->subject             = $data['subject'];
                $whatsappGroup->creation            = now();
                $whatsappGroup->owner               = $data['owner'];
                $whatsappGroup->desc                = $data['description'];
                $whatsappGroup->announce            = $data['announce'];
                $whatsappGroup->restrict            = $data['restrict'];

                if( ! $whatsappGroup->save() )
                    throw new Exception("An unknown error occurred while saving whatsapp group");

                return;
            }

            WhatsappService::addParticipant(
                $groupMentorship->whatsappGroups->whatsapp_id,
                [
                    'name'      => $payment->customer->first_name. " " . $payment->customer->last_name,
                    'number'    => $phone
                ]
            );

        }catch (Exception $exception){
            Log::error("[ GROUP HANDLE ORDER ] : " . $exception->getMessage());
        }
    }
}
