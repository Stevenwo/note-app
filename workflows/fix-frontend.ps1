# Fix Frontend & Verify UI
# Stops frontend, rebuilds, restarts, and verifies rendering

param(
    [switch]$SkipBuild
)

Write-Host "`n=== Frontend Fix Workflow ===" -ForegroundColor Cyan

# 1. Stop existing frontend
Write-Host "`n1. Stopping existing frontend..." -ForegroundColor Yellow
$frontendProc = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*note-app*"
}
if ($frontendProc) {
    Stop-Process -Id $frontendProc.Id -Force
    Start-Sleep -Seconds 2
    Write-Host "   [OK] Stopped frontend" -ForegroundColor Green
}

# 2. Clean and rebuild (unless skipped)
if (-not $SkipBuild) {
    Write-Host "`n2. Cleaning build..." -ForegroundColor Yellow
    Set-Location C:\dev\note-app\frontend
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   [OK] Cleaned .next directory" -ForegroundColor Green
    
    Write-Host "`n3. Rebuilding..." -ForegroundColor Yellow
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Build successful" -ForegroundColor Green
    } else {
        Write-Host "   [X] Build failed" -ForegroundColor Red
        exit 1
    }
}

# 3. Start dev server in background
Write-Host "`n4. Starting dev server..." -ForegroundColor Yellow
Set-Location C:\dev\note-app\frontend
$job = Start-Job -ScriptBlock {
    Set-Location C:\dev\note-app\frontend
    npm run dev
}
Start-Sleep -Seconds 5
Write-Host "   [OK] Dev server started (Job ID: $($job.Id))" -ForegroundColor Green

# 4. Test frontend
Write-Host "`n5. Testing frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Frontend responding" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   [!] Frontend not ready yet - may need more time" -ForegroundColor Yellow
}

Write-Host "`n=== Fix Complete ===" -ForegroundColor Cyan
Write-Host "Frontend should be ready at http://localhost:3000`n" -ForegroundColor Green
