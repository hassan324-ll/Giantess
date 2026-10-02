param(
    [string]$CurrentImageDirectory = "bulk-product-images",
    [string]$CsvDirectory = "bulk-product-csvs-by-model-with-images",
    [string]$ExtractedCatalogueDirectory = "catalogue-docx-extracted",
    [string]$OutputDirectory = "bulk-product-cleanup-review",
    [int]$MinimumReplacementDimension = 500,
    [switch]$Apply
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Normalize-ProductName {
    param([string]$Name)
    if (-not $Name) {
        return ""
    }
    ($Name.ToLowerInvariant() -replace "[^a-z0-9]", "")
}

function Get-ImageSize {
    param([string]$Path)
    $image = [System.Drawing.Image]::FromFile($Path)
    try {
        [pscustomobject]@{
            width    = $image.Width
            height   = $image.Height
            max_size = [Math]::Max($image.Width, $image.Height)
        }
    } finally {
        $image.Dispose()
    }
}

[xml]$document = Get-Content -Raw -LiteralPath (Join-Path $ExtractedCatalogueDirectory "word/document.xml")
[xml]$relationships = Get-Content -Raw -LiteralPath (Join-Path $ExtractedCatalogueDirectory "word/_rels/document.xml.rels")
$namespaces = New-Object System.Xml.XmlNamespaceManager($document.NameTable)
$namespaces.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$namespaces.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
$namespaces.AddNamespace("r", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")

$relationshipMap = @{}
foreach ($relationship in $relationships.Relationships.Relationship) {
    $relationshipMap[$relationship.Id] = $relationship.Target
}

$catalogueProducts = foreach ($row in $document.SelectNodes("//w:tbl[2]/w:tr", $namespaces)) {
    $cells = @($row.SelectNodes("./w:tc", $namespaces))
    if ($cells.Count -lt 3) {
        continue
    }

    $imageNode = $cells[0].SelectSingleNode(".//a:blip", $namespaces)
    if (-not $imageNode) {
        continue
    }

    $productName = (($cells[1].SelectNodes(".//w:t", $namespaces) | ForEach-Object InnerText) -join " ").Trim()
    $sku = (($cells[2].SelectNodes(".//w:t", $namespaces) | ForEach-Object InnerText) -join " ").Trim()
    $relationshipId = $imageNode.GetAttribute("embed", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    $mediaTarget = $relationshipMap[$relationshipId]
    $mediaPath = Join-Path $ExtractedCatalogueDirectory ("word/" + $mediaTarget)

    if ($productName -and $mediaTarget -and (Test-Path -LiteralPath $mediaPath)) {
        $size = Get-ImageSize -Path $mediaPath
        [pscustomobject]@{
            normalized_name  = Normalize-ProductName -Name $productName
            catalogue_name   = $productName
            catalogue_sku    = $sku
            catalogue_image  = Split-Path -Leaf $mediaPath
            catalogue_path   = $mediaPath
            catalogue_width  = $size.width
            catalogue_height = $size.height
            catalogue_max    = $size.max_size
        }
    }
}

$catalogueByName = @{}
foreach ($product in $catalogueProducts) {
    if (-not $catalogueByName.ContainsKey($product.normalized_name)) {
        $catalogueByName[$product.normalized_name] = @()
    }
    $catalogueByName[$product.normalized_name] += $product
}

$currentProducts = foreach ($csvFile in (Get-ChildItem -LiteralPath $CsvDirectory -File -Filter "*.csv" | Where-Object Name -ne "_summary.csv")) {
    foreach ($row in (Import-Csv -LiteralPath $csvFile.FullName)) {
        if ($row.image_filename) {
            [pscustomobject]@{
                source_csv     = $csvFile.Name
                name           = $row.name
                sku            = $row.sku
                image_filename = $row.image_filename
                normalized_name = Normalize-ProductName -Name $row.name
            }
        }
    }
}

$results = foreach ($product in ($currentProducts | Group-Object image_filename | ForEach-Object { $_.Group[0] })) {
    $currentPath = Join-Path $CurrentImageDirectory $product.image_filename
    if (-not (Test-Path -LiteralPath $currentPath)) {
        continue
    }

    $matches = @($catalogueByName[$product.normalized_name])
    if (-not $matches) {
        continue
    }

    $catalogueProduct = $matches | Sort-Object catalogue_max -Descending | Select-Object -First 1
    $currentSize = Get-ImageSize -Path $currentPath
    $eligible = $catalogueProduct.catalogue_max -ge $MinimumReplacementDimension -and
        $catalogueProduct.catalogue_max -gt $currentSize.max_size

    if ($Apply -and $eligible) {
        Copy-Item -LiteralPath $catalogueProduct.catalogue_path -Destination $currentPath -Force
    }

    [pscustomobject]@{
        image_filename       = $product.image_filename
        current_width        = $currentSize.width
        current_height       = $currentSize.height
        catalogue_image      = $catalogueProduct.catalogue_image
        catalogue_width      = $catalogueProduct.catalogue_width
        catalogue_height     = $catalogueProduct.catalogue_height
        direct_product_match = $true
        replacement_eligible = $eligible
        replaced             = $Apply -and $eligible
    }
}

$results |
    Sort-Object image_filename |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "catalogue-direct-product-image-matches.csv") -NoTypeInformation -Encoding utf8

$results |
    Where-Object replacement_eligible |
    Sort-Object image_filename |
    Export-Csv -LiteralPath (Join-Path $OutputDirectory "catalogue-sharp-replacements.csv") -NoTypeInformation -Encoding utf8

Write-Host "Catalogue product rows: $($catalogueProducts.Count)"
Write-Host "Direct product-name image matches: $($results.Count)"
Write-Host "Sharp larger replacements: $((@($results | Where-Object replacement_eligible)).Count)"
Write-Host "Applied replacements: $((@($results | Where-Object replaced)).Count)"
