# Note-App Session Starter Prompt

Paste this at the start of new conversations:

---

**Working on note-app at C:\dev\note-app**

Before doing anything:
1. Read `C:\dev\note-app\SESSION-STATE.md` for current context
2. Run `C:\dev\note-app\workflows\health-check.ps1` to check service status
3. Use `C:\dev\note-app\workflows\batch-edit.py` for multi-file changes

**Token-efficient rules:**
- One script > many tool calls
- Filter/preview data before reading large files
- Batch operations when possible
- Write code to files, don't output in chat

**Current issue:** [describe what you're working on]

---

## Quick Copy Version:

```
Working on note-app. Read SESSION-STATE.md first, run health-check.ps1, use batch-edit.py for changes. Current issue: [your issue here]
```
