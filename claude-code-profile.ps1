# Add this to your PowerShell profile to launch Claude Code from anywhere

function Start-ClaudeCode {
    $env:CLAUDE_CODE_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe"
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
    claude
}

Set-Alias ccode Start-ClaudeCode

Write-Host "Claude Code alias 'ccode' loaded. Type 'ccode' to launch." -ForegroundColor Green
