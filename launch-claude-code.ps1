# Launch Claude Code with Explicit MCP Config Path

# Set Git Bash path
$env:CLAUDE_CODE_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe"

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host "Launching Claude Code with MCP Servers..." -ForegroundColor Cyan
Write-Host "Config: $env:APPDATA\Anthropic\Claude Code\mcp_config.json" -ForegroundColor Gray
Write-Host ""

# Launch with explicit config path
$configPath = "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"
claude --mcp-config "$configPath"
