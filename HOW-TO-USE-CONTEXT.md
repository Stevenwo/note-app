# How to Use PROJECT-CONTEXT.json with AI Assistants

## For Claude Code

1. **Start Claude Code in the project directory:**
   ```bash
   cd C:\dev\note-app
   claude-code
   ```

2. **Paste this prompt:**
   ```
   Read PROJECT-CONTEXT.json for complete project context. Debug star and delete button functionality using Playwright MCP to test UI and Desktop Commander MCP to check backend. Follow the troubleshooting_methodology in the JSON.
   ```

3. **Claude Code will:**
   - Read the JSON context
   - Run health-check.ps1
   - Test backend endpoints
   - Use Playwright to debug frontend
   - Fix the issues

## For Gemini CLI

1. **Navigate to project:**
   ```bash
   cd C:\dev\note-app
   ```

2. **Run with context:**
   ```bash
   gemini "$(cat PROJECT-CONTEXT.json)" "Debug the star and delete button functionality. Use Playwright to test the UI and check what API calls are being made."
   ```

## Quick Copy Prompts

### For debugging star/delete buttons:
```
Load PROJECT-CONTEXT.json. The star and delete buttons aren't working. Use Playwright to navigate to localhost:3000, click the buttons, and check network requests. Then test backend endpoints directly with PowerShell. Fix the frontend-backend communication issue.
```

### For adding new features:
```
Load PROJECT-CONTEXT.json. I need to add [feature name]. Follow the token_efficient_workflows and write code directly to files. Test with Playwright when done.
```

### For investigating issues:
```
Load PROJECT-CONTEXT.json. Follow the layered_testing_approach to debug [issue description]. Start with database layer, then backend API, then frontend.
```

## Token-Efficient Usage

**Always specify:**
- Use health-check.ps1 first
- Write code to files (don't output in chat)
- Use batch operations
- Test one layer at a time (database → backend → frontend)

**Example efficient prompt:**
```
Read PROJECT-CONTEXT.json. Run health-check.ps1, test backend star endpoint with Invoke-RestMethod, use Playwright to click star button and show network requests. Write fixes to files.
```

## MCP Tools Configuration

Both assistants should have access to:
- **Desktop Commander MCP** - File ops, process management
- **Playwright MCP** - Browser testing and debugging

The JSON specifies exactly how to use each tool for this project.
