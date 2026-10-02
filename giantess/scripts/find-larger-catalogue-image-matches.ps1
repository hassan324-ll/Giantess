param(
    [string]$CurrentImageDirectory = "bulk-product-images",
    [string]$CatalogueMediaDirectory = "catalogue-docx-extracted/word/media",
    [string]$OutputDirectory = "bulk-product-cleanup-review"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Get-DifferenceHash {
    param([string]$Path)

    $source = [System.Drawing.Image]::FromFile($Path)
    try {
        $bitmap = New-Object System.Drawing.Bitmap 9, 8
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.DrawImage($source, 0, 0, 9, 8)
            } finally {
                $graphics.Dispose()
            }

            $bits = New-Object System.Text.StringBuilder
            for ($y = 0; $y -lt 8; $y++) {
                for ($x = 0; $x -lt 8; $x++) {
                    $left = $bitmap.GetPixel($x, $y)
                    $right = $bitmap.GetPixel($x + 1, $y)
                    $leftGray = $left.R + $left.G + $left.B
                    $rightGray = $right.R + $right.G + $right.B
                    [void]$bits.Append($(if ($leftGray -gt $rightGray) { "1" } else { "0" }))
                }
            }
            $bits.ToString()
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
            file     = $File.Name
            path     = $File.FullName
            width    = $image.Width
            height   = $image.Height
            max_size = [Math]::Max($image.Width, $image.Height)
            hash     = Get-DifferenceHash -Path $File.FullName
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

$current |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $OutputDirectory "current-image-hashes.json") -Encoding utf8

$catalogue |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $OutputDirectory "catalogue-image-hashes.json") -Encoding utf8

Write-Host "Current image hashes: $($current.Count)"
Write-Host "Catalogue image hashes: $($catalogue.Count)"
