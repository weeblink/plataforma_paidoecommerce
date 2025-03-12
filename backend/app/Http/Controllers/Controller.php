<?php

namespace App\Http\Controllers;

/**
 * @OA\PathItem(path="/api")
 * @OA\Info(
 *     title="API Documentation - Pai do Ecommerce",
 *     version="1.0.0",
 * )
 *
 * @OAS\SecurityScheme(
 *     securityScheme="bearer_token",
 *     type="http",
 *     scheme="bearer"
 * )
 */

abstract class Controller
{

}
