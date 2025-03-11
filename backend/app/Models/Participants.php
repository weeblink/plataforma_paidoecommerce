<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Participants extends Model
{
    use HasUuids;

    protected $table = 'participants';
    protected $primaryKey = 'id';

    public $timestamps = false;

    /**
     * Define the relationship with WhatsappGroups
     */
    public function whatsappGroup()
    {
        return $this->belongsTo(WhatsappGroups::class, 'whatsapp_group_id', 'id');
    }

    /**
     * Get total count of participants across all WhatsApp groups
     * 
     * @return int
     */
    public static function getParticipantsGroups() : int
    {
        return self::query()
            ->join('whatsapp_groups', 'whatsapp_groups.id', '=', 'participants.whatsapp_group_id')
            ->count();
    }
}
