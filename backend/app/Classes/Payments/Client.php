<?php

namespace App\Classes\Payments;

class Client{

    private string $clientIdPlataform;
    public string $firstName;
    public string $lastName;
    public string $email;
    public string $phone;
    public Address $address;
    public string $ip;
    public string $documentNumber;

    public function __construct( array $data = [] )
    {
        foreach($data as $property => $value){
            if(property_exists($this, $property))
                $this->$property = $value;
        }
    }

    public function getClientIdPlataform(): string
    {
        return $this->clientIdPlataform;
    }

    public function setClientIdPlataform(string $clientIdPlataform): void
    {
        $this->clientIdPlataform = $clientIdPlataform;
    }
}
