<?php

namespace App\Interfaces;

interface PaymentMethodsInteface {

    public function __construct( string $holderDocumentNumber, array $card = [] );

    public function getName() : string;
}
