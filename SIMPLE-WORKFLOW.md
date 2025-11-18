# Working with Claude Desktop - Best Practices

## 📋 **At Start of Each Session:**
1. Ask: "Read SESSION-STATE.md and tell me where we left off"
2. This gives context without using many tokens

## 🎯 **During Development:**
- Work normally - no special token-saving needed
- If you notice slow responses, mention it
- I'll suggest optimizations if needed

## ⚠️ **If Desktop Commander Crashes:**
1. Note what we were working on
2. Switch to Claude Code: `cd C:\dev\note-app && claude`
3. Tell Claude Code: "Read SESSION-STATE.md and continue [task]"

## 🔄 **When Switching Tasks:**
Update SESSION-STATE.md with:
- What's done
- What's next
- Any issues

Keep it brief - just the essentials.

## ✅ **That's It!**
No complex workflows. No token counting. Just build.
