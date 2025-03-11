<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Jobs\SendEmailJob;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Mockery\Exception;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function userinfo(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UsersInfo::class);
    }

    /**
     * Function to do login
     * @param $credenciais
     * @return array|false[]
     */
    public function login($credenciais): array
    {

        if (! Auth::attempt($credenciais, true))
            return ['logged' => false];

        $user = Auth::user();

        $user->tokens()->delete();

        $userData = $user->getSerializedUserData();

        return ['logged' => true, 'user' => $userData];
    }

    /**
     * Function to register user
     * @param $name
     * @param $cpf
     * @param $email
     * @param $password
     * @return string
     * @throws \Exception
     */
    public function register($name, $cpf, $email, $password): string
    {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);

        $user = new self();

        if (! $this->isValidCPF($cpf))
            throw new \Exception("CPF inválido");

        $user->name = $name;
        $user->cpf = $cpf;
        $user->email = $email;
        $user->password  = $password;

        if (!$user->save()) {
            throw new \Exception("Ocorreu um erro ao tentar salvar o novo cadastro");
        }

        $userinfoModel = new UsersInfo();
        $userinfoModel->user_id = $user->id;
        $userinfoModel->phone = "";
        $userinfoModel->user_type = "STUDENT";

        if (!$userinfoModel->save()) {
            throw new \Exception("Ocorreu um erro ao tentar salvar o novo cadastro");
        }

        Auth::login($user);
        return $user->createToken('token', ['is-student'])->plainTextToken;
    }

    /**
     * Function to send mail password recovery
     * @param string $email
     * @return void
     */
    public function passwordRecovery(string $email): void
    {

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        $token = Str::random('64');
        $createdAt = date('Y-m-d H:i:s');

        DB::table('password_reset_tokens')->insert(['email' => $email, 'token' => $token, 'created_at' => $createdAt]);

        $details = array(
            'mail'          => $email,
            'subject'       => "Cristian Seller - Recuperação de senha",
            'message'       => "Olá! \n\nAlguém está acessando sua conta e deseja redefinir a senha da sua conta. Para criar uma nova senha para a sua conta basta clicar no botão abaixo para alterar. \n\nCaso não tenha sido você, por favor entre em contato com a equipe de suporte da plataforma",
            'viewName'      => 'mail.recovery-password',
            'username'      => "Usuário",
            'recovery_link' => env("FRONTEND_URL", "https://imperiumdigital.com.br/") . "reset-password/" . $token
        );

        Log::debug(json_encode($details));

        SendEmailJob::dispatch($details);
    }

    /**
     * Function to reset password from user
     * @throws \Exception
     */
    public function resetPassword(string $token, string $password): void
    {
        $tokenData = DB::table('password_reset_tokens')->where('token', $token)->first();

        if ($this->isExpiredToken($tokenData->created_at, $token))
            throw new \Exception("Token expirado");

        $user = User::where('email', $tokenData->email)->first();
        $user->password = $password;

        if (! $user->save()) throw new \Exception("Ocorreu um erro ao tentar alterar a senha");

        DB::table('password_reset_tokens')->where('token', $token)->delete();
    }

    /**
     * Function to get profile Data from User
     * @return array
     */
    public function getProfileData(): array
    {
        $userInfo = $this->userinfo;

        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'phone'     => $userInfo->phone,
            'cpf'       => $this->cpf,
            'user_type' => $userInfo->user_type,
        ];
    }

    /**
     * Function to update profile user STUDENT
     * @param string $name
     * @param string $phone
     * @param string $password
     * @return void
     * @throws \Exception
     */
    public function updateProfile(string $name, string $phone, string $password): void
    {
        $this->name = $name;
        $this->password = $password;

        $usersInfo = $this->userinfo;

        // Verifica se as informações do usuário existem
        if (!$usersInfo) {
            throw new \Exception("Informações do usuário não encontradas.");
        }

        $usersInfo->phone = $this->formatPhoneNumber($phone);

        if (! $this->save() || !$usersInfo->save())
            throw new \Exception("Ocorreu um erro inesperado ao tentar salvar o novo cadastro");
    }

    /**
     * Function to get all Leads
     * @return mixed
     */
    public function getLeads(): mixed
    {
        return self::join("users_infos", "users_infos.user_id", "=", "users.id")
            ->where('users_infos.user_type', "STUDENT")
            ->select(["users_infos.phone", "users_infos.user_type", "users.name", "users.email", "users.created_at"])
            ->get();
    }

    /**
     * Function to get Lead Statistics
     * @return array{leads_added_this_month: int, total_leads: int}
     */
    public static function getLeadStatistics(): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $totalLeads = self::join("users_infos", "users_infos.user_id", "=", "users.id")
            ->where('users_infos.user_type', "STUDENT")
            ->count();

        $leadsAddedThisMonth = self::join("users_infos", "users_infos.user_id", "=", "users.id")
            ->where('users_infos.user_type', "STUDENT")
            ->whereYear('users.created_at', $currentYear)
            ->whereMonth('users.created_at', $currentMonth)
            ->count();

        return [
            'total_leads' => $totalLeads,
            'leads_added_this_month' => $leadsAddedThisMonth,
        ];
    }

    /**
     * Function to get Leads per Month
     * @return array{total: int, name: string}[]
     */
    public static function getLeadsPerMonth(): array
    {
        $leads = self::join("users_infos", "users_infos.user_id", "=", "users.id")
            ->where('users_infos.user_type', "STUDENT")
            ->whereYear('users.created_at', Carbon::now()->year)
            ->select(
                DB::raw('EXTRACT(MONTH FROM users.created_at) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(DB::raw("TO_CHAR(users.created_at, 'Month')"))
            ->groupBy(DB::raw('EXTRACT(MONTH FROM users.created_at)'))
            ->orderBy(DB::raw('EXTRACT(MONTH FROM users.created_at)'))
            ->get();


        $months = [
            1 => 'Jan', 2 => 'Fev', 3 => 'Mar', 4 => 'Abr',
            5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
            9 => 'Set', 10 => 'Out', 11 => 'Nov', 12 => 'Dec'
        ];

        $data = [];
        foreach ($months as $key => $name) {
            $total = $leads->firstWhere('month', $key)?->total ?? 0;
            $data[] = [
                'name' => $name,
                'total' => $total
            ];
        }

        return $data;
    }

    public function isValidToken(string $token): bool
    {
        $tokenData = DB::table('password_reset_tokens')->where('token', $token)->first();

        if (empty($token)) return false;

        return ! $this->isExpiredToken($tokenData->created_at, $token);
    }

    /**
     * Function to check if token for reset password is expired
     * @param $created_at
     * @param $token
     * @return bool
     */
    private function isExpiredToken($created_at, $token): bool
    {

        date_default_timezone_set("America/Sao_Paulo");

        if (! (strtotime($created_at) > strtotime("-5 minutes"))) {

            DB::table('password_reset_tokens')
                ->where('token', '=', $token)
                ->delete();

            return true;
        }

        return false;
    }

    /**
     * Function to validate CPF inserted
     * @param string $cpf
     * @return bool
     */
    private function isValidCPF(string $cpf): bool
    {

        if (strlen($cpf) !== 11) {
            return false;
        }

        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $d = 0;
            for ($c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }

        return true;
    }

    /**
     * Function to format Phone Number
     * @param string $phone
     * @return array|string|null
     */
    private function formatPhoneNumber(string $phone): array|string|null
    {
        return preg_replace('/\D/', '', $phone);
    }

    /**
     * Function to create new Token for user
     * @return string
     */
    public function refreshAccessToken(): string
    {
        $abilities = $this->userinfo->user_type === "STUDENT" ? "is-student" : "is-admin";

        return $this->createToken('token', [$abilities])->plainTextToken;
    }

    /**
     * Function to get data serialized from User
     * @return array
     */
    public function getSerializedUserData(): array
    {

        $bearerToken = $this->refreshAccessToken();

        return [
            'name'      => $this->name,
            'cpf'       => $this->cpf,
            'email'     => $this->email,
            'user_type' => $this->userinfo->user_type,
            'phone'     => $this->userinfo->phone,
            'token'     => $bearerToken
        ];
    }

    /**
     * Function to search leads contacts
     * @param string $searchTerm
     * @return mixed
     */
    public function searchLeads(string $searchTerm)
    {
        return User::where('email', "LIKE", "%{$searchTerm}%")->get(['name', 'email']);
    }
}
