# Verify Claude Code Setup
Write-Host "Verifying Claude Code Setup..." -ForegroundColor Cyan
Write-Host ""

# Check Claude Code
Write-Host "Checking Claude Code..." -ForegroundColor Yellow
$env:CLAUDE_CODE_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe"
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
$claudeVersion = claude --version 2>$null
if ($claudeVersion) {
    Write-Host "  Claude Code: $claudeVersion" -ForegroundColor Green
} else {
    Write-Host "  Claude Code not found" -ForegroundColor Red
}

# Check Git
Write-Host "Checking Git..." -ForegroundColor Yellow
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "  $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  Git not found" -ForegroundColor Red
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  Node.js not found" -ForegroundColor Red
}

# Check Rust
Write-Host "Checking Rust..." -ForegroundColor Yellow
$rustVersion = cargo --version 2>$null
if ($rustVersion) {
    Write-Host "  $rustVersion" -ForegroundColor Green
} else {
    Write-Host "  Rust not found" -ForegroundColor Red
}

# Check Rust Analyzer
Write-Host "Checking Rust Analyzer..." -ForegroundColor Yellow
$raVersion = rust-analyzer --version 2>$null
if ($raVersion) {
    Write-Host "  Rust Analyzer: $raVersion" -ForegroundColor Green
} else {
    Write-Host "  Rust Analyzer not found" -ForegroundColor Red
}

# Check MCP Config
Write-Host "Checking MCP Configuration..." -ForegroundColor Yellow
$mcpConfigPath = "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"
if (Test-Path $mcpConfigPath) {
    Write-Host "  MCP Config found" -ForegroundColor Green
    $mcpConfig = Get-Content $mcpConfigPath | ConvertFrom-Json
    Write-Host "    Configured MCP servers:" -ForegroundColor Cyan
    $mcpConfig.mcpServers.PSObject.Properties | ForEach-Object {
        Write-Host "      - $($_.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "  MCP Config not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Setup verification complete!" -ForegroundColor Cyan
Write-Host "To launch Claude Code, run: launch-claude-code.ps1" -ForegroundColor Green
