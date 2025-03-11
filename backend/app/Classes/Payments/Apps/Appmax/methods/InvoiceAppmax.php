<?php

namespace App\Classes\Payments\Apps\Appmax\methods;

use App\Classes\Payments\Methods\Invoice;
use App\Interfaces\AppMethodsPaymentsInterface;

class InvoiceAppmax extends Invoice implements AppMethodsPaymentsInterface
{

    public function getPaymentData(): array
    {
        return [
            'Boleto'    => [
                'document_number' => $this->holderDocumentNumber,
            ]
        ];
    }
}
