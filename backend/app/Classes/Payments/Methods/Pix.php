<?php

namespace App\Classes\Payments\Methods;

use App\Interfaces\PaymentMethodsInteface;

class Pix implements PaymentMethodsInteface
{

    protected string $name = "invoice";
    protected string $holderDocumentNumber;

    public function getName(): string
    {
        return $this->name;
    }

    public function __construct(string $holderDocumentNumber, array $card = [])
    {
        $this->holderDocumentNumber = $holderDocumentNumber;
    }
}
