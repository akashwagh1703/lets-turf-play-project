<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class SecurityService
{
    public function sanitizeInput($input)
    {
        if (is_array($input)) {
            return array_map([$this, 'sanitizeInput'], $input);
        }
        
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    public function validatePassword($password)
    {
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $password);
    }

    public function encryptSensitiveData($data)
    {
        return Crypt::encryptString($data);
    }

    public function decryptSensitiveData($encryptedData)
    {
        try {
            return Crypt::decryptString($encryptedData);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function generateSecureToken($length = 32)
    {
        return Str::random($length);
    }

    public function hashSensitiveData($data)
    {
        return Hash::make($data);
    }

    public function verifySensitiveData($data, $hashedData)
    {
        return Hash::check($data, $hashedData);
    }

    public function detectSQLInjection($input)
    {
        $sqlPatterns = [
            '/(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i',
            '/(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i',
            '/[\'";]/',
            '/--/',
            '/\/\*.*\*\//'
        ];

        foreach ($sqlPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }

    public function detectXSS($input)
    {
        $xssPatterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/<iframe/i',
            '/<object/i',
            '/<embed/i'
        ];

        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }

    public function logSecurityEvent($event, $details = [])
    {
        \Log::channel('security')->warning($event, [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
            'details' => $details
        ]);
    }

    public function validateFileUpload($file)
    {
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if ($file->getSize() > $maxSize) {
            return ['valid' => false, 'error' => 'File too large'];
        }

        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedTypes)) {
            return ['valid' => false, 'error' => 'Invalid file type'];
        }

        // Check MIME type
        $mimeType = $file->getMimeType();
        $allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!in_array($mimeType, $allowedMimes)) {
            return ['valid' => false, 'error' => 'Invalid MIME type'];
        }

        return ['valid' => true];
    }
}