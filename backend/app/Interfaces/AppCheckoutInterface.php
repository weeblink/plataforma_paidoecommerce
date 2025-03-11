<?php

namespace App\Interfaces;

use App\Classes\Payments\Client;
use App\Classes\Payments\PaymentData;
use App\Models\CustomerModel;
use App\Models\Order;

interface AppCheckoutInterface
{
    public function makePayment( Order $order, CustomerModel $customer ) : PaymentData;
}
