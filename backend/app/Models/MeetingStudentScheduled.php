<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingStudentScheduled extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meeting_student_schedules';
    protected $fillable = ['student_id', 'meet_scheduled_id'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Function to get course from module
     * @return BelongsTo
     */
    public function meet_scheduled(): BelongsTo
    {
        return $this->belongsTo(Courses::class, 'meet_scheduled_id', 'id');
    }

    /**
     * Function to get meeting students schedules
     * @return BelongsTo
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id', 'id');
    }

    /**
     * Function to create a new meeting student scheduled
     * @param string $studentId
     * @param string $meetScheduledId
     * @return MeetingStudentScheduled
     * @throws Exception
     */
    public function createOrUpdateMeetStudentScheduled(string $studentId, string $meetScheduledId): static
    {
        $this->student_id = $studentId;
        $this->meet_scheduled_id = $meetScheduledId;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();

        if (!$this->save())
            throw new Exception("An error occured while saving the banner.");

        return $this;
    }
}
