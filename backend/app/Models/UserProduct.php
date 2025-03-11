<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserProduct extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = ['user_id', 'payment_id', 'course_id', 'extra_id', 'type_product', 'group_id'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $maxId = self::max('id') ?? 0;
            $model->id = $maxId + 1;
        });
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function course(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Courses::class, 'course_id', 'id');
    }

    public function extra(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Extra::class, 'extra_id', 'id');
    }

    public function payment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'id');
    }

    public function group()
    {
        return $this->belongsTo(MentorshipGroup::class, 'group_id');
    }

    /**
     * Function to check if user has any mentorship with this course
     * @param string $id
     * @param string $courseId
     * @return bool
     */
    static function hasAnyMentorshipCourse( string $id, string $courseId ) : bool
    {

        Log::debug('User id: ' . $id . ' course id: ' . $courseId);

        return self::query()
            ->where('type_product', 'mentorship')
            ->where('user_id', $id)
            ->whereHas('group.course', function ($query) use ($courseId) {
                $query->where('id', $courseId);
            })
            ->exists();
    }

    /**
     * Function to get product column by typeProduct
     * @param string $typeProduct
     * @return string
     * @throws Exception
     */
    static function getProductColumn(string $typeProduct): string
    {
        $product = "";
        if ($typeProduct == 'course') {
            $product = 'course_id';
        } else if ($typeProduct == 'mentorship') {
            $product = 'group_id';
        } else if ($typeProduct == 'extra') {
            $product = 'extra_id';
        } else {
            throw new Exception("Invalid type product.");
        }

        return $product;
    }

    /**
     * Function to get user product
     * @param string $userId
     * @param string $typeProduct = course | mentorship | extra
     * @param string $productId
     * @return UserProduct|null
     * @throws Exception
     */
    static function getUserProduct(string $userId, string $typeProduct, string $productId): ?self
    {

        $product = self::getProductColumn($typeProduct);

        return self::where('user_id', $userId)
            ->where($product, $productId)
            ->first();
    }

    /**
     * Function to set last class seen by user
     * @param string $classId
     * @return void
     * @throws Exception
     */
    public function setLastClassSeen(string $classId): void
    {
        $this->last_class_seen = $classId;

        if (! $this->save())
            throw new Exception("An error occured while trying to set last class.");
    }

    /**
     * Function to add new User Product
     * @param $userId
     * @param $typeProduct
     * @param $productId
     * @param $paymentId
     * @return void
     * @throws Exception
     */
    public function addNew(string $userId, string $typeProduct, string $productId, int $paymentId): void
    {
        $product = self::getProductColumn($typeProduct);

        $this->$product     = $productId;
        $this->user_id      = $userId;
        $this->payment_id   = $paymentId;
        $this->last_class_seen = null;

        if (!$this->save())
            throw new Exception("An error occured while trying to add new.");
    }

    public static function getLastFiveSales()
    {
        return self::select(
            'user_products.id as sale_id',
            'users.name as user_name',
            'users.email as user_email',
            DB::raw('
                    CASE
                        WHEN user_products.course_id IS NOT NULL THEN courses.price
                        WHEN user_products.group_id IS NOT NULL THEN groups.price
                        WHEN user_products.extra_id IS NOT NULL THEN extras.price
                        ELSE 0
                    END as product_price
                ')
        )
            ->join('users', 'user_products.user_id', '=', 'users.id')
            ->leftJoin('courses', 'user_products.course_id', '=', 'courses.id')
            ->leftJoin('groups', 'user_products.group_id', '=', 'groups.id')
            ->leftJoin('extras', 'user_products.extra_id', '=', 'extras.id')
            ->orderBy('user_products.id', 'desc')
            ->limit(5)
            ->get();
    }

    public static function getSalesCountThisMonth(): int
    {
        return self::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();
    }

    public static function getStudentsPerMentorship(): array
    {
        $group = self::join('groups', 'user_products.group_id', '=', 'groups.id')
            ->select(
                'groups.title as name',
                DB::raw('COUNT(user_products.user_id) as value')
            )
            ->whereNotNull('user_products.group_id')
            ->groupBy('groups.id', 'groups.title')
            ->orderBy('value', 'desc')
            ->get();

        $data = [];
        foreach ($group as $key => $mentorship) {
            $data[] = [
                'name' => chr(97 + $key),
                'value' => $mentorship->value,
                'label' => $mentorship->name,
            ];
        }

        return $data;
    }

    public static function getStudentsPerCourse(): array
    {
        $courses = self::join('courses', 'user_products.course_id', '=', 'courses.id')
            ->select(
                'courses.title as name',
                DB::raw('COUNT(user_products.user_id) as value')
            )
            ->whereNotNull('user_products.course_id')
            ->groupBy('courses.id', 'courses.title')
            ->orderBy('value', 'desc')
            ->get();

        $data = [];
        foreach ($courses as $key => $course) {
            $data[] = [
                'name' => chr(97 + $key),
                'value' => $course->value,
                'label' => $course->name,
            ];
        }

        return $data;
    }

    /**
     * Get statistics for sales including total sales and sales made in the current month.
     *
     * @return array{month: string, product1: int, product2: int}
     */
    public static function getMonthlyExtraSales(): array
    {
        $results = self::join('extras', 'user_products.extra_id', '=', 'extras.id')
            ->select(
                DB::raw("TO_CHAR(MIN(user_products.created_at), 'TMMonth') as month"),
                'extras.title as product',
                DB::raw('COUNT(user_products.id) as total_sales')
            )
            ->whereNotNull('user_products.extra_id')
            ->groupBy(DB::raw("TO_CHAR(user_products.created_at, 'YYYY-MM')"), 'extras.title')
            ->orderBy(DB::raw("MIN(user_products.created_at)"))
            ->get();

        $data = [];
        foreach ($results as $result) {
            $month = $result->month;

            if (!isset($data[$month])) {
                $data[$month] = ['month' => $month];
            }

            $data[$month][$result->product] = (int) $result->total_sales;
        }

        return array_values($data);
    }
}
