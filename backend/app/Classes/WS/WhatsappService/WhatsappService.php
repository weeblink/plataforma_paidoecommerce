<?php

namespace App\Classes\WS\WhatsappService;

use Exception;
use Illuminate\Support\Facades\Log;

class WhatsappService{

    /**
     * Function to send Campaign to groups
     *
     * @param string $grouJid
     * @param string $message
     * @return void
     * @throws Exception
     */
    public static function sendCampaign( string $grouJid, string $message): void
    {

        $url = env("WS_WHATSAPP_URL") . "/campaign/send";

        $data = [
            'message'   => $message,
            'groups'    => [
                $grouJid
            ]
        ];

        self::sendRequest($url, "POST", $data);
    }

    /**
     * Function to create new group with participants
     *
     * @param string $nameUser
     * @param string $groupTitle
     * @param string $expirationDate
     * @param bool $isSingle
     * @param array $participants
     * @return array
     * @throws Exception
     */
    public static function createGroup(
        string $nameUser,
        string $groupTitle,
        string $expirationDate,
        bool $isSingle,
        array $participants
    ): array
    {
        $url = env("WS_WHATSAPP_URL") . "/groups/create";

        $data = [
            'nameUser'              => $nameUser,
            'groupTitle'            => $groupTitle,
            'groupExpirationDate'   => $expirationDate,
            'isSingle'              => $isSingle,
            'participants'          => $participants
        ];

        $response = self::sendRequest($url, "POST", $data);

        if( $response->status !== "success" )
            throw new Exception("An unexpected error occurred while adding participants.");

        return [
            'jid'           => $response->data->jid,
            'subject'       => $response->data->subject,
            'owner'         => $response->data->owner,
            'description'   => $response->data->desc,
            'announce'      => $response->data->announce,
            'restrict'      => $response->data->restrict
        ];
    }

    /**
     * Function to add participant to group
     *
     * @param string $groupJid
     * @param array $participants
     * @return void
     * @throws Exception
     */
    public static function addParticipant(
        string $groupJid,
        array $participants
    ): void
    {
        $url = env("WS_WHATSAPP_URL") . '/groups/add-participants';

        $data = [
            'group_id'      => $groupJid,
            'participants'  => [$participants]
        ];

        $response = self::sendRequest($url, "POST", $data);

        if( $response->status !== "success" )
            throw new Exception("An unexpected error occurred while adding participants.");


    }

    /**
     * Function to execute requests to WebService
     *
     * @param $url
     * @param $method
     * @param $data
     * @param $additionalOptions
     * @return mixed
     * @throws Exception
     */
    private static function sendRequest($url, $method = 'POST', $data = null, $additionalOptions = []): mixed
    {
        $defaultOptions = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . env("WS_WHATSAPP_TOKEN"),
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10
        ];

        switch (strtoupper($method)) {
            case 'GET':
                $defaultOptions[CURLOPT_HTTPGET] = true;
                break;
            case 'POST':
                $defaultOptions[CURLOPT_POST] = true;
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            case 'PUT':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'PUT';
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            case 'DELETE':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'DELETE';
                break;
            case 'PATCH':
                $defaultOptions[CURLOPT_CUSTOMREQUEST] = 'PATCH';
                if ($data) {
                    $defaultOptions[CURLOPT_POSTFIELDS] = is_array($data) ? json_encode($data) : $data;
                }
                break;
            default:
                throw new \InvalidArgumentException("HTTP method '{$method}' not supported");
        }

        // Merge default options with additional options
        $curlOptions = $additionalOptions + $defaultOptions;

        $curl = curl_init();
        curl_setopt_array($curl, $curlOptions);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        Log::debug('response: ' . $response);

        curl_close($curl);

        if (curl_errno($curl)) {
            throw new Exception(curl_error($curl));
        }

        $data = json_decode($response);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Failed to decode JSON response');
        }

        return $data;
    }
}
