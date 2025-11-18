# Analyze Rust codebase - PowerShell version

param([string]$Path = "backend\src")

Write-Host "`n📊 RUST CODEBASE ANALYSIS" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Gray

$rustFiles = Get-ChildItem -Path $Path -Filter "*.rs" -Recurse -ErrorAction SilentlyContinue

if (-not $rustFiles) {
    Write-Host "No Rust files found in $Path" -ForegroundColor Red
    exit
}

$totalLines = 0
$totalFunctions = 0  
$totalStructs = 0
$allEndpoints = @()
$fileDetails = @()

foreach ($file in $rustFiles) {
    $content = Get-Content $file.FullName -Raw
    $lines = ($content -split "`n").Count
    
    # Extract functions
    $functions = [regex]::Matches($content, 'fn\s+(\w+)') | ForEach-Object { $_.Groups[1].Value }
    
    # Extract structs
    $structs = [regex]::Matches($content, 'struct\s+(\w+)') | ForEach-Object { $_.Groups[1].Value }
    
    # Extract API endpoints - use simpler pattern
    $getEndpoints = [regex]::Matches($content, '#``[get\("([^"]+)"\)``]') | ForEach-Object { $_.Groups[1].Value }
    $postEndpoints = [regex]::Matches($content, '#``[post\("([^"]+)"\)``]') | ForEach-Object { $_.Groups[1].Value }
    $putEndpoints = [regex]::Matches($content, '#``[put\("([^"]+)"\)``]') | ForEach-Object { $_.Groups[1].Value }
    $deleteEndpoints = [regex]::Matches($content, '#``[delete\("([^"]+)"\)``]') | ForEach-Object { $_.Groups[1].Value }
    
    $endpoints = $getEndpoints + $postEndpoints + $putEndpoints + $deleteEndpoints
    
    $totalLines += $lines
    $totalFunctions += $functions.Count
    $totalStructs += $structs.Count
    $allEndpoints += $endpoints
    
    $fileDetails += [PSCustomObject]@{
        File = $file.Name
        Lines = $lines
        Functions = $functions.Count
        Structs = $structs.Count
        Endpoints = $endpoints
    }
}

Write-Host "`nFiles analyzed: $($rustFiles.Count)" -ForegroundColor Green
Write-Host "Total lines: $totalLines" -ForegroundColor Green
Write-Host "Total functions: $totalFunctions" -ForegroundColor Green
Write-Host "Total structs: $totalStructs" -ForegroundColor Green  
Write-Host "API endpoints: $($allEndpoints.Count)" -ForegroundColor Green

if ($allEndpoints.Count -gt 0) {
    Write-Host "`n🌐 API ENDPOINTS:" -ForegroundColor Cyan
    $allEndpoints | Sort-Object | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Yellow
    }
}

Write-Host "`n📁 FILE BREAKDOWN:" -ForegroundColor Cyan
$fileDetails | Sort-Object -Property Lines -Descending | ForEach-Object {
    Write-Host "`n  $($_.File) ($($_.Lines) lines)" -ForegroundColor White
    Write-Host "    Functions: $($_.Functions) | Structs: $($_.Structs)" -ForegroundColor Gray
    if ($_.Endpoints.Count -gt 0) {
        Write-Host "    Endpoints: $($_.Endpoints.Count) found" -ForegroundColor Green
    }
}
