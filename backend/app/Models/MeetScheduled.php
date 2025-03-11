<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MeetScheduled extends Model
{
    use HasFactory;

    protected $table = 'meet_schedules';
    protected $fillable = ['group_id', 'calendar_times_id', 'is_available', 'group_meeting', 'title', 'description'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Function to get all meet schedules from group
     * @return BelongsTo
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(MentorshipGroup::class, 'group_id', 'id');
    }

    /**
     * Function to get all meet schedules from group
     * @return BelongsTo
     */
    public function calendar_time(): BelongsTo
    {
        return $this->belongsTo(CalendarTime::class, 'calendar_times_id', 'id');
    }

    /**
     * Function to get all meet schedules of students
     * @return HasMany
     */
    public function students(): HasMany
    {
        return $this->hasMany(MeetingStudentScheduled::class, 'student_id', 'id');
    }

    /**
     * Function to create a new meet scheduled
     * @param string $groupId
     * @param string $calendarTimeId
     * @param bool $isAvailable
     * @param bool $groupMeeting
     * @param string $title
     * @param string $description
     * @param string $userId
     * @return MeetScheduled
     * @throws Exception
     */
    public function createOrUpdateMeetScheduled(
        string $groupId,
        string $calendarTimeId,
        bool $isAvailable,
        bool $groupMeeting,
        string $title,
        string $description,
    ): static {

        $this->calendar_times_id = $calendarTimeId;
        $this->is_available = $isAvailable;
        $this->group_meeting = $groupMeeting;
        $this->title = $title;
        $this->description = $description;

        if (!$this->exists) {
            $this->group_id = $groupId;
            $this->id = (string) \Illuminate\Support\Str::uuid();
        }

        if (!$this->save())
            throw new Exception("An error occured while saving the scheduled meet.");

        CalendarTime::setTimeUnavailable($calendarTimeId);

        return $this;
    }

    /**
     * Function to get all Scheduleds Meets for admin
     * @param string $userId
     * @return Collection
     */
    static function getScheduledMeets(string $userId): Collection
    {
        $results = self::join('calendar_times', 'calendar_times.id', '=', 'meet_schedules.calendar_times_id')
            ->join('calendar', 'calendar.id', '=', 'calendar_times.calendar_id')
            ->join('users', 'users.id', '=', 'calendar.user_id')
            ->leftJoin('groups', 'groups.id', '=', 'meet_schedules.group_id')
            ->leftJoin('mentorships', 'mentorships.id', '=', 'groups.mentorship_id')
            ->select([
                'meet_schedules.id',
                'meet_schedules.title',
                'meet_schedules.description',
                DB::raw("TO_CHAR(calendar_times.start_time, 'DD/MM/YYYY') as date"),
                DB::raw("TO_CHAR(calendar_times.start_time, 'HH24:MI') as start_time"),
                DB::raw("TO_CHAR(calendar_times.end_time, 'HH24:MI') as end_time"),
                'mentorships.title as mentoring_title',
                DB::raw("JSON_BUILD_OBJECT('title', groups.title) as group"),
                DB::raw("(
                SELECT COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', mss.student_id,
                            'name', s.name
                        )
                    ),
                    '[]'
                )
                FROM meeting_student_schedules mss
                LEFT JOIN users s ON s.id = mss.student_id
                WHERE mss.meet_scheduled_id = meet_schedules.id
            ) as students"),
                DB::raw("CASE WHEN meet_schedules.group_meeting = true THEN 'group' ELSE 'individual' END as type")
            ])
            ->where('meet_schedules.is_available', 1)
            ->where('users.id', $userId)
            ->get();

        return $results->map(function ($item) {
            $item->group = json_decode($item->group);
            $item->students = json_decode($item->students);
            return $item;
        });
    }

    /**
     * Function to get all meet schedules with mentor name
     * @throws Exception
     */
    public static function getAllMeetSchedules()
    {
        try {
            $schedules = Calendar::with([
                'user:id,name',
                'calendar_times' => function ($query) {
                    $query->select('id', 'calendar_id', 'start_time', 'end_time')
                        ->where('is_available', 1);
                }
            ])
                ->get();

            $formattedSchedules = $schedules->map(function ($schedule) {
                return [
                    'user' => [
                        'id' => $schedule->user->id,
                        'name' => $schedule->user->name,
                    ],
                    'date' => $schedule->calendar_times->isNotEmpty()
                        ? Carbon::parse($schedule->calendar_times->first()->start_time)->format('Y-m-d')
                        : null,
                    'times' => $schedule->calendar_times->map(function ($time) {
                        return [
                            'id' => $time->id,
                            'start_time' => Carbon::parse($time->start_time)->format('H:i'),
                            'end_time' => Carbon::parse($time->end_time)->format('H:i'),
                        ];
                    })->toArray(),
                ];
            });

            return $formattedSchedules->toArray();
        } catch (\Exception $e) {
            Log::Info($e->getMessage());
            throw new Exception("An error occurred while retrieving the meet schedules.");
        }
    }
}
