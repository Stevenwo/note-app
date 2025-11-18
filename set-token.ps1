# Update GitHub Token - Simple Version
param([string]$Token)

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "GitHub Token Setup" -ForegroundColor Cyan
    Write-Host ""
    $Token = Read-Host "Paste your GitHub token"
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "No token provided. Exiting." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Updating configs..." -ForegroundColor Cyan

$desktopConfig = "$env:APPDATA\Claude\claude_desktop_config.json"
$codeConfig = "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"

# Update Claude Desktop
if (Test-Path $desktopConfig) {
    $config = Get-Content $desktopConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $desktopConfig
        Write-Host "Claude Desktop updated" -ForegroundColor Green
    }
}

# Update Claude Code
if (Test-Path $codeConfig) {
    $config = Get-Content $codeConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $codeConfig
        Write-Host "Claude Code updated" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Restart Claude Desktop and Claude Code." -ForegroundColor Green
