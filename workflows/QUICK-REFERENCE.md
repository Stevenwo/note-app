# ⚡ Quick Workflow Reference Card ⚡

Copy this to every chat if Claude starts making too many tool calls!

## 🎯 Available Workflows (Use These FIRST!)

| Task | Command | Tokens Saved |
|------|---------|--------------|
| App status | `.\workflows\health-check.ps1` | ~8,000 |
| Restart all | `.\workflows\restart-services.ps1` | ~10,000 |
| Search notes | `python workflows\find-notes.py "term"` | ~5,000 |
| Multi-edit | `python workflows\batch-edit.py edits.json` | ~15,000 |
| Get context | Read `SESSION-STATE.md` | ~50,000 |

## 🚨 Emergency Stop Command

If Claude is making too many tool calls:

```
STOP. Read workflows/ENFORCEMENT-CHECKLIST.md and use workflow scripts instead.
```

## 📊 Token Budget

- Total per chat: 190,000 tokens
- Session state read: ~500 tokens
- Health check: ~1,200 tokens  
- Remaining for work: ~188,000 tokens
- Expected chat duration: 30-60 minutes

## ✅ Before EVERY Operation Ask:

1. Is there a workflow for this?
2. Can I batch these operations?
3. Am I reading large data into context?
4. Should I filter/process this data first?

## 🎬 Chat Starter Template

```
Read C:\dev\note-app\SESSION-STATE.md and run health-check.ps1,
then let's work on [TASK]. Use workflow scripts to minimize tokens.
```

## 📁 File Locations

- **Session State**: C:\dev\note-app\SESSION-STATE.md
- **Workflows**: C:\dev\note-app\workflows\
- **Checklist**: C:\dev\note-app\workflows\ENFORCEMENT-CHECKLIST.md
- **This Card**: C:\dev\note-app\workflows\QUICK-REFERENCE.md

---
**🎓 Remember**: One well-crafted script > 10 individual tool calls
