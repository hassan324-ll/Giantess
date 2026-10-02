param(
    [string]$CsvDirectory = "bulk-product-csvs-by-model-with-images",
    [string]$ImageDirectory = "bulk-product-images",
    [string]$OutputDirectory = "bulk-product-cleanup-review"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$csvFiles = Get-ChildItem -LiteralPath $CsvDirectory -File -Filter "*.csv" |
    Where-Object Name -ne "_summary.csv" |
    Sort-Object Name

$products = foreach ($csvFile in $csvFiles) {
    foreach ($row in (Import-Csv -LiteralPath $csvFile.FullName)) {
        [pscustomobject]@{
            source_csv     = $csvFile.Name
            name           = $row.name
            description    = $row.description
            price          = $row.price
            part_number    = $row.part_number
            device_model   = $row.device_model
            sku            = $row.sku
            stock_count    = $row.stock_count
            image_filename = $row.image_filename
        }
    }
}

$imageAudit = foreach ($file in (Get-ChildItem -LiteralPath $ImageDirectory -File -Filter "*.png" | Sort-Object Name)) {
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        $maxDimension = [Math]::Max($image.Width, $image.Height)
        [pscustomobject]@{
            image_filename = $file.Name
            width          = $image.Width
            height         = $image.Height
            bytes          = $file.Length
            sha256         = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
            quality_flag   = if ($maxDimension -lt 150) {
                "critical: source image under 150px"
            } elseif ($maxDimension -lt 500) {
                "review: source image under 500px"
            } else {
                ""
            }
        }
    } finally {
        $image.Dispose()
    }
}

$imageAudit |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "image-quality-audit.csv") -NoTypeInformation -Encoding utf8

$imageAudit |
    Group-Object sha256 |
    Where-Object Count -gt 1 |
    ForEach-Object {
        [pscustomobject]@{
            sha256          = $_.Name
            duplicate_count = $_.Count
            image_files     = ($_.Group.image_filename -join " | ")
        }
    } |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "identical-image-files.csv") -NoTypeInformation -Encoding utf8

$productGroups = $products | Group-Object sku

$masterProducts = foreach ($group in $productGroups) {
    $rows = @($group.Group)
    $preferred = @($rows | Where-Object image_filename)[0]
    if (-not $preferred) {
        $preferred = $rows[0]
    }

    $names = @($rows.name | Where-Object { $_ } | Sort-Object -Unique)
    $descriptions = @($rows.description | Where-Object { $_ } | Sort-Object -Unique)
    $models = @($rows.device_model | Where-Object { $_ } | Sort-Object -Unique)
    $images = @($rows.image_filename | Where-Object { $_ } | Sort-Object -Unique)
    $sources = @($rows.source_csv | Sort-Object -Unique)
    $issues = @()

    if ($names.Count -gt 1) {
        $issues += "conflicting names: manual source review required"
    }
    if ($descriptions.Count -gt 1) {
        $issues += "conflicting descriptions: manual source review required"
    }
    if ($images.Count -eq 0) {
        $issues += "missing image"
    }

    [pscustomobject]@{
        name                     = $preferred.name
        description              = $preferred.description
        price                    = $preferred.price
        part_number              = $preferred.part_number
        device_model             = $preferred.device_model
        sku                      = $preferred.sku
        stock_count              = $preferred.stock_count
        image_filename           = $preferred.image_filename
        compatible_device_models = ($models -join " | ")
        source_csvs               = ($sources -join " | ")
        source_row_count          = $rows.Count
        review_required           = ($issues -join " | ")
    }
}

$masterProducts |
    Sort-Object sku |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "master-products-review.csv") -NoTypeInformation -Encoding utf8

$masterProducts |
    Where-Object review_required |
    Sort-Object sku |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "products-requiring-review.csv") -NoTypeInformation -Encoding utf8

$masterProducts |
    Where-Object { -not $_.review_required } |
    Sort-Object sku |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "master-products-unambiguous.csv") -NoTypeInformation -Encoding utf8

$products |
    Group-Object source_csv, name, description, price, part_number, device_model, sku, stock_count, image_filename |
    Where-Object Count -gt 1 |
    ForEach-Object {
        [pscustomobject]@{
            duplicate_count = $_.Count
            duplicate_row   = $_.Name
        }
    } |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "exact-duplicate-product-rows.csv") -NoTypeInformation -Encoding utf8

$summary = @(
    "Product cleanup review"
    "======================"
    "Source CSV files: $($csvFiles.Count)"
    "Source product rows: $($products.Count)"
    "Consolidated SKU rows: $($masterProducts.Count)"
    "Rows requiring manual review: $((@($masterProducts | Where-Object review_required)).Count)"
    "Unambiguous consolidated rows: $((@($masterProducts | Where-Object { -not $_.review_required })).Count)"
    "Image files: $($imageAudit.Count)"
    "Images under 150px: $((@($imageAudit | Where-Object quality_flag -like 'critical*')).Count)"
    "Images under 500px: $((@($imageAudit | Where-Object quality_flag)).Count)"
    "Identical image groups: $((@($imageAudit | Group-Object sha256 | Where-Object Count -gt 1)).Count)"
    ""
    "Do not import master-products-review.csv until rows in products-requiring-review.csv"
    "have been checked against the original catalog PDFs. Low-resolution source images"
    "cannot be repaired by resizing; replace them from the original catalog or supplier files."
)

$summary | Set-Content -LiteralPath (Join-Path $OutputDirectory "README.txt") -Encoding utf8

Write-Host "Created cleanup review package at $OutputDirectory"
