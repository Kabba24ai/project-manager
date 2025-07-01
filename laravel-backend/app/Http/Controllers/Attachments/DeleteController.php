<?php

namespace App\Http\Controllers\Attachments;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Http\JsonResponse;

class DeleteController extends Controller
{
    /**
     * Delete an attachment
     */
    public function __invoke(Attachment $attachment): JsonResponse
    {
        $this->authorize('delete', $attachment);

        $attachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully',
        ]);
    }
}