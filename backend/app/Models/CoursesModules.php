<?php

namespace App\Models;

use App\Classes\PandaVideo\PandaVideo;
use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoursesModules extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'courses_modules';
    public $timestamps = false;

    /**
     * Function to get course from module
     * @return BelongsTo
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Courses::class, 'course_id', 'id');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(CoursesClass::class, 'module_id', 'id');
    }

    /**
     * Function to rearrange sequence
     * @param $oldSequence
     * @return void
     */
    static function rearrangeSequence($oldSequence): void
    {
        self::where('sequence', '>', $oldSequence)
            ->decrement('sequence', 1);
    }

    /**
     * Function to create or update module register
     * @param string $courseId
     * @param string $title
     * @return mixed
     * @throws Exception
     */
    public function createOrUpdateModule(string $courseId, string $title): string
    {

        $this->title = $title;

        if (!$this->exists) {
            $lastSequence = self::where('course_id', $courseId)->max('sequence');
            $this->sequence = $lastSequence ? $lastSequence + 1 : 1;

            $this->course_id = $courseId;
            $this->qnt_class = 0;
            $this->qnt_timeclass = 0;
        }

        if (!$this->save())
            throw new Exception("Ocorreu um erro inesperado ao tentar salvar os dados do módulo");

        return $this->id;
    }

    /**
     * Function to add new Class to module
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
     * Function to swap order of classes
     * @param CoursesModules $moduleSwap
     * @return bool
     */
    public function swapOrder(CoursesModules $moduleSwap): bool
    {
        $oldSequence = $this->sequence;

        $this->sequence = $moduleSwap->sequence;
        $moduleSwap->sequence  = $oldSequence;

        return ($this->save() && $moduleSwap->save());
    }

    /**
     * Function to delete Videos from a module
     *
     * @return void
     * @throws Exception
     */
    public function deleteVideos(  ): void
    {
        $videosIds = [];

        foreach($this->classes as $class) {
            $videosIds[] = [ 'video_id' => $class->pv_video_id ];
        }

        if( ! empty($videosIds) ){

            $pandaService = app(PandaVideo::class);
            $pandaService->deleteVideos($videosIds);
        }
    }
}
