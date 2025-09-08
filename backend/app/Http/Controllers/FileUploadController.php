<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:image,document,video'
        ]);

        $file = $request->file('file');
        $type = $request->type;
        
        // Validate file type
        $allowedTypes = [
            'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'document' => ['pdf', 'doc', 'docx', 'txt'],
            'video' => ['mp4', 'avi', 'mov', 'wmv']
        ];
        
        $extension = $file->getClientOriginalExtension();
        if (!in_array(strtolower($extension), $allowedTypes[$type])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file type for ' . $type
            ], 422);
        }

        // Generate unique filename
        $filename = Str::uuid() . '.' . $extension;
        $path = $type . 's/' . date('Y/m/');
        
        // Store file
        $filePath = $file->storeAs($path, $filename, 'public');
        
        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'path' => $filePath,
                'url' => Storage::url($filePath),
                'size' => $file->getSize(),
                'type' => $type
            ]
        ]);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        if (Storage::disk('public')->exists($request->path)) {
            Storage::disk('public')->delete($request->path);
            return response()->json(['success' => true, 'message' => 'File deleted']);
        }

        return response()->json(['success' => false, 'message' => 'File not found'], 404);
    }
}