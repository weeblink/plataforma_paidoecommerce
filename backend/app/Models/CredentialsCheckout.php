<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class CredentialsCheckout extends Model
{
    use HasFactory;

    protected $table = 'credentials_checkout';
    protected $fillable = [
        'app_name',
        'app_id',
        'token',
        'client_id',
        'client_secret',
        'expires_in',
        'api_key'
    ];

    public function payments()
    {
        $this->belongsToMany(Payment::class, 'payments', 'id', 'checkout_id' );
    }

    /**
     * Function to config new credentials
     * @return void
     * @throws Exception
     */
    public function configCredentials(  ): void
    {

        self::query()->delete();

        if( !$this->save() )
            throw new Exception("An error occured while trying to save credentials");
    }

    /**
     * Function to list all credentials
     * @return Collection
     */
    static function listAll(  ): Collection
    {
        return self::query()->get([
            'app_name',
            'app_id',
            'token',
            'client_id',
            'client_secret',
            'expires_in',
            'api_key'
        ]);
    }

    /**
     * Function to get all available apps
     * @return array
     */
    static function getAvailableApps(  ) : array 
    {

        $selectedAppCheckout = self::query()->first([
            'app_name',
            'app_id',
            'token',
            'client_id',
            'client_secret',
            'expires_in',
            'api_key'
        ]);

        $availableApps =  [
            [
                'id' => 'appmax',
                'name' => 'AppMax',
                'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSngwoV_fRE4x8quGqZgFaebxZEuvvuLq9Q_g&s',
                'is_active' => true,
                'is_selected' => false,
            ],
            [
                'id' => 'asaas',
                'name' => 'Asaas',
                'image_url' => 'https://s3.amazonaws.com//beta-img.b2bstack.net/uploads/production/product/product_image/580/logo-asaas-azul-.png',
                'is_active' => true,
                'is_selected' => false,
            ],
        ];

        if( !$selectedAppCheckout ) return $availableApps;

        return array_map(function($app) use ($selectedAppCheckout) {
            
            if( $app['id'] === $selectedAppCheckout->app_id){
                $app['is_selected'] = true;
            }

            return $app;

        }, $availableApps);
    }

    static function getCredentialApp( $app_id ): self | null
    {
        return self::where('app_id', $app_id)->first([
            'app_name',
            'app_id',
            'token',
            'client_id',
            'client_secret',
            'expires_in',
            'api_key'
        ]);
    }
}
