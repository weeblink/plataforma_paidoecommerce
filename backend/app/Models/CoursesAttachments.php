<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class CoursesAttachments extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    public function classe(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CoursesClass::class, 'class_id', 'id');
    }

    /**
     * @param string $title
     * @param UploadedFile $file
     * @param string $classId
     * @return void
     * @throws Exception
     */
    public function saveFile( string $title, UploadedFile $file, string $classId ): void
    {
        $fileSize = ( $file->getSize() / 1048576 );

        $pathAttachment = $this->storeAttachment( $file, $classId );

        $this->class_id = $classId;
        $this->title = $title;
        $this->path = $pathAttachment;
        $this->size = $fileSize;

        if( !$this->save() )
            throw new Exception("An unexpected error occured while trying to upload this file.");
    }

    public function listAll( $classId )
    {
        return $this->where('class_id', $classId)->get();
    }

    /**
     * Function to save image from course
     * @param UploadedFile $imageFile
     * @param $class_id
     * @return string
     */
    private function storeAttachment( UploadedFile $imageFile, $class_id ): string
    {
        return asset('storage/' . $imageFile->store( "courses/attachments/$class_id", 'public' ) );
    }

    public function deleteAttachment(  )
    {

        $fileName = explode('storage/courses/attachments', $this->path)[1];
        $file = storage_path('app/public/courses/attachments/' . $fileName);

        if( File::exists($file) )
            File::delete($file);

        $this->delete();
    }
}
