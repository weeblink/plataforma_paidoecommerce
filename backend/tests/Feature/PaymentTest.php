<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Testes de Recurso para a rota de Criação de Pagamento.
 */
class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected $token;
    protected $validPayload;

    protected function setUp(): void
    {
        parent::setUp();

        // Configuração de um usuário válido (necessário para obter um token)
        $user = User::factory()->create([
            'email' => 'pagamento@teste.com',
            'password' => Hash::make('password'),
            'cpf'       => '60491418604'
        ]);

        // Faz login internamente para obter um token Sanctum
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'pagamento@teste.com',
            'password' => 'password',
        ]);

        // Define o token para uso nos testes
        $this->token = $loginResponse->json('data.token');

        // Payload base válido para testes de sucesso e modificação
        $this->validPayload = [
            "first_name" => "Ana",
            "last_name" => "Oliveira",
            "phone" => "11987654321",
            "email" => "ana@teste.com",
            "document_type" => "cpf",
            "document_number" => "12345678909",
            "order" => [
                "type_product" => "course",
                "product_id" => "1",
                "discount_value" => 0,
                "shipping_value" => 0,
                "type_payment" => "pix"
            ],
            "address" => [
                "postcode" => "01310100",
                "street" => "Av Paulista",
                "number" => "1000",
                "district" => "Bela Vista",
                "city" => "São Paulo",
                "state" => "SP"
            ]
        ];
    }

    /**
     * Helper para fazer requisições POST com autenticação.
     */
    protected function authenticatedPostJson(string $uri, array $data = [])
    {
        return $this->postJson($uri, $data, [
            'Authorization' => "Bearer {$this->token}",
        ]);
    }

    // ========================================
    // TESTES DE SUCESSO
    // ========================================

    /**
     * Testa a criação de pagamento PIX com dados válidos.
     *
     * @return void
     */
    public function test_payment_pix_creation_success()
    {
        $response = $this->authenticatedPostJson('/api/payments/create', $this->validPayload);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message', 
                     'data' => [
                         'payment_id', 
                         // Inclua aqui outras chaves esperadas no JSON de sucesso
                     ]
                 ]);
    }

    /**
     * Testa a criação de pagamento com produto 'mentorship' (Mentoria).
     *
     * @return void
     */
    public function test_payment_mentorship_product_success()
    {
        $payload = array_merge($this->validPayload, [
            'order' => array_merge($this->validPayload['order'], ['type_product' => 'mentorship'])
        ]);

        $response = $this->authenticatedPostJson('/api/payments/create', $payload);

        $response->assertStatus(201);
    }

    // ========================================
    // TESTES DE VALIDAÇÃO (CPF/CNPJ)
    // ========================================

    /**
     * Testa validação de CPF inválido (todos zeros).
     *
     * @return void
     */
    public function test_validation_invalid_cpf_all_zeros()
    {
        $payload = array_merge($this->validPayload, [
            'document_number' => '00000000000'
        ]);

        $response = $this->authenticatedPostJson('/api/payments/create', $payload);
        
        // Espera um 422 (Unprocessable Entity) que é o padrão de validação do Laravel
        $response->assertStatus(422) 
                 ->assertJsonValidationErrors('document_number');
    }
    
    /**
     * Testa validação de CNPJ inválido (todos zeros).
     *
     * @return void
     */
    public function test_validation_invalid_cnpj_all_zeros()
    {
        $payload = array_merge($this->validPayload, [
            'document_type' => 'cnpj',
            'document_number' => '00000000000000'
        ]);

        $response = $this->authenticatedPostJson('/api/payments/create', $payload);
        
        $response->assertStatus(422) 
                 ->assertJsonValidationErrors('document_number');
    }

    // ========================================
    // TESTES DE VALIDAÇÃO (Campos Obrigatórios)
    // ========================================

    /**
     * Testa a falha de validação quando o 'email' está em formato inválido.
     *
     * @return void
     */
    public function test_validation_invalid_email_format()
    {
        $payload = array_merge($this->validPayload, [
            'email' => 'email-invalido'
        ]);

        $response = $this->authenticatedPostJson('/api/payments/create', $payload);
        
        $response->assertStatus(422) 
                 ->assertJsonValidationErrors('email');
    }

    /**
     * Testa a falha de validação quando o 'state' (estado) é inválido.
     *
     * @return void
     */
    public function test_validation_invalid_state()
    {
        $payload = array_merge($this->validPayload, [
            'address' => array_merge($this->validPayload['address'], ['state' => 'XX'])
        ]);

        $response = $this->authenticatedPostJson('/api/payments/create', $payload);
        
        $response->assertStatus(422) 
                 ->assertJsonValidationErrors('address.state');
    }
    
    // ========================================
    // TESTES DE AUTORIZAÇÃO
    // ========================================

    /**
     * Testa se a rota está protegida por autenticação.
     *
     * @return void
     */
    public function test_payment_requires_authentication()
    {
        // Faz requisição sem token
        $response = $this->postJson('/api/payments/create', $this->validPayload);

        // Espera um 401 (Unauthorized)
        $response->assertStatus(401); 
    }
}