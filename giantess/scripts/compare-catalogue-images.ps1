param(
    [string]$CurrentImageDirectory = "bulk-product-images",
    [string]$CatalogueMediaDirectory = "catalogue-docx-extracted/word/media",
    [string]$OutputDirectory = "bulk-product-cleanup-review"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Get-ImageFingerprint {
    param([string]$Path)

    $source = [System.Drawing.Image]::FromFile($Path)
    try {
        $bitmap = New-Object System.Drawing.Bitmap 16, 16
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.DrawImage($source, 0, 0, 16, 16)
            } finally {
                $graphics.Dispose()
            }

            $bytes = New-Object byte[] 256
            for ($y = 0; $y -lt 16; $y++) {
                for ($x = 0; $x -lt 16; $x++) {
                    $pixel = $bitmap.GetPixel($x, $y)
                    $bytes[($y * 16) + $x] = [byte](($pixel.R + $pixel.G + $pixel.B) / 3)
                }
            }

            [Convert]::ToBase64String($bytes)
        } finally {
            $bitmap.Dispose()
        }
    } finally {
        $source.Dispose()
    }
}

function Get-ImageInfo {
    param([System.IO.FileInfo]$File)

    $image = [System.Drawing.Image]::FromFile($File.FullName)
    try {
        [pscustomobject]@{
            file        = $File.Name
            path        = $File.FullName
            width       = $image.Width
            height      = $image.Height
            max_size    = [Math]::Max($image.Width, $image.Height)
            bytes       = $File.Length
            fingerprint = Get-ImageFingerprint -Path $File.FullName
        }
    } finally {
        $image.Dispose()
    }
}

$current = Get-ChildItem -LiteralPath $CurrentImageDirectory -File -Filter "*.png" |
    Sort-Object Name |
    ForEach-Object { Get-ImageInfo -File $_ }

$catalogue = Get-ChildItem -LiteralPath $CatalogueMediaDirectory -File |
    Sort-Object Name |
    ForEach-Object { Get-ImageInfo -File $_ }

$catalogueByFingerprint = @{}
foreach ($image in $catalogue) {
    if (-not $catalogueByFingerprint.ContainsKey($image.fingerprint)) {
        $catalogueByFingerprint[$image.fingerprint] = @()
    }
    $catalogueByFingerprint[$image.fingerprint] += $image
}

$matches = foreach ($image in $current) {
    $candidates = @($catalogueByFingerprint[$image.fingerprint])
    $best = $candidates | Sort-Object max_size, bytes -Descending | Select-Object -First 1
    if ($best) {
        [pscustomobject]@{
            current_file          = $image.file
            current_width         = $image.width
            current_height        = $image.height
            catalogue_file        = $best.file
            catalogue_width       = $best.width
            catalogue_height      = $best.height
            replacement_available = $best.max_size -gt $image.max_size
        }
    }
}

$matches |
    Sort-Object current_file |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "catalogue-image-matches.csv") -NoTypeInformation -Encoding utf8

$matches |
    Where-Object replacement_available |
    Sort-Object current_file |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "catalogue-larger-replacements.csv") -NoTypeInformation -Encoding utf8

Write-Host "Current images: $($current.Count)"
Write-Host "Catalogue media: $($catalogue.Count)"
Write-Host "Exact normalized matches: $($matches.Count)"
Write-Host "Larger catalogue replacements: $((@($matches | Where-Object replacement_available)).Count)"
