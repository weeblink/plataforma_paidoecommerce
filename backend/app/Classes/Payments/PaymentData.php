<?php

namespace App\Classes\Payments;

class PaymentData
{
    public string $type;
    public string $status;
    public string|null $pay_reference;
    public string|null $pix_emv;
    public string|null $pix_qrcode;
    public string|null $pix_expiration;
    public string|null $invoice_expiration;
    public string|null $invoice_digitable;
    public string|null $invoice_code;
    public string|null $invoice_link;
}
