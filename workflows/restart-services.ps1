# Restart all services for the note-taking app
Write-Host "Starting PostgreSQL..."
Set-Location C:\dev\note-app
docker-compose up -d

Write-Host "Waiting for database..."
Start-Sleep -Seconds 3

Write-Host "Starting backend (Rust)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\dev\note-app\backend; cargo run"

Start-Sleep -Seconds 5

Write-Host "Starting frontend (Next.js)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\dev\note-app\frontend; npm run dev"

Write-Host "All services started!"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:8080"
