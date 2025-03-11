<?php

namespace App\Classes\Payments\Apps\Appmax\methods;


use App\Classes\Payments\Methods\CreditCard;
use App\Interfaces\AppMethodsPaymentsInterface;

class CreditCardAppmax extends CreditCard implements AppMethodsPaymentsInterface
{

    /**
     * Function to set token from card
     * @param string $token
     * @return void
     */
    public function setToken(string $token): void
    {
        $this->setToken($token);
    }

    public function getPaymentData(): array
    {
        return [
            'CreditCard'    => [
                'number'                    => $this->number,
                'document_number'           => $this->holderDocumentNumber,
                'installments'              => $this->installments,
                'soft_descriptor'           => $this->description,
                'cvv'                       => $this->cvv,
                'month'                     => (int)$this->expiratioMonth,
                'year'                      => (int)$this->expirationYear,
                'name'                      => $this->name,
            ]
        ];
    }
}
