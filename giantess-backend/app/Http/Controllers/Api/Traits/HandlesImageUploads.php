<?php

namespace App\Http\Controllers\Api\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesImageUploads
{
    protected function uploadImage(?UploadedFile $image, string $directory = 'uploads'): ?string
    {
        if (! $image) {
            return null;
        }

        $optimizedPath = $this->storeOptimizedImage($image, $directory);
        if ($optimizedPath) {
            return $optimizedPath;
        }

        return $image->store($directory, 'public');
    }

    private function storeOptimizedImage(UploadedFile $image, string $directory): ?string
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            return null;
        }

        if (! str_starts_with((string) $image->getMimeType(), 'image/')) {
            return null;
        }

        if (in_array($image->getMimeType(), ['image/gif', 'image/svg+xml'], true)) {
            return null;
        }

        $contents = file_get_contents($image->getRealPath());
        if ($contents === false) {
            return null;
        }

        $source = @imagecreatefromstring($contents);
        if (! $source) {
            return null;
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $maxDimension = 1400;
        $scale = min(1, $maxDimension / max($sourceWidth, $sourceHeight));
        $targetWidth = max(1, (int) round($sourceWidth * $scale));
        $targetHeight = max(1, (int) round($sourceHeight * $scale));

        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        if (! $target) {
            imagedestroy($source);
            return null;
        }

        imagealphablending($target, true);
        imagesavealpha($target, true);
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);

        ob_start();
        $success = imagewebp($target, null, 82);
        $optimizedContents = ob_get_clean();

        imagedestroy($source);
        imagedestroy($target);

        if (! $success || ! $optimizedContents) {
            return null;
        }

        $path = trim($directory, '/') . '/' . Str::uuid() . '.webp';
        Storage::disk('public')->put($path, $optimizedContents);

        return $path;
    }
}
