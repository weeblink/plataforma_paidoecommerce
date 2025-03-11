<?php

namespace App\Classes\PandaVideo;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;

class PandaVideo
{
    protected Client $client;
    protected string $uploaderUrl = 'https://uploader-us01.pandavideo.com.br/files';

    protected string $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.pandavideo.api_key');
    }

    /**
     * Faz upload direto de um vídeo para o Panda Video.
     *
     * @param string $filePath Caminho do arquivo local
     * @param string $fileName Nome do arquivo codificado em Base64
     * @param string $courseTitleFormatted Nome do curso formatado para nome de diretório
     * @return string Resposta do servidor
     * @throws GuzzleException
     * @throws Exception
     */
    public function uploadVideoDirectly(
        string $filePath,
        string $fileName,
        string $courseTitleFormatted,
    ): string {

        $videoId = Uuid::uuid4()->toString();

        $fileSize = filesize($filePath);
        $metadata = [
            'authorization ' . base64_encode( $this->apiKey ),
            'filename ' . base64_encode( $fileName ),
            'folder_id ' . base64_encode( $this->getFolderId($courseTitleFormatted) ),
            'video_id ' . base64_encode( $videoId ),
        ];

        $headers = [
            'Tus-Resumable' => '1.0.0',
            'Upload-Length' => $fileSize,
            'Content-Type' => 'application/offset+octet-stream',
            'Upload-Metadata' => implode(', ', $metadata),
        ];

        try {
            $this->client->post($this->uploaderUrl, [
                'headers' => $headers,
                'body' => fopen($filePath, 'r'),
            ]);

            return $videoId;
        } catch (Exception $e) {
            Log::error($e->getMessage());
            throw new Exception("Erro ao enviar vídeo: {$e->getMessage()}");
        }
    }

    /**
     * Function to get folder id to save video
     *
     * @param string $folderName
     * @return string
     * @throws Exception
     */
    public function getFolderId( string $folderName ): string
    {

        $folders = $this->getFolders($folderName);

        return empty($folders)
            ? $this->createNewFolder( $folderName )
            : $folders[0]->id;

    }

    /**
     * Function to get all folders wich match name on pandavídeo
     *
     * @param string $folderName
     * @return array
     * @throws Exception
     */
    public function getFolders( string $folderName ) : array
    {
        try{

            $url = "https://api-v2.pandavideo.com.br/folders?name={$folderName}";

            $headers = [
                'Accept'    => "application/json",
                'Authorization' => $this->apiKey,
            ];

            $response = $this->client->get($url, [
                'headers' => $headers,
            ]);

            $folders = json_decode($response->getBody()->getContents());
            return $folders->folders;

        }catch (GuzzleException $e) {
            throw new Exception("An unexpected error occurred: {$e->getMessage()}");
        }
    }

    /**
     * Function to create new Folder on PandaVideo
     *
     * @param string $folderName
     * @return string
     * @throws Exception
     */
    public function createNewFolder( string $folderName ) : string {
        try{

            $url = "https://api-v2.pandavideo.com.br/folders";

            $headers = [
                'Accept'    => "application/json",
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            $response = $this->client->post($url, [
                'headers' => $headers,
                'body'    => json_encode([
                    'name' => $folderName,
                ])
            ]);

            $newFolder = json_decode( $response->getBody()->getContents() );
            return $newFolder->id;

        }catch (GuzzleException $e) {
            throw new Exception("An unexpected error occurred on trying create folder: {$e->getMessage()}");
        }
    }

    /**
     * Function to delete Video
     *
     * @param array $videosIds
     * @return void
     * @throws Exception
     */
    public function deleteVideos( array $videosIds ): void
    {
        try{

            $url = "https://api-v2.pandavideo.com.br/videos";

            $headers = [
                'Accept'    => "application/json",
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            $reponse = $this->client->delete($url, [
                'headers' => $headers,
                'body'    => json_encode($videosIds)
            ]);

            Log::debug($reponse->getBody()->getContents());

        }catch( GuzzleException $e ) {
            throw new Exception("An unexpected error occurred while trying delete video on Panda: {$e->getMessage()}");
        }
    }

    /**
     * Function to get external Id from video
     *
     * @param string $videoId
     * @return string
     * @throws Exception
     */
    public function getVideoUrl( string $videoId ) : string {
        try{

            $url = "https://api-v2.pandavideo.com.br/videos/{$videoId}";
            $headers = [
                'Accept'    => "application/json",
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ];

            $response = $this->client->get($url, ['headers' => $headers ]);
            $data = json_decode( $response->getBody()->getContents() );

            return $data->video_player;

        }catch(GuzzleException $e){
            throw new Exception("An unexpected error ocourred while trying get external video Id: {$e->getMessage()}");
        }
    }
}
