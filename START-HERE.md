# 📋 START EVERY CHAT WITH THIS

## Copy/Paste This Message:

```
Read C:\dev\note-app\SESSION-STATE.md and run health-check.ps1, 
then let's work on [YOUR TASK HERE].

Remember to use token-efficient workflows from the workflows/ directory.
```

## ✅ What This Does:

1. **Loads full context** in ~500 tokens (vs 50,000 from conversation search)
2. **Checks app status** in ~1,200 tokens (vs 8,000 from multiple commands)
3. **Reminds Claude** to use workflows instead of tool calls
4. **Sets expectations** for token efficiency upfront

## 🚨 If Claude Makes Too Many Tool Calls:

```
STOP. Read workflows/QUICK-REFERENCE.md and use workflow scripts instead.
```

## 📊 Expected Results:

- **Before**: Chats last 5-10 minutes
- **After**: Chats last 30-60 minutes
- **Savings**: 10x longer conversations!

## 🎯 Available Workflows:

- `health-check.ps1` - Check app status
- `restart-services.ps1` - Restart all services
- `find-notes.py "search"` - Search notes
- `batch-edit.py edits.json` - Multiple file edits

## 💡 Pro Tips:

1. **Always mention workflows** in your messages
2. **Point to QUICK-REFERENCE.md** if Claude forgets
3. **Create new workflows** for repetitive tasks
4. **Update SESSION-STATE.md** as you make progress

---

**Keep this file open during development!**
