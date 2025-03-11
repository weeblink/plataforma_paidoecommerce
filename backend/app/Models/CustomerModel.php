<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerModel extends Model
{

    use HasUuids;

    protected $table = 'customers';
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'document_type',
        'document_number',
        'complement',
        'postcode',
        'street',
        'number',
        'district',
        'city',
        'state',
        'ip',
        'user_id'
    ];

    /**
     * Function to declare belongsTo Payments
     * @return BelongsTo
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo( Payment::class, 'customer_id', 'id' );
    }

    public function user()
    {
        return $this->belongsTo( User::class, 'user_id', 'id' );
    }
}
