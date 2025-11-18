# Automated Test Runner for Note App
# This script checks prerequisites and runs the comprehensive test

Write-Host "Note App Testing Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if ($currentDir.Path -notlike "*note-app*") {
    Write-Host "WARNING: Not in note-app directory" -ForegroundColor Yellow
    Write-Host "Changing to C:\dev\note-app..." -ForegroundColor Yellow
    Set-Location C:\dev\note-app
}

# Step 1: Check services
Write-Host "Step 1: Checking services..." -ForegroundColor Yellow
& .\workflows\health-check.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Some services are not running. Starting services..." -ForegroundColor Yellow
    & .\workflows\restart-services.ps1
    Start-Sleep -Seconds 8
    
    # Verify services started successfully
    Write-Host "Verifying all services are now running..." -ForegroundColor Yellow
    & .\workflows\health-check.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Services failed to start properly" -ForegroundColor Red
        Write-Host "Please manually run: .\workflows\restart-services.ps1" -ForegroundColor Red
        Write-Host "Then verify with: .\workflows\health-check.ps1" -ForegroundColor Red
        exit 1
    }
}

# Additional API health check
Write-Host ""
Write-Host "Verifying API is responding..." -ForegroundColor Yellow
try {
    $apiHealth = Invoke-RestMethod -Uri 'http://localhost:8080/api/health' -Method GET -ErrorAction Stop
    Write-Host "Backend API is healthy" -ForegroundColor Green
    
    $notes = Invoke-RestMethod -Uri 'http://localhost:8080/api/notes?limit=1' -Method GET -ErrorAction Stop
    Write-Host "Notes API is responding (found notes in database)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: API is not responding properly" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Try restarting services manually:" -ForegroundColor Yellow
    Write-Host "  .\workflows\restart-services.ps1" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking for Playwright..." -ForegroundColor Yellow

# Check if playwright is installed
$playwrightCheck = npm list playwright 2>&1
if ($playwrightCheck -like "*empty*" -or $playwrightCheck -like "*ERR*") {
    Write-Host "Playwright not found. Installing..." -ForegroundColor Yellow
    npm install playwright
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Playwright" -ForegroundColor Red
        Write-Host "Please install manually: npm install playwright" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Playwright installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Playwright is already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Running comprehensive tests..." -ForegroundColor Yellow
Write-Host "Browser will open automatically. Tests will run for ~60 seconds." -ForegroundColor Cyan
Write-Host ""

# Run the test
node comprehensive-test.js

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Results saved to: C:\dev\note-app\test-results.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view results:" -ForegroundColor Yellow
Write-Host "  Get-Content test-results.json | ConvertFrom-Json | ConvertTo-Json -Depth 10" -ForegroundColor White
Write-Host ""
