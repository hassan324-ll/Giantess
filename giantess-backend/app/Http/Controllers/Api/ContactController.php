<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:50',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:5000',
            'privacyAccepted' => 'accepted',
        ]);

        $adminEmail = config('contact.admin_email');

        if (! $adminEmail) {
            Log::error('Contact form admin recipient is not configured.');

            return response()->json([
                'success' => false,
                'message' => 'We could not send your message right now. Please try again later.',
            ], 500);
        }

        try {
            Mail::to($adminEmail)->send(new ContactFormSubmitted($validated));
        } catch (Throwable $exception) {
            Log::error('Contact form email failed to send.', [
                'email' => $validated['email'],
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'We could not send your message right now. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully.',
        ]);
    }
}
