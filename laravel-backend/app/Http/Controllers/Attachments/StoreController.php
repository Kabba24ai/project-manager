<?php

namespace App\Http\Controllers\Attachments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttachmentRequest;
use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    /**
     * Upload and store attachment
     */
    public function __invoke(StoreAttachmentRequest $request): JsonResponse
    {
        $attachments = [];

        foreach ($request->file('files') as $file) {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $path = $file->storeAs('attachments', $filename, 'public');

            // Create attachment record
            $attachment = Attachment::create([
                'attachable_type' => $request->attachable_type,
                'attachable_id' => $request->attachable_id,
                'filename' => $filename,
                'original_filename' => $file->getClientOriginalName(),
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);

            $attachment->load('uploader');
            $attachments[] = new AttachmentResource($attachment);
        }

        return response()->json([
            'attachments' => $attachments,
            'message' => count($attachments) === 1 
                ? 'File uploaded successfully' 
                : count($attachments) . ' files uploaded successfully',
        ], 201);
    }
}