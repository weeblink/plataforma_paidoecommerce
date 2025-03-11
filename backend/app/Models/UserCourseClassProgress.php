<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class UserCourseClassProgress extends Model
{
    use HasFactory;

    protected $table = 'users_course_classes_progress';

    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = ['user_products_id', 'time_viewed', 'completion_percentage', 'class_id', 'already_seen'];

    public function user_product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UserProduct::class, 'user_id', 'id');
    }

    public function class(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CoursesClass::class, 'class_id', 'id');
    }

    /**
     * Function to check if progress
     * @param $userId
     * @param $classId
     * @param string $typeProduct
     * @param null $productId
     * @return UserCourseClassProgress|null
     */
    static function getProgressUser($userId, $classId, $typeProduct, $productId): ?self
    {
        $query = UserProduct::where('user_id', $userId)
            ->where('type_product', $typeProduct);

        if( $productId ){
            $query = $typeProduct === "course"
                ? $query->where('course_id', $productId)
                : $query->where('group_id', $productId);
        }

        $userProduct = $query->first();

        if( empty($userProduct) ) return null;

        return self::where('user_product_id', $userProduct->id)
            ->where('class_id', $classId)
            ->first();
    }

    /**
     * Function to create new Progress
     * @param int $userProductId
     * @param string $classId
     * @param int $timeViewed
     * @param int $completionPercentage
     * @param bool $alreadySeen
     * @return void
     * @throws Exception
     */
    public function createOrUpdateProgress(int $userProductId, string $classId, int $timeViewed, int $completionPercentage, bool $alreadySeen): void
    {

        Log::debug($userProductId);

        $this->user_product_id = $userProductId;
        $this->time_viewed = $timeViewed;
        $this->completion_percentage = $completionPercentage;
        $this->class_id = $classId;
        $this->already_seen = $alreadySeen;

        if (!$this->save())
            throw new Exception("An unexpected error has occurred");
    }
}
