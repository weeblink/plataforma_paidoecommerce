<?php

namespace App\Classes\Payments;

class Order
{

    private string $orderIdPlataform;
    public string $customerId;
    public int $productsValue;
    public int $discountValue;
    public int $shippingValue;
    public string $typePayment;
    private array $products;
    private array|null $card;

    public function __construct( array $data = [] )
    {
        foreach($data as $property => $value){
            if(property_exists($this, $property))
                $this->$property = $value;
        }
    }

    public function setProducts( array $products )
    {
        $this->products = $products;
    }

    public function getProducts(  ) : array
    {
        return $this->products;
    }

    /**
     * Function to get card propertys
     * @return array
     */
    public function getCard(  ) : array
    {
        return $this->card;
    }

    /**
     * Function to get OrderId from plataform register
     * @return string
     */
    public function getOrderIdPlataform(): string
    {
        return $this->orderIdPlataform;
    }

    /**
     * Function to set orderId from plataform register
     * @param string $orderIdPlataform
     * @return void
     */
    public function setOrderIdPlataform(string $orderIdPlataform): void
    {
        $this->orderIdPlataform = $orderIdPlataform;
    }
}
