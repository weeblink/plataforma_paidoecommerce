<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Calendar extends Model
{
    use HasFactory;

    protected $table = 'calendar';
    protected $fillable = ['user_id'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Function to get all modules from course
     * @return HasMany
     */
    public function calendar_times(): HasMany
    {
        return $this->hasMany(CalendarTime::class, 'calendar_id', 'id');
    }

    /**
     * Function to get user from calendar
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Function to create a new calendar
     * @param string $userId
     * @throws \Exception
     */
    public function createOrUpdateCalendar(string $userId)
    {
        $this->user_id = $userId;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();

        if (!$this->save()) {
            throw new \Exception("An error occured while saving the banner.");
        }

        return $this;
    }

    /**
     * Funtion to get calendar by user di
     * @param string $userId
     * @throws \Exception
     */
    public static function getCalendarByUserId(string $userId)
    {
        return self::where('user_id', $userId)->first();
    }
}
