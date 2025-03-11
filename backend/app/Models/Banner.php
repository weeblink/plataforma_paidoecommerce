<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banners';
    protected $fillable = ['title', 'alt', 'image_url', 'link_action', 'position'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    /**
     * Function to rearrange position
     * @param $deletedPosition
     * @return void
     */
    static function rearrangePosition($deletedPosition): void
    {
        self::where('position', '>', $deletedPosition)
            ->orderBy('position', 'asc')
            ->decrement('position', 1);
    }

    /**
     * Function to create a new banner
     * @param string $title
     * @param string $alt
     * @param string $link_action
     * @param $image
     * @param int $position
     */
    public function createOrUpdateBanner(string $title, string $alt, string $link_action, $image)
    {
        $this->title = $title;
        $this->alt = $alt;
        $this->link_action = $link_action;

        if (!$this->exists) {
            $lastPosition = self::max('position');

            $this->position = $lastPosition ? $lastPosition + 1 : 1;

            $this->id = (string) \Illuminate\Support\Str::uuid();
        }

        if ($image) {
            if ($image instanceof \Illuminate\Http\UploadedFile && $image->isValid()) {
                $this->image_url = $this->uploadFile($image, 'banners');
            } else {
                throw new \Exception("Invalid file provided for upload.");
            }
        }

        if (!$this->save()) {
            throw new \Exception("An error occured while saving the banner.");
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
     * Function to swap order of banners
     * @param Banner $bannerSwap
     * @return bool
     */
    public function swapOrder(Banner $bannerSwap): bool
    {
        $oldPosition = $this->position;

        $this->position = $bannerSwap->position;
        $bannerSwap->position  = $oldPosition;

        return ($this->save() && $bannerSwap->save());
    }
}
