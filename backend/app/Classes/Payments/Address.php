<?php

namespace App\Classes\Payments;

class Address
{

    public string $postcode;
    public string $street;
    public string $number;
    public string $complement;
    public string $district;
    public string $city;
    public string $state;

    public function __construct( array $data = [] )
    {
        foreach($data as $property => $value){
            if(property_exists($this, $property))
                $this->$property = $value;
        }
    }
}
