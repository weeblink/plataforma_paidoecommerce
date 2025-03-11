<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckoutAppsRestriction
{

    /**
     * Get allowed IP addresses from configuration
     */
    protected function getAllowedIps(): array
    {
        $ips = env('CHECKOUTAPP_ALLOWED_IPS', '15.229.103.46');
        return array_map('trim', explode(',', $ips));
    }

    /**
     * Get the real client IP address
     */
    protected function getClientIp(Request $request): string
    {
        // Tunnels support
        if ($request->header('X-Forwarded-For')) {

            $ips = array_map('trim', explode(',', $request->header('X-Forwarded-For')));
            return $ips[0];
        }

        // Fallback to direct IP
        return $request->ip();
    }

    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $clientIp = $this->getClientIp($request);

        if (!in_array($clientIp, $this->getAllowedIps())) {
            logger()->warning('Unauthorized Appmax webhook attempt', [
                'ip' => $clientIp,
                'forwarded_for' => $request->header('X-Forwarded-For'),
                'direct_ip' => $request->ip(),
                'path' => $request->path(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'error' => 'Unauthorized IP address'
            ], 403);
        }

        return $next($request);
    }
}
