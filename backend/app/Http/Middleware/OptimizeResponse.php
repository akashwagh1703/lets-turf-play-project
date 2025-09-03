<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptimizeResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add caching headers for API responses
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'public, max-age=300');
            $response->headers->set('Vary', 'Accept, Authorization');
        }

        // Enable GZIP compression
        if (!$response->headers->has('Content-Encoding')) {
            $content = $response->getContent();
            if (strlen($content) > 1024 && function_exists('gzencode')) {
                $response->setContent(gzencode($content));
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Content-Length', strlen($response->getContent()));
            }
        }

        return $response;
    }
}