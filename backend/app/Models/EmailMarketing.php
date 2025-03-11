<?php

namespace App\Models;

use App\Jobs\SendEmailJob;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class EmailMarketing extends Model
{

    use HasFactory, HasUuids;

    protected $table = 'email_marketing';
    protected $fillable = [];
    protected $hidden = [];
    protected $casts = [];

    public $timestamps = true;
    protected $primaryKey = 'id';

    public function metrics() : HasMany
    {
        return $this->hasMany(EmailMarketingMetrics::class, 'email_id', 'id');
    }

    /**
     * Function to save new Email Marketing
     * @param array $emailData
     * @param $leads
     * @return void
     * @throws Exception
     */
    public function saveNewEmail( array $emailData, $leads ): void
    {

        $this->subject          = $emailData['subject'];
        $this->message          = $emailData['message'];
        $this->type_action      = $emailData['type_action'];
        $this->contacts_count   = count($leads);
        $this->link             = $emailData['link'] ?? "";
        $this->file_url         = empty( $emailData['file'] ) ? "" : $this->saveFileEmail( $emailData['file'] );
        $this->scheduled        = (bool)$emailData['scheduled'];
        $this->schedule_time    = $emailData['schedule_time'] ?? null;

        if( !$this->save() )
            throw new Exception("An error occured while saving the email.");
    }

    public function scheduleMail( $leads ): void
    {

        $details = [
            'subject'       => $this->subject,
            'message'       => $this->message,
            'viewName'      => 'mail.email-marketing',
            'link'          => $this->link,
            'file_url'      => $this->file_url,
            'type_action'   => $this->type_action,
            'email_id'      => $this->id,
        ];

        if( $this->scheduled ){

            $now = now()->setTimezone('America/Sao_Paulo');
            $delay = $now->diffInSeconds($this->schedule_time);

            if( $delay < 0 )
                throw new Exception("A data inserida deve ser depois da data atual");

            foreach( $leads as $lead ) {

                $details['mail']       = $lead->email;
                $details['username']   = $lead->username;
                $details['lead_id']    = $lead->id;

                SendEmailJob::dispatch($details)->delay($delay);

                $jobId = DB::table('jobs')->latest()->first()->id;

                DB::table('schedule_email_jobs')->insert([
                    'job_id'        => $jobId,
                    'email_id'      => $details['email_id'],
                    'lead_id'       => $details['lead_id'],
                    'created_at'    => now(),
                ]);
            }

            return;
        }

        foreach( $leads as $lead ) {

            $details['mail']       = $lead->email;
            $details['username']   = $lead->username;
            $details['lead_id']    = $lead->id;

            Log::debug(preg_replace('/^http:/', 'https:', URL::route('api.email_marketing.set_opened', [ $details['email_id'], $details['lead_id'] ])));

            SendEmailJob::dispatch($details);
        }
    }

    /**
     * Function to get all leads register
     * @return mixed
     */
    public function getAllLeads(  ) : Collection
    {
        return User::join('users_infos', 'users.id', '=', 'users_infos.user_id')
            ->where('users_infos.user_type', 'STUDENT')
            ->get(['users.name', 'users.email', 'users.id']);
    }

    /**
     * Function to get Contact Leads
     * @param array $contacts
     * @return mixed
     */
    private function getContactsLeads( array $contacts ): Collection
    {
        return User::join('users_infos', 'users.id', '=', 'users_infos.user_id')
            ->where('users_infos.user_type', 'STUDENT')
            ->whereIn('users.email', $contacts)
            ->get(['users.name', 'users.email', 'users.id']);
    }

    /**
     * Function to save new File from Email
     * @param UploadedFile $file
     * @return string
     */
    private function saveFileEmail( UploadedFile $file ): string
    {
        return asset('storage/' . $file->store( 'email_marketing/', 'public' ));
    }

    /**
     * Function to remove all Scheduled Emails
     * @return void
     */
    public function removeScheduledEmails(  ): void
    {
        $jobs = DB::table('schedule_email_jobs')->where('email_id', $this->id)->get(  );

        foreach( $jobs as $job ){

            DB::table('jobs')->where('id', $job->job_id)->delete();
        }
    }

    /**
     * Function to remove file from email
     * @return void
     */
    public function removeFileIfExists(  ): void
    {

        if( $this->type_action === "file" && $this->file_url !== null ){

            $fileName = explode('storage/email_marketing/', $this->file_url)[1];
            $file = storage_path( 'app/public/email_marketing/' ) . $fileName;

            if( File::exists($file) )
                File::delete($file);
        }

    }

    /**
     * Function to get all emails saved
     * @return mixed
     * @throws \DateMalformedStringException
     */
    public function getEmails(  )
    {
        return self::orderBy('created_at', 'desc')->get()->map(function ($item) {
            return [
                'id'                => $item->id,
                'broadcast'         => $item->broadcast ? "SIM" : "NÃO",
                'subject'           => $item->subject,
                'message'           => $item->message,
                'contacts_count'    => $item->contacts_count,
                'scheduled'         => $item->scheduled ? "SIM" : "NÃO",
                'schedule_time'     => (new DateTime($item->schedule_time))->format('d/m/Y H:i'),
                'type_action'       => $item->type_action,
                'link'              => $item->link,
                'file_url'          => $item->file_url,
            ];
        });
    }

    /**
     * Function to get all Metrics from email
     * @return array
     * @throws \DateMalformedStringException
     */
    public function getMetrics(  ): array
    {
        return [
            'id'                => $this->id,
            'subject'           => $this->subject,
            'message'           => $this->message,
            'contacts_count'    => $this->contacts_count,
            'scheduled'         => $this->scheduled,
            'schedule_time'     => (new DateTime( $this->schedule_time ) )->format('d/m/Y H:i'),
            'type_action'       => $this->type_action,
            'link'              => $this->link,
            'file_url'          => $this->file_url,
            'created_at'        => (new DateTime( $this->created_at ) )->format('d/m/Y H:i'),
            'leads_seen'        => $this->metrics->map( function( $metric ) : array {
                return [
                    'email'     => $metric->lead->email,
                    'name'      => $metric->lead->name,
                ];
            })
        ];
    }
}
