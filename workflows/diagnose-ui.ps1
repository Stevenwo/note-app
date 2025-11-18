# UI Diagnostic & Fix Workflow
# Checks frontend build, backend API, and provides actionable fixes

Write-Host "`n=== UI Diagnostic Report ===" -ForegroundColor Cyan

# 1. Check if .next build directory exists
Write-Host "`n1. Frontend Build Status:" -ForegroundColor Yellow
$nextDir = "C:\dev\note-app\frontend\.next"
if (Test-Path $nextDir) {
    $buildTime = (Get-Item $nextDir).LastWriteTime
    Write-Host "   [OK] Build exists (Last built: $buildTime)" -ForegroundColor Green
} else {
    Write-Host "   [X] No build found - needs rebuild" -ForegroundColor Red
}

# 2. Test Backend API
Write-Host "`n2. Backend API Test:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/notes?user_id=1" -TimeoutSec 3
    $count = $response.Count
    Write-Host "   [OK] API responding - $count notes found" -ForegroundColor Green
} catch {
    Write-Host "   [X] API not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Search for Aquaponics notes specifically
Write-Host "`n3. Aquaponics Notes Check:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/notes?user_id=1"
    $aquaNotes = $response | Where-Object { $_.title -like "*aqua*" -or $_.title -like "*fish*" -or $_.content -like "*aquaponics*" }
    if ($aquaNotes) {
        Write-Host "   [OK] Found $($aquaNotes.Count) aquaponics-related notes" -ForegroundColor Green
        $aquaNotes | ForEach-Object { Write-Host "      - $($_.title)" -ForegroundColor Gray }
    } else {
        Write-Host "   [!] No aquaponics notes found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [X] Could not check notes" -ForegroundColor Red
}

# 4. Recommendation
Write-Host "`n=== Recommended Actions ===" -ForegroundColor Cyan
if (-not (Test-Path $nextDir)) {
    Write-Host "1. Rebuild frontend: cd frontend && npm run build" -ForegroundColor Yellow
    Write-Host "2. Restart dev server: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "Frontend build exists - check if dev server needs restart" -ForegroundColor Yellow
}

Write-Host "`n=== End Report ===`n" -ForegroundColor Cyan
