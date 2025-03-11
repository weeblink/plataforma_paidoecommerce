<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MentorshipGroup extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'groups';
    protected $fillable = ['mentorship_id', 'course_id', 'title', 'price', 'price_promotional', 'qnt_students', 'purchase_deadline', 'expiration_date', 'type'];
    protected $primaryKey = 'id';
    public $timestamps = false;

    /**
     * Function to get course from module
     * @return BelongsTo
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Courses::class, 'course_id', 'id');
    }

    /**
     * Function to get mentorship
     * @return BelongsTo
     */
    public function mentorship(): BelongsTo
    {
        return $this->belongsTo(Mentorship::class, 'mentorship_id', 'id');
    }

    /**
     * Function to get userProducts
     *
     * @return HasMany
     */
    public function userProducts()
    {
        return $this->hasMany(UserProduct::class, 'group_id');
    }

    /**
     * Function to get whatsapp groups
     * @return HasOne
     */
    public function whatsappGroups(): HasOne
    {
        return $this->hasOne(WhatsappGroups::class, 'group_mentorship_id', 'id');
    }

    /**
     * Function to create a new mentorship group
     * @param string $mentorshipId
     * @param string $courseId
     * @param string $title
     * @param float $price
     * @param float $pricePromotional
     * @param int $qntStudents
     * @param string $purchaseDeadline
     * @param string $expirationDate
     * @param string $type
     * @return MentorshipGroup
     * @throws \Exception
     */
    public function createOrUpdateMentorshipGroup(string $mentorshipId, string $courseId, string $title, float $price, float $pricePromotional, int $qntStudents, string $purchaseDeadline, string $expirationDate, string $type)
    {
        if (!$this->exists) {
            $this->mentorship_id = $mentorshipId;
        }

        $this->course_id = $courseId;
        $this->title = $title;
        $this->price = $price;
        $this->price_promotional = $pricePromotional;
        $this->qnt_students = $qntStudents;
        $this->purchase_deadline = $purchaseDeadline;
        $this->expiration_date = $expirationDate;
        $this->type = $type;

        if (!$this->exists)
            $this->id = (string) \Illuminate\Support\Str::uuid();


        if (!$this->save()) {
            throw new \Exception("An error occured while saving the mentorship group.");
        }

        return $this;
    }

    static function listUserMentoringGroupsUnlocked($userId): \Illuminate\Support\Collection
    {
        $subquery = self::select(
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
            'mentorships.image_url',
            DB::raw("COALESCE(NOT user_products.user_id IS NOT NULL, true) as is_locked")
        )->join('mentorships', 'mentorships.id', '=', 'groups.mentorship_id')
            ->leftJoin('user_products', function ($join) use ($userId) {
                $join->on('groups.id', '=', 'user_products.group_id')
                    ->where('user_products.user_id', $userId);
            });

        return DB::table(DB::raw("({$subquery->toSql()}) as filtered_mentorships"))
        ->mergeBindings($subquery->getQuery())
        ->where('is_locked', '=', false)
        ->get();
    }

    static function getPaymentData(MentorshipGroup $group): array
    {

        return [
            'id'                    => $group->id,
            'title'                 => $group->title,
            'price'                 => $group->price,
            'promotional_price'     => $group->price_promotional,
            'image_url'             => $group->mentorship->image_url
        ];
    }

    /**
     * Function to get all groups
     * @return mixed
     */
    public static function getAllGroups(  ): mixed
    {
        return self::select('id', 'title')->where('type', 'group')->orderBy('title', 'ASC')->get();
    }

}

