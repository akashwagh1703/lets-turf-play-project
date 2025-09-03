<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    public function handle(Request $request, Closure $next, int $ttl = 300): Response
    {
        // Only cache GET requests
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        // Generate cache key
        $cacheKey = 'api_response_' . md5($request->fullUrl() . serialize($request->headers->all()));

        // Check if response is cached
        if (Cache::has($cacheKey)) {
            $cachedResponse = Cache::get($cacheKey);
            return response($cachedResponse['content'], $cachedResponse['status'])
                ->withHeaders($cachedResponse['headers'])
                ->header('X-Cache', 'HIT');
        }

        // Get response
        $response = $next($request);

        // Cache successful responses
        if ($response->getStatusCode() === 200) {
            Cache::put($cacheKey, [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all()
            ], $ttl);
        }

        return $response->header('X-Cache', 'MISS');
    }
}