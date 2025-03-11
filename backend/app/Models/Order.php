<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{

    use HasUuids;

    protected $table = 'orders';
    protected $fillable = [
        'customer_id',
        'products_value',
        'discount_value',
        'shipping_value',
        'type_payment',
        'user_product_id',
        'type_product',
        'product_id',
    ];

    /**
     * Function to make relation with Payment
     * @return BelongsTo
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'id');
    }

    /**
     * Function to make relation with customer
     * @return HasOne
     */
    public function customer(): HasOne
    {
        return $this->hasOne(CustomerModel::class, 'customer_id', 'id');
    }

    public function userProduct(): HasOne
    {
        return $this->hasOne(UserProduct::class, 'id', 'user_product_id');
    }

    /**
     * Function to create or update a new order
     * @param string $customerId
     * @param float $productsValue
     * @param float $discountValue
     * @param float $shippingValue
     * @param string $typePayment
     * @param int $userProductId
     * @return Order
     */
    public function createOrUpdateOrder(string $customerId, float $productsValue, float $discountValue, float $shippingValue, string $typePayment, int $userProductId): Order
    {
        $this->customer_id = $customerId;
        $this->products_value = $productsValue;
        $this->discount_value = $discountValue;
        $this->shipping_value = $shippingValue;
        $this->type_payment = $typePayment;
        $this->user_product_id = $userProductId;

        if (!$this->save()) {
            throw new \Exception("An error occured while saving the order.");
        }

        return $this;
    }
}
