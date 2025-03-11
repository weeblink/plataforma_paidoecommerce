<?php

namespace App\Models;

use App\Services\PandaVideo;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class CoursesClass extends Model
{
    use HasFactory, HasUuids;

    protected $table = "class";
    public $timestamps = false;

    /**
     * Function to get module from class
     * @return BelongsTo
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(CoursesModules::class, 'module_id', 'id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(CoursesAttachments::class, 'class_id', 'id');
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
     * Function to create or update class
     * @param string $moduleId
     * @param array $classData
     * @return mixed
     * @throws Exception
     */
    public function createOrUpdate(string $moduleId, array $classData): mixed
    {

        $this->module_id    = $moduleId;
        $this->title        = $classData['title'];
        $this->description  = $classData['description'];
        $this->pv_video_id  = "panda-xxx";

        if (!isset($this->id)) {
             $lastSequence = self::where('module_id', $moduleId)->max('sequence');

             $this->views = 0;
            $this->sequence = $lastSequence ? $lastSequence + 1 : 1;
        }

        if (!$this->save()) throw new Exception("Can't save module class");

        return $this->id;
    }

    /**
     * Function to save video on pandaVideo and store id
     *
     * @param string $filePath
     * @param string $mentoringTitle
     * @param string $fileName
     * @return void
     * @throws Exception
     */
    public function saveVideoOnPanda(
        string $filePath,
        string $mentoringTitle,
        string $fileName
    ): void {
        $pandaService = app(\App\Classes\PandaVideo\PandaVideo::class);

        try{

            $video_id = $pandaService->uploadVideoDirectly(
                $filePath,
                $fileName,
                $this->getFormattedFolderName( $mentoringTitle ),
            );

            $this->pv_video_id = $video_id;

            if( !$this->update() )
                throw new Exception("Can't update class");

        }catch (GuzzleException $e) {
            Log::error($e->getMessage());
            throw new Exception("An error occured while trying to send video");
        }
    }

    /**
     * Function to get video url from pandaVideo
     *
     * @param string $videoId
     * @return mixed
     * @throws Exception
     */
    public function getVideoUrl( string $videoId ): mixed
    {
        try{

            if( $this->video_url )
                return $this->video_url;

            $pandaService = app(\App\Classes\PandaVideo\PandaVideo::class);
            $this->video_url = $pandaService->getVideoUrl( $videoId );

            if( !$this->save() )
                throw new Exception("Can't update class");

            return $this->video_url;

        }catch(Exception $e){
            Log::error($e->getMessage());
            throw new Exception("An error occured while trying to get video url");
        }
    }

    /**
     * Function to get Formatted folder name
     *
     * @param string $mentoringTitle
     * @return string
     */
    private function getFormattedFolderName( string $mentoringTitle ): string
    {
        $string = transliterator_transliterate('Any-Latin; Latin-ASCII', $mentoringTitle);
        return strtolower(preg_replace('/\s+/', '', $string));
    }

    /**
     * Function to add new view o class
     * @throws Exception
     */
    public function addNewView(): void
    {
        $this->views = ($this->views + 1);

        if (! $this->save())
            throw new Exception("Can't save new view class");
    }

    /**
     * Function to swap order of classes
     * @param CoursesClass $classSwap
     * @return bool
     */
    public function swapOrder(CoursesClass $classSwap): bool
    {
        $oldSequence = $this->sequence;

        $this->sequence = $classSwap->sequence;
        $classSwap->sequence  = $oldSequence;

        return ($this->save() && $classSwap->save());
    }

    /**
     * Function to delete vídeo on Panda Video
     *
     * @return void
     * @throws Exception
     */
    public function deleteVideoOnPanda(  ): void
    {
        if( $this->pv_video_id && $this->pv_video_id != "panda-xxx" ){

            $pandaService = app(\App\Classes\PandaVideo\PandaVideo::class);
            $pandaService->deleteVideos( [ 'video_id' => $this->pv_video_id ] );
        }
    }
}
