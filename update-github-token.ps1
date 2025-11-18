# Update GitHub Token in Both MCP Configs
# This script updates the token in both Claude Desktop and Claude Code

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🔐 Updating GitHub Personal Access Token..." -ForegroundColor Cyan
Write-Host ""

# Validate token format
if (-not $Token.StartsWith("ghp_") -and -not $Token.StartsWith("github_pat_")) {
    Write-Host "⚠️  Warning: Token doesn't start with 'ghp_' or 'github_pat_'" -ForegroundColor Yellow
    Write-Host "   Expected format: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

# Paths
$desktopConfig = "$env:APPDATA\Claude\claude_desktop_config.json"
$codeConfig = "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"

# Update Claude Desktop config
Write-Host "Updating Claude Desktop config..." -ForegroundColor Yellow
if (Test-Path $desktopConfig) {
    $config = Get-Content $desktopConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $desktopConfig
        Write-Host "  ✅ Claude Desktop config updated" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GitHub MCP not found in config" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Claude Desktop config not found" -ForegroundColor Red
}

# Update Claude Code config
Write-Host "Updating Claude Code config..." -ForegroundColor Yellow
if (Test-Path $codeConfig) {
    $config = Get-Content $codeConfig | ConvertFrom-Json
    if ($config.mcpServers.github) {
        $config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $Token
        $config | ConvertTo-Json -Depth 10 | Set-Content $codeConfig
        Write-Host "  ✅ Claude Code config updated" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GitHub MCP not found in config" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Claude Code config not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Token update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart Claude Desktop (close and reopen)" -ForegroundColor White
Write-Host "  2. Test: 'Show me my GitHub repositories'" -ForegroundColor White
Write-Host "  3. Launch Claude Code: .\launch-claude-code.ps1" -ForegroundColor White
Write-Host "  4. Test: 'List my recent commits'" -ForegroundColor White
Write-Host ""
