<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class Extra extends Model
{
    use HasFactory;

    protected $table = 'extras';
    protected $fillable = ['title', 'price', 'promotional_price', 'image_url', 'file_url'];
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $timestamps = true;

    /**
     * Function to create a new extra
     * @param string $title
     * @param float $price
     * @param float $promotionalPrice
     * @param $image
     * @param $file
     * @return Extra
     * @throws Exception
     */
    public function createOrUpdateExtra(string $title, float $price, float $promotionalPrice, $image, $file): static
    {
        $this->title = $title;
        $this->price = $price;
        $this->promotional_price = $promotionalPrice;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();

        if ($image) {
            if ($image instanceof \Illuminate\Http\UploadedFile && $image->isValid()) {
                $this->image_url = $this->uploadFile($image, 'products/extras/images', 'image');
            } else {
                throw new Exception("Invalid file provided for upload.");
            }
        }

        if ($file) {
            if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                $this->file_url = $this->uploadFile($file, 'products/extras/files', 'file');
            } else {
                throw new Exception("Invalid file provided for upload.");
            }
        }

        if (!$this->save()) {
            throw new Exception("An error occured while saving the extra.");
        }

        return $this;
    }

    /**
     * Function to get all extras
     * @return Collection
     */
    static function listAll(): Collection
    {
        return self::all();
    }

    /**
     * Function to get a extra product
     *
     * @param string $productId
     * @return mixed
     */
    public static function getExtra( string $productId ): mixed
    {
        return self::find($productId);
    }

    /**
     * Function to save image from course
     * @param UploadedFile $file
     * @param string $path
     * @param string $field
     * @return string
     */
    private function uploadFile(UploadedFile $file, string $path, string $field): string
    {
        if ($field == 'image') {
            if (empty($this->image_url)) {
                $storedPath = $file->store($path, 'public');
                return asset('storage/' . $storedPath);
            }

            $oldFileName = basename($this->image_url);
        }

        if ($field == 'file') {
            if (empty($this->file_url)) {
                $storedPath = $file->store($path, 'public');
                return asset('storage/' . $storedPath);
            }

            $oldFileName = basename($this->file_url);
        }

        $oldFilePath = storage_path('app/public/' . $path . '/' . $oldFileName);

        if (File::exists($oldFilePath)) {
            File::delete($oldFilePath);
        }

        $storedPath = $file->store($path, 'public');
        return asset('storage/' . $storedPath);
    }

    static function listUserExtraUnlocked($userId)
    {
        $subquery = self::select(
            'extras.id',
            'extras.title',
            'extras.price',
            'extras.promotional_price',
            'extras.image_url',
            'extras.file_url',
            DB::raw("COALESCE(NOT user_products.user_id IS NOT NULL, true) as is_locked")
        )->leftJoin('user_products', function ($join) use ($userId) {
            $join->on('extras.id', '=', 'user_products.extra_id')
                ->where('user_products.user_id', $userId);
        });

        return DB::table(DB::raw("({$subquery->toSql()}) as filtered_extras"))
        ->mergeBindings($subquery->getQuery())
        ->where('is_locked', '=', false)
        ->get();
    }

    /**
     * Get statistics for extras including total extras and extras created in the current month.
     *
     * @return array{total_extras: int, extras_added_this_month: int}
     */
    public static function getExtraStatistics(): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $totalExtras = self::count();

        $extrasAddedThisMonth = self::whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->count();

        return [
            'total_extras' => $totalExtras,
            'extras_added_this_month' => $extrasAddedThisMonth,
        ];
    }

    static function getPaymentData(Extra $extra): array
    {
        return [
            'id'                    => $extra->id,
            'title'                 => $extra->title,
            'price'                 => $extra->price,
            'promotional_price'     => $extra->promotional_price,
            'image_url'             => $extra->image_url
        ];
    }

    /**
     * Function to get all extra products
     *
     * @param $userId
     * @return mixed
     */
    static function getExtraProducts( $userId ): mixed
    {
        return self::select(
            'extras.id',
            'extras.title',
            'extras.price',
            'extras.promotional_price',
            'extras.image_url',
            'extras.file_url',
            'extras.created_at',
            'extras.updated_at',
            DB::raw("COALESCE(NOT user_products.user_id IS NOT NULL, true) as is_locked")
        )->leftJoin('user_products', function ($join) use ($userId) {
            $join->on('extras.id', '=', 'user_products.extra_id')
                ->where('user_products.user_id', $userId);
        })
        ->get();
    }
}
