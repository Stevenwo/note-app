# GitHub Personal Access Token Setup

## 🔐 Current Status
❌ GitHub token NOT configured in either:
- Claude Desktop: `YOUR_TOKEN_HERE` (placeholder)
- Claude Code: `YOUR_TOKEN_HERE` (placeholder)

You need to create and configure a token for both environments.

---

## 📝 Step 1: Create GitHub Personal Access Token

### Go to GitHub
1. Visit: https://github.com/settings/tokens
2. Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

### Generate New Token
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. **Note**: Give it a descriptive name like "Claude MCP Access"
3. **Expiration**: Choose 90 days or No expiration (your preference)

### Required Permissions (Scopes)
Select these scopes:
- ✅ `repo` (Full control of private repositories)
  - `repo:status`
  - `repo_deployment`
  - `public_repo`
  - `repo:invite`
- ✅ `workflow` (Update GitHub Action workflows)
- ✅ `read:org` (Read org and team membership)
- ✅ `read:user` (Read user profile data)
- ✅ `user:email` (Access user email addresses)

### Generate Token
1. Scroll down and click **"Generate token"**
2. **COPY THE TOKEN IMMEDIATELY** - You won't see it again!
3. Save it somewhere secure temporarily

---

## 🔧 Step 2: Configure Token

I'll update both config files for you. **Paste your token when ready.**

### For Now: Manual Setup Instructions

**Update Claude Desktop Config:**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

Find the github section and replace `YOUR_TOKEN_HERE`:
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YourActualTokenHere"
  }
}
```

**Update Claude Code Config:**
```powershell
notepad "$env:APPDATA\Anthropic\Claude Code\mcp_config.json"
```

Find the github section and replace `YOUR_TOKEN_HERE`:
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YourActualTokenHere"
  }
}
```

---

## ✅ Step 3: Restart and Test

### Restart Claude Desktop
1. Completely close Claude Desktop
2. Reopen it
3. Try: "Show me my GitHub repositories"

### Restart Claude Code
1. Exit if running
2. Launch: `.\launch-claude-code.ps1`
3. Try: "List my recent GitHub commits"

---

## 🔒 Security Notes

### Token Security
- ✅ Never commit tokens to git
- ✅ Never share tokens publicly
- ✅ These config files are in your local AppData (safe)
- ✅ Tokens are used locally by MCP servers only

### Token Permissions
The scopes I recommended allow:
- ✅ Read/write repositories
- ✅ Create branches and PRs
- ✅ Read organization info
- ⛔ No admin access
- ⛔ No delete capabilities

### Revoke If Needed
Go to https://github.com/settings/tokens and revoke the token anytime.

---

## 🎯 Alternative: Use Git Credential Manager

If you already use Git on Windows, it might have stored credentials:

```powershell
# Check if Git credentials are stored
git config --global credential.helper
```

If yes, GitHub MCP can use those credentials automatically.

---

## ❓ Need Help?

**After you create the token**, tell me:
- "I have my token, can you update the configs for me?"

I'll update both files securely (the token stays in your local files only).

---

## 📋 Quick Checklist

- [ ] Go to https://github.com/settings/tokens
- [ ] Generate new token (classic)
- [ ] Select required scopes (repo, workflow, read:org, read:user, user:email)
- [ ] Copy token immediately
- [ ] Update Claude Desktop config
- [ ] Update Claude Code config  
- [ ] Restart both applications
- [ ] Test with "Show my GitHub repos"
