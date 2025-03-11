<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarTime extends Model
{
    use HasFactory;

    protected $table = 'calendar_times';
    protected $fillable = ['calendar_id', 'start_time', 'end_time', 'is_available'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Function to get all calendar times from calendar
     * @return BelongsTo
     */
    public function calendar(): BelongsTo
    {
        return $this->belongsTo(Calendar::class, 'calendar_id', 'id');
    }

    /**
     * Function to create a new calendar time
     * @param string $calendarId
     * @param string $startTime
     * @param string $endTime
     * @param bool $isAvailable
     * @return CalendarTime
     * @throws Exception
     */
    public function createOrUpdateCalendarTime(string $calendarId, string $startTime, string $endTime, bool $isAvailable): static
    {
        $this->calendar_id = $calendarId;
        $this->start_time = $startTime;
        $this->end_time = $endTime;
        $this->is_available = $isAvailable;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();

        if (!$this->save()) {
            throw new Exception("An error occured while saving the banner.");
        }

        return $this;
    }

    /**
     * Function to get all Available Times
     *
     * @return Collection|\Illuminate\Support\Collection
     */
    static function getAllTimes(): Collection|\Illuminate\Support\Collection
    {
        return self::with('calendar.user')
            ->get()
            ->groupBy(function ($data) {
                return Carbon::parse($data->start_time)->format('d/m/Y');
            })
            ->map(function ($groupedTimes, $date) {
                $calendar = $groupedTimes->first()->calendar;
                $admin = $calendar->user;

                return [
                    'id'   => $calendar->id,
                    'user' => [
                        'id'       => $admin->id,
                        'username' => $admin->name,
                    ],
                    'date'  => $date,
                    'times' => $groupedTimes->map(function ($time) {
                        return [
                            'id'         => $time->id,
                            'start_time' => Carbon::parse($time->start_time)->format('H:i'),
                            'end_time'   => Carbon::parse($time->end_time)->format('H:i'),
                        ];
                    })->values(),
                ];
            })
            ->values();
    }


    /**
     * Function to get calendar time by start_date and end_date
     * @param string $startDate start_date
     * @param string $endDate end_date
     * @return CalendarTime
     * @throws Exception
     */
    public static function getCalendarTimeByCalendarIdAndStartDateAndEndDate(string $startDate, string $endDate, string $calendarId): ?CalendarTime
    {
        try {
            $startDateFormatted = Carbon::createFromFormat('d/m/Y H:i', $startDate)->format('Y-m-d H:i:s');
            $endDateFormatted = Carbon::createFromFormat('d/m/Y H:i', $endDate)->format('Y-m-d H:i:s');

            return CalendarTime::where('start_time', $startDateFormatted)
                ->where('end_time', $endDateFormatted)
                ->where('calendar_id', $calendarId)
                ->first();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Function to delete all calendar times by calendar id and date
     *
     * @param string $calendarId
     * @param string $date
     * @return void|null
     */
    public static function deleteAllCalendarTimesByCalendarIdAndDate(string $calendarId, string $date)
    {
        try {
            $deletedRows = self::where('calendar_id', $calendarId)
                ->whereDate('start_time', $date)
                ->delete();

            if ($deletedRows === 0) {
                throw new Exception("No calendar times found for the given calendar id and date.");
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Function to set Calendar Time Unavailable
     *
     * @param string $calendarId
     * @return void
     * @throws Exception
     */
    public static function setTimeUnavailable(string $calendarId): void
    {
        $calendarTime = CalendarTime::find($calendarId);

        if (empty($calendarTime))
            throw new Exception("Calendar Time not found.");

        $calendarTime->is_available = false;

        if (! $calendarTime->save())
            throw new Exception("Calendar Time could not be saved.");
    }
}
