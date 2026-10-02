<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Models\EmailVerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationController extends Controller
{
    public function sendVerificationCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = Str::lower($validated['email']);
        $ip = $request->ip();

        $this->throttleSendVerification($email, $ip);

        EmailVerificationCode::where('email', $email)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($email)->send(new VerificationCodeMail($code));

        return response()->json([
            'message' => 'Verification code sent successfully.',
        ]);
    }

    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = Str::lower($validated['email']);

        $verification = EmailVerificationCode::where('email', $email)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $verification || ! Hash::check($validated['code'], $verification->code_hash)) {
            return response()->json([
                'message' => 'The verification code is invalid or expired.',
            ], 422);
        }

        $verification->update(['used_at' => now()]);

        return response()->json([
            'message' => 'Verification code verified successfully.',
        ]);
    }

    protected function throttleSendVerification(string $email, string $ip): void
    {
        $emailKey = 'verification-code-email:' . sha1($email);
        $ipKey = 'verification-code-ip:' . sha1($ip);
        $limit = 5;
        $decay = now()->addMinutes(10);

        foreach ([$emailKey, $ipKey] as $key) {
            $count = Cache::get($key, 0);

            if ($count >= $limit) {
                abort(response()->json([
                    'message' => 'Too many verification requests. Please wait before trying again.',
                ], 429));
            }

            Cache::put($key, $count + 1, $decay);
        }
    }
}
