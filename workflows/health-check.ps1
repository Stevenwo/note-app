# Quick health check for note-taking app
# Returns only essential status info to minimize token usage

Write-Host "`nNote App Health Check" -ForegroundColor Cyan
Write-Host ("=" * 60)

function Test-Port {
    param($Port, $ServiceName)
    $result = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "$($ServiceName.PadRight(20)) (port $Port): [OK] Running" -ForegroundColor Green
        return $true
    } else {
        Write-Host "$($ServiceName.PadRight(20)) (port $Port): [X] Not running" -ForegroundColor Red
        return $false
    }
}

function Test-Docker {
    try {
        $containers = docker ps --filter "name=note-app-db" --format "{{.Status}}" 2>$null
        if ($containers) {
            Write-Host "$('PostgreSQL (Docker)'.PadRight(20)): [OK] $containers" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$('PostgreSQL (Docker)'.PadRight(20)): [X] Not running" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "$('PostgreSQL (Docker)'.PadRight(20)): [X] Docker not available" -ForegroundColor Red
        return $false
    }
}

# Check services
$frontend = Test-Port -Port 3000 -ServiceName "Frontend (Next.js)"
$backend = Test-Port -Port 8080 -ServiceName "Backend (Rust/Axum)"
$db = Test-Docker

Write-Host ("=" * 60)

# Overall status
if ($frontend -and $backend -and $db) {
    Write-Host "[OK] All services running" -ForegroundColor Green
    Write-Host "App: http://localhost:3000" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "[X] Some services not running" -ForegroundColor Red
    Write-Host "[!] Run: .\workflows\restart-services.ps1" -ForegroundColor Yellow
    exit 1
}
