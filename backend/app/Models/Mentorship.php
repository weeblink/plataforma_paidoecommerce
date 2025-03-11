<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class Mentorship extends Model
{
    use HasFactory;

    protected $table = 'mentorships';
    protected $fillable = ['title', 'image_url'];
    protected $keyType = 'string';
    protected $primaryKey = 'id';
    protected $timestamp = true;

    public function groups()
    {
        return $this->hasMany(MentorshipGroup::class, 'mentorship_id', 'id');
    }

    /**
     * Function to get mentorships
     *
     * @return Collection
     */
    public static function listAll(): Collection
    {
        return self::all(['id', 'image_url']);
    }

    /**
     * Function to create a new mentorship
     * @param string $title
     * @param $image
     * @return Mentorship
     * @throws Exception
     */
    public function createOrUpdateMentorship(string $title, $image): static
    {
        $this->title = $title;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();

        if ($image) {
            if ($image instanceof \Illuminate\Http\UploadedFile && $image->isValid()) {
                $this->image_url = $this->uploadFile($image, 'mentorships');
            } else {
                throw new Exception("Invalid file provided for upload.");
            }
        }

        if (!$this->save()) {
            throw new Exception("An error occured while saving the mentorship.");
        }

        return $this;
    }

    /**
     * Function to save image from course
     * @param UploadedFile $file
     * @param string $path
     * @return string
     */
    private function uploadFile(UploadedFile $file, string $path): string
    {
        if (!empty($this->image_url)) {
            $oldFileName = basename($this->image_url);
            $oldFilePath = storage_path('app/public/' . $path . '/' . $oldFileName);

            if (File::exists($oldFilePath)) {
                File::delete($oldFilePath);
            }
        }

        $storedPath = $file->store($path, 'public');
        return asset('storage/' . $storedPath);
    }

    /**
     * Get statistics for mentorships including total mentorships and mentorships created in the current month.
     *
     * @return array{total_mentorships: int, mentorships_added_this_month: int}
     */
    public static function getMentorshipStatistics(): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $totalMentorships = self::count();

        $mentorshipsAddedThisMonth = self::whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->count();

        return [
            'total_mentorships' => $totalMentorships,
            'mentorships_added_this_month' => $mentorshipsAddedThisMonth,
        ];
    }

    /**
     * Function to get all groups from a mentorship
     *
     */
    public function getGroups($userId)
    {
        return $this->groups()
            ->select([
                'groups.id',
                'groups.mentorship_id',
                'groups.course_id',
                'groups.title',
                'groups.price',
                'groups.price_promotional',
                'groups.qnt_students',
                'groups.purchase_deadline',
                'groups.expiration_date',
                'groups.type',
                'mentorships.image_url'
            ])
            ->addSelect([
                DB::raw("COALESCE(NOT EXISTS(
                    SELECT 1
                    FROM user_products
                    WHERE user_products.group_id = groups.id
                    AND user_products.user_id = ?
                ), true) as is_locked")
            ])
            ->addBinding($userId, 'select')
            ->join('mentorships', 'mentorships.id', '=', 'groups.mentorship_id')
            ->orderBy('groups.purchase_deadline', 'desc')
            ->get();
    }

    /**
     * Function to get all mentoring details by group id and user id
     * @param string $groupId
     * @param string $userId
     * @return array|string[]
     */
    public static function getMentoringDetailsByGroupIdAndUserId(string $groupId, string $userId)
    {
        try {
            $mentoringGroup = MentorshipGroup::find($groupId);
            if (!$mentoringGroup) {
                throw new Exception("Mentorship group not found");
            }

            $mentoringGroup->load('mentorship', 'course');

            $meetSchedules = MeetScheduled::where('group_id', $groupId)->get();

            $schedulesIndividual = [];
            $schedulesGroups = [];
            foreach ($meetSchedules as $meetSchedule) {
                $calendarTime = CalendarTime::find($meetSchedule->calendar_times_id);

                if (!$calendarTime) {
                    throw new Exception("Calendar time not found");
                }

                $meetingStudentScheduled = MeetingStudentScheduled::where('meet_scheduled_id', $meetSchedule->id)->get();

                if (!$meetSchedule->group_meeting) {
                    $meetingStudent = $meetingStudentScheduled->first();
                    if (!$meetingStudent) {
                        continue;
                    }

                    $student = $meetingStudent->student;

                    $schedulesIndividual[] = [
                        'id'                => $meetSchedule->id,
                        'title'             => $meetSchedule->title,
                        'description'       => $meetSchedule->description,
                        'date'              => date('d/m/y', strtotime($calendarTime->start_time)),
                        'start_time'        => date('H:i', strtotime($calendarTime->start_time)),
                        'end_time'          => date('H:i', strtotime($calendarTime->end_time)),
                        'student' => [
                            'student_id' => $student->id,
                            'name' => $student->name,
                        ],
                    ];

                    continue;
                }

                $students = [];
                foreach ($meetingStudentScheduled as $studentScheduled) {
                    $students[] = [
                        'student_id' => $studentScheduled->student->id,
                        'name' => $studentScheduled->student->name,
                    ];
                }

                $schedulesGroups[] = [
                    'id' => $meetSchedule->id,
                    'start_time' => $calendarTime->start_time,
                    'end_time' => $calendarTime->end_time,
                    'students' => $students,
                ];
            }

            $userProduct = UserProduct::getUserProduct($userId, "course", $mentoringGroup->course->id);

            $lastClass = null;

            if ($userProduct) {
                if ($userProduct->last_class_seen) {
                    $lastClass = CoursesClass::with('attachments')
                        ->find($userProduct->last_class_seen);
                } else {
                    $lastClass = CoursesClass::with('attachments')
                        ->where('course_id', $mentoringGroup->course->id)
                        ->orderBy('id', 'asc')
                        ->first();
                }

                if ($lastClass) {
                    $progress = UserCourseClassProgress::where('user_product_id', $userProduct->id)
                        ->where('class_id', $lastClass->id)
                        ->first();

                    $lastClass->progress = $progress ? [
                        'time_viewed' => $progress->time_viewed,
                        'completion_percentage' => $progress->completion_percentage,
                        'already_seen' => $progress->already_seen,
                    ] : null;
                }
            }

            return [
                'id' => $mentoringGroup->id,
                'title' => $mentoringGroup->title,
                'price' => $mentoringGroup->price,
                'promotional_price' => $mentoringGroup->price_promotional,
                'qnt_students' => $mentoringGroup->qnt_students,
                'purchase_deadline' => $mentoringGroup->purchase_deadline,
                'expiration_date' => $mentoringGroup->expiration_date,
                'type' => $mentoringGroup->type,
                'mentorship' => [
                    'id' => $mentoringGroup->mentorship->id,
                    'title' => $mentoringGroup->mentorship->title,
                    'image_url' => $mentoringGroup->mentorship->image_url,
                    'created_at' => $mentoringGroup->mentorship->created_at,
                    'updated_at' => $mentoringGroup->mentorship->updated_at,
                ],
                'course' => [
                    'id' => $mentoringGroup->course->id,
                    'title' => $mentoringGroup->course->title,
                    'price' => $mentoringGroup->course->price,
                    'promotional_price' => $mentoringGroup->course->promotional_price,
                    'qnt_class' => $mentoringGroup->course->qnt_class,
                    'qnt_students' => $mentoringGroup->course->qnt_students,
                    'image_url' => $mentoringGroup->course->image_url,
                    'is_pay' => $mentoringGroup->course->is_pay,
                    'created_at' => $mentoringGroup->course->created_at,
                    'updated_at' => $mentoringGroup->course->updated_at,
                ],
                'last_class' => $lastClass ? [
                    'id' => $lastClass->id,
                    'module_id' => $lastClass->module_id,
                    'title' => $lastClass->title,
                    'description' => $lastClass->description,
                    'views' => $lastClass->views,
                    'sequence' => $lastClass->sequence,
                    'pv_video_id' => $lastClass->pv_video_id,
                    'progress' => $lastClass->progress,
                    'files' => $lastClass->attachments->map(function ($file) {
                        return [
                            'id' => $file->id,
                            'class_id' => $file->class_id,
                            'title' => $file->title,
                            'path' => $file->path,
                            'size' => $file->size,
                        ];
                    }),
                ] : null,
                'progress' => $lastClass ? $lastClass->progress : null,
                'schedules_individual' => $schedulesIndividual,
                'schedules_groups' => $schedulesGroups,
            ];
        } catch (\Exception $e) {
            return ['error' => "An unexpected error occurred " . $e->getMessage()];
        }
    }
}
