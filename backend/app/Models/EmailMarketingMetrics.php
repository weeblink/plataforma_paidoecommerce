<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EmailMarketingMetrics extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'email_metrics';
    public $timestamps = false;
    protected $primaryKey = 'id';

    public function email(  ) : BelongsTo
    {
        return $this->belongsTo(EmailMarketing::class, 'email_id', 'id');
    }

    public function lead(  ) : BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_id', 'id');
    }

    /**
     * Function to save new Metric from Email
     * @param $emailId
     * @param $userId
     * @return void
     * @throws Exception
     */
    public function SetOpenedMail($emailId, $userId ): void
    {

        $this->email_id = $emailId;
        $this->lead_id = $userId;

        if( !$this->save() )
            throw new Exception("An unexpected Error occoured");
    }
}
