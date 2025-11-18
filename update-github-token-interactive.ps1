# Update GitHub Token - Interactive Version
# This version prompts you to paste the token securely

Write-Host "🔐 GitHub Token Setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Paste your GitHub token and press Enter:" -ForegroundColor Yellow
Write-Host "(The token will not be visible as you type)" -ForegroundColor Gray
Write-Host ""

# Read token securely
$secureToken = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
$Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "❌ No token provided. Exiting." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Updating configs..." -ForegroundColor Cyan
Write-Host ""

# Paths
$desktopConfig = "$env:APPDATA\Claude\claude_desktop_config.json"
$codeConfig = "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"

# Update Claude Desktop config
Write-Host "Updating Claude Desktop..." -ForegroundColor Yellow
if (Test-Path $desktopConfig) {
    $config = Get-Content $desktopConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $desktopConfig
        Write-Host "  ✅ Claude Desktop updated" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GitHub MCP not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Config not found" -ForegroundColor Red
}

# Update Claude Code config
Write-Host "Updating Claude Code..." -ForegroundColor Yellow
if (Test-Path $codeConfig) {
    $config = Get-Content $codeConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $codeConfig
        Write-Host "  ✅ Claude Code updated" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GitHub MCP not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Config not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Token update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart Claude Desktop" -ForegroundColor White
Write-Host "  2. Test: 'Show me my GitHub repositories'" -ForegroundColor White
Write-Host "  3. Launch Claude Code: .\launch-claude-code.ps1" -ForegroundColor White
Write-Host ""
