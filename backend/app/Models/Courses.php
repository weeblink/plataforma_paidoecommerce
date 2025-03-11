<?php

namespace App\Models;

use App\Classes\PandaVideo\PandaVideo;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class Courses extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'courses';
    protected $fillable = ['title', 'price', 'promotional_price'];
    protected $timestamp = true;

    /**
     * Function to get all modules from course
     * @return HasMany
     */
    public function modules(): HasMany
    {
        return $this->hasMany(CoursesModules::class, 'course_id', 'id');
    }

    /**
     * Function to get all courses
     * @return Collection|\Illuminate\Support\Collection
     */
    static function listAll(): Collection|\Illuminate\Support\Collection
    {
        return self::with('modules.classes.attachments')
            ->get()
            ->map(function ($course) {
                return self::listOne($course);
            });
    }

    static function listOne(Courses $course): array
    {
        return [
            'id'                    => $course->id,
            'title'                 => $course->title,
            'price'                 => $course->price,
            'promotional_price'     => $course->promotional_price,
            'qnt_classes'           => $course->qnt_class,
            'qnt_students'          => $course->qnt_students,
            'image_url'             => $course->image_url,
            'is_pay'                => $course->is_pay,
            'modules'               => $course->modules->sortBy('sequence')->values()->map(function ($module): array {
                return [
                    'id'            => $module->id,
                    'course_id'     => $module->course_id,
                    'title'         => $module->title,
                    'sequence'      => $module->sequence,
                    'qtd_classes'   => $module->qnt_class,
                    'classes'       => $module->classes->sortBy('sequence')->values()->map(function ($class) {
                        return [
                            'id'            => $class->id,
                            'module_id'     => $class->module_id,
                            'title'         => $class->title,
                            'description'   => $class->description,
                            'views'         => $class->views,
                            'sequence'      => $class->sequence,
                            'pv_video_id'   => $class->pv_video_id,
                            'files'         => $class->attachments->values()->map(function ($attachment) {
                                return [
                                    'id'        => $attachment->id,
                                    'class_id'  => $attachment->class_id,
                                    'title'     => $attachment->title,
                                    'path'      => $attachment->path,
                                    'size'      => $attachment->size,
                                ];
                            })
                        ];
                    })
                ];
            })
        ];
    }

    static function getPaymentData(Courses $course): array
    {
        return [
            'id'                    => $course->id,
            'title'                 => $course->title,
            'price'                 => $course->price,
            'promotional_price'     => $course->promotional_price,
            'image_url'             => $course->image_url
        ];
    }

    static function listOneWithUserInfo(Courses $course, $userId): array
    {
        return [
            'id'                    => $course->id,
            'title'                 => $course->title,
            'price'                 => $course->price,
            'promotional_price'     => $course->promotional_price,
            'qnt_classes'           => $course->qnt_class,
            'qnt_students'          => $course->qnt_students,
            'image_url'             => $course->image_url,
            'is_pay'                => $course->is_pay,
            'modules'               => $course->modules->sortBy('sequence')->values()->map(function ($module) use ($course, $userId): array {
                return [
                    'id'            => $module->id,
                    'course_id'     => $module->course_id,
                    'title'         => $module->title,
                    'sequence'      => $module->sequence,
                    'qtd_classes'   => $module->qnt_class,
                    'classes'       => $module->classes->sortBy('sequence')->values()->map(function ($class) use ($course, $userId) {

                        $progress = UserCourseClassProgress::getProgressUser(
                            $userId,
                            $class->id,
                            'course',
                            $course->id,
                        );

                        return [
                            'id'            => $class->id,
                            'module_id'     => $class->module_id,
                            'title'         => $class->title,
                            'description'   => $class->description,
                            'views'         => $class->views,
                            'sequence'      => $class->sequence,
                            'video_url'     => $class->getVideoUrl( $class->pv_video_id ),
                            'already_seen'  => $progress ? $progress->already_seen : false,
                            'files'         => $class->attachments->values()->map(function ($attachment) {
                                return [
                                    'id'        => $attachment->id,
                                    'class_id'  => $attachment->class_id,
                                    'title'     => $attachment->title,
                                    'path'      => $attachment->path,
                                    'size'      => $attachment->size,
                                ];
                            })
                        ];
                    })
                ];
            })
        ];
    }

    static function listCoursesAvailable($userId)
    {
        return self::select(
            'courses.id',
            'courses.title',
            'courses.image_url',
            'courses.is_pay',
            DB::raw("COALESCE(NOT user_products.user_id IS NOT NULL, true) as is_locked")
        )->leftJoin('user_products', function ($join) use ($userId) {
            $join->on('courses.id', '=', 'user_products.course_id')
                ->where('user_products.user_id', $userId);
        })->get();
    }

    static function listUserCoursesUnlocked($userId)
    {
        $subquery = self::select(
            'courses.id',
            'courses.title',
            'courses.image_url',
            'courses.is_pay',
            DB::raw("COALESCE(NOT user_products.user_id IS NOT NULL, true) as is_locked")
        )->leftJoin('user_products', function ($join) use ($userId) {
            $join->on('courses.id', '=', 'user_products.course_id')
                ->where('user_products.user_id', $userId);
        });

        return DB::table(DB::raw("({$subquery->toSql()}) as filtered_courses"))
            ->mergeBindings($subquery->getQuery())
            ->where('is_locked', '=', false)
            ->get();
    }

    /**
     * Function to create new Course
     * @param string $title
     * @param float $price
     * @param float $promotionalPrice
     * @param $image
     * @param bool $is_pay
     * @return mixed
     * @throws Exception
     */
    public function createOrUpdate(string $title, float $price, float $promotionalPrice,  $image, bool $is_pay): string
    {

        $this->title = $title;
        $this->price = (float)(! $is_pay ? 0 : $price);
        $this->promotional_price = (float)(! $is_pay ? 0 : $promotionalPrice);
        $this->is_pay = $is_pay;

        if ($image)
            $this->image_url = $this->saveImage($image);

        if (! $this->save())
            throw new Exception("Ocorreu um erro ao salvar o curso");

        return $this->id;
    }

    /**
     * Function to save image from course
     * @param UploadedFile $imageFile
     * @return string
     */
    private function saveImage(UploadedFile $imageFile): string
    {
        if ($this->image_url !== null) {

            $imageName = explode('storage/courses/thumbs', $this->image_url)[1];
            $image = storage_path('app/public/courses/thumbs/') . $imageName;

            if (File::exists($image))
                File::delete($image);
        }

        return asset('storage/' . $imageFile->store('courses/thumbs', 'public'));
    }

    /**
     * Function to add new Class
     * @return void
     * @throws Exception
     */
    public function addNewClass(): void
    {
        $this->qnt_class = ($this->qnt_class + 1);

        if (!$this->save())
            throw new Exception("An unexpected error occurred while trying to add a new class");
    }

    /**
     * Function to remove class
     * @return void
     * @throws Exception
     */
    public function removeClass(): void
    {
        $qnt = ($this->qnt_class - 1);
        $this->qnt_class = max($qnt, 0);

        if (!$this->save())
            throw new Exception("An unexpected error occurred while trying to remove a new class");
    }

    /**
     * Function to add new Student to Course
     * @param int $qnt
     * @return void
     * @throws Exception
     */
    public function addStudent(int $qnt = 1): void
    {
        $this->qnt_students = ($this->qnt_students + $qnt);

        if (!$this->save())
            throw new Exception("An unexpected error occurred while trying to add a new student");
    }

    /**
     * Function to remove student from course
     * @param int $qnt
     * @return void
     * @throws Exception
     */
    public function removeStudent(int $qnt = 1): void
    {
        $this->qnt_students = ($this->qnt_students - $qnt);

        if (!$this->save())
            throw new Exception("An unexpected error occurred while trying to add a new student");
    }

    /**
     * Get course statistics including active courses and courses added in the current month.
     *
     * @return array{active_courses: int, courses_added_this_month: int}
     */
    public static function getCourseActiveStatistics(): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $activeCourses = self::count();

        $coursesAddedThisMonth = self::whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->count();

        return [
            'active_courses' => $activeCourses,
            'courses_added_this_month' => $coursesAddedThisMonth,
        ];
    }

    /**
     * Fucntion to delete all videos from class
     *
     * @return void
     * @throws Exception
     */
    public function deleteVideos(  ): void
    {
        $videosIds = [];

        foreach( $this->modules as $module ){
            foreach( $module->classes as $class ){
                $videosIds[] = [ 'video_id' => $class->pv_video_id ];
            }
        }

        if( ! empty($videosIds) ){

            $pandaService = app(PandaVideo::class);
            $pandaService->deleteVideos($videosIds);
        }
    }
}
