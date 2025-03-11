<?php

namespace App\Classes\Payments\Apps\Appmax\methods;

use App\Classes\Payments\Methods\Pix;
use App\Interfaces\AppMethodsPaymentsInterface;

class PixAppmax extends Pix implements AppMethodsPaymentsInterface
{
    public function getPaymentData(): array
    {
        return [
            'pix'   => [
                'document_number' => $this->holderDocumentNumber,
            ]
        ];
    }
}
