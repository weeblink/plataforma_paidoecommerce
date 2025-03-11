<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Connections extends Model
{

    use HasFactory, HasUuids;

    protected $table = 'connections';
    protected $fillable = ['name', 'status', 'session', 'qrcode', 'retry_count'];
    protected $timestamp = true;

    public static function createNew( string $name ): Connections
    {
        $newConnection = new self();

        $newConnection->name = $name;
        $newConnection->status = 'deactive';
        $newConnection->session = null;
        $newConnection->qrcode = null;
        $newConnection->retry_count = 0;

        if( !$newConnection->save() )
            throw new \Exception("Unable to create new connection");

        return $newConnection;
    }

    public static function listAll(): \Illuminate\Database\Eloquent\Collection
    {
        return self::all(['id', 'name', 'status', 'session', 'retry_count', 'created_at']);
    }
}
