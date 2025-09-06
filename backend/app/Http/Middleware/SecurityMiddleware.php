<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class SecurityMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Rate limiting
        $key = $request->ip();
        if (RateLimiter::tooManyAttempts($key, 100)) {
            return response()->json(['error' => 'Too many requests'], 429);
        }
        RateLimiter::hit($key, 60);

        // Security headers
        $response = $next($request);
        
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Remove server information
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}