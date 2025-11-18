# 🚀 START HERE - Token-Efficient Workflow

**CRITICAL:** This project uses token-efficient MCP workflows. Always follow these patterns to prevent premature session ends.

## ⚡ **Core Rule: Run Code Locally, Return Summaries Only**

Instead of reading files into context (costs 5-20K tokens), run local scripts that return only summaries (costs 400-1.5K tokens).

---

## 📋 **Essential Commands (Use These First!):**

### **Analyze Backend:**
```powershell
cd C:\dev\note-app\backend\src
Get-ChildItem -Filter *.rs -Recurse | Select-Object Name, @{Name='Lines';Expression={(Get-Content $_.FullName).Count}}
Select-String -Path main.rs -Pattern '(?:get|post|put|delete)\(' | Select-Object -ExpandProperty Line
```
**Returns:** File structure + API endpoints (~1.5K tokens vs 8K)

### **Check Services:**
```powershell
.\workflows\health-check.ps1
```
**Returns:** All service statuses (~400 tokens vs 3K)

### **Search Code:**
```powershell
cd backend\src
Select-String -Path *.rs -Pattern "your_search_term" -List
```
**Returns:** Files containing matches (~500 tokens vs 5K)

---

## 📊 **Current Project Status:**

**Read this file for full context:** `SESSION-STATE.md` (~1K tokens)

**Quick Summary:**
- Running: PostgreSQL (Docker:5432), Backend (Rust:8080), Frontend (Next.js:3000)
- Notes: 559 imported, 1,496 images
- Status: Import complete, UI working, ready for new features
- Next: Delete functionality, star notes, search

---

## 🎯 **Token Savings:**

| Task | Old Method | New Method | Savings |
|------|------------|------------|---------|
| Analyze backend | 8K tokens | 1.5K tokens | 81% |
| Check services | 3K tokens | 400 tokens | 87% |
| Code search | 5K tokens | 500 tokens | 90% |

**Result:** Sessions last 3-5x longer, complete 3-5x more work.

---

## ✅ **What to Do:**

1. **Read SESSION-STATE.md** for full context
2. **Use the commands above** instead of reading files directly  
3. **Check workflows/** directory for more token-efficient scripts
4. **When in doubt:** Run analysis scripts, don't read raw files

---

**Documentation:**
- `TOKEN-EFFICIENT-COMMANDS.md` - All available commands
- `workflows/TOKEN-EFFICIENT-MCP.md` - Strategy explanation
- `SIMPLE-WORKFLOW.md` - Best practices

**This approach follows Anthropic's MCP best practices for code execution.**
