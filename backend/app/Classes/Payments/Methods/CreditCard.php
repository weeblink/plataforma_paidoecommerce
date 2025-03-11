<?php

namespace App\Classes\Payments\Methods;

use App\Interfaces\PaymentMethodsInteface;

abstract class CreditCard implements PaymentMethodsInteface
{

    protected string $name = "credit_card";
    protected string $token = "";
    protected string $number;
    protected string $cvv;
    protected string $expiratioMonth;
    protected string $expirationYear;
    protected string $holderDocumentNumber;
    protected string $holderName;
    protected string $description;
    protected int $installments = 1;

    public function getName(): string
    {
        return $this->name;
    }

    protected function setToken( string $token ): void
    {
        $this->token = $token;
    }

    public function __construct(string $holderDocumentNumber, array $card = [])
    {
        $this->holderDocumentNumber = $holderDocumentNumber;
        $this->number               = $card['number'];
        $this->cvv                  = $card['cvv'];
        $this->expiratioMonth       = $card['expiration_month'];
        $this->expirationYear       = $card['expiration_year'];
        $this->holderName           = $card['holder_document_number'];
        $this->description          = "ImpDigital";
    }
}
