# Token-Efficient Workflow Commands

## 🎯 **Core Principle:**
Run code locally, return only summaries. Reduces token usage by 80-95%.

## 📋 **Available Commands:**

### Analyze Rust Backend
```powershell
python workflows\analyze-rust.py backend\src
```
**Returns:** File structure, functions, endpoints, line counts  
**Token Cost:** ~800 tokens (vs 15K+ reading all files)

### Analyze Frontend Components
```powershell
python workflows\analyze-frontend.py frontend\src
```
**Returns:** Component breakdown, hooks, props, features  
**Token Cost:** ~900 tokens (vs 20K+ reading all components)

### Search Code
```powershell
python workflows\search-code.py "create_note" backend
python workflows\search-code.py "useState" frontend
```
**Returns:** Matches with line numbers and context  
**Token Cost:** ~600 tokens per search (vs 10K+ reading files)

### Check Service Health
```powershell
.\workflows\health-check.ps1
```
**Returns:** All service statuses  
**Token Cost:** ~400 tokens (vs 8K checking each service)

### Restart Services
```powershell
.\workflows\restart-services.ps1
```
**Returns:** Restart status  
**Token Cost:** ~500 tokens

### Find Specific Notes
```powershell
python workflows\find-notes.py "aquaponics"
```
**Returns:** Matching notes from database  
**Token Cost:** ~700 tokens

### Batch File Edits
```powershell
python workflows\batch-edit.py
```
**Returns:** Edit results  
**Token Cost:** ~1K tokens (vs 15K+ for multiple manual edits)

## 💡 **How to Use in Chat:**

**Instead of asking:**
> "Read the backend main.rs file and show me all the API endpoints"

**Ask:**
> "Run analyze-rust.py on the backend and show me the endpoint summary"

**Instead of asking:**
> "List all frontend components and tell me which ones use useState"

**Ask:**
> "Run analyze-frontend.py and search for useState usage"

## 📊 **Token Savings:**

| Task | Old Way | New Way | Savings |
|------|---------|---------|---------|
| Analyze backend | 15K | 800 | 95% |
| Analyze frontend | 20K | 900 | 96% |
| Code search | 10K | 600 | 94% |
| Service health | 8K | 400 | 95% |
| Feature work | 25K | 3K | 88% |

## ✅ **Result:**
- Sessions last 3-5x longer
- Get 3-5x more work done per session
- Maintain context continuity
- Desktop Commander stays stable (fewer tool calls)
