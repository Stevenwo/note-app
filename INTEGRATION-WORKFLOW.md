  # Integration Workflow: Claude Desktop ↔ Claude Code

## 🎯 The Problem
Claude Desktop and Claude Code are separate conversations with no shared memory. 
You need a way to transfer context between them efficiently.

## ✅ The Solution: File-Based Handoffs

### Method 1: Quick Handoff (Best for Simple Tasks)

**In Claude Desktop:**
1. Create a handoff note at the end of your session:
```powershell
# I'll create: C:\dev\note-app\NEXT-SESSION.md
```

2. Include:
   - What was decided
   - What needs to be implemented
   - Which files to modify
   - Any code snippets

**In Claude Code:**
1. Start by saying: "Read NEXT-SESSION.md and continue that work"
2. Claude Code will read it and pick up where you left off

---

### Method 2: SESSION-STATE.md (Best for Ongoing Work)

**In Claude Desktop:**
Update SESSION-STATE.md with:
```markdown
## Current Work (2025-11-16)
- Designing: [feature name]
- Decisions: [list]
- Next: [implementation tasks]
```

**In Claude Code:**
1. "Read SESSION-STATE.md"
2. "Continue working on [feature name]"

---

### Method 3: Task Files (Best for Complex Features)

**Structure:**
```
C:\dev\note-app\tasks\
├── feature-delete-notes.md
├── feature-star-notes.md
└── feature-web-clipper.md
```

**In Claude Desktop:**
Create task file with full design specs

**In Claude Code:**
"Read tasks/feature-delete-notes.md and implement it"

---

## 💡 Pro Tips

### Tip 1: Always Start with Context
**Bad:** "Add a delete button"
**Good:** "Read NEXT-SESSION.md, then add a delete button"

### Tip 2: Update SESSION-STATE
Both environments should update SESSION-STATE.md so the other knows what's done.

### Tip 3: Use Explicit Handoffs
End Claude Desktop sessions by creating a handoff file:
- What was discussed
- What's ready to implement
- Where to start

### Tip 4: Screenshots as Files
Claude Desktop can save screenshots:
- Save them with descriptive names
- Reference them in handoff files
- Claude Code can read image files

---

## 📝 Example Workflow

### Scenario: Adding "Delete Note" Feature

**Session 1: Design in Claude Desktop**
```
You: Let's design a delete note feature
Claude Desktop: [discusses UI/UX, creates mockups]
You: Great! Now prepare this for implementation
Claude Desktop: [creates HANDOFF-DELETE-FEATURE.md]
```

**Session 2: Implement in Claude Code**
```powershell
.\launch-claude-code.ps1
```
```
You: Read HANDOFF-DELETE-FEATURE.md and implement it
Claude Code: [reads file, implements backend + frontend]
```

**Session 3: Review in Claude Desktop**
```
You: Test the delete feature with Playwright
Claude Desktop: [tests UI, suggests improvements]
```

---

## 🔄 The Complete Cycle

1. **Design** (Claude Desktop) → Create handoff file
2. **Implement** (Claude Code) → Read handoff, code it
3. **Test** (Claude Desktop) → Use Playwright to test
4. **Polish** (Claude Code) → Fix issues, refine code
5. **Document** (Either) → Update SESSION-STATE.md

---

## 📋 Handoff Checklist

Before switching environments, create a file with:
- [ ] What was decided/designed
- [ ] What needs to be implemented
- [ ] Which files to modify
- [ ] Any code snippets or examples
- [ ] Testing requirements
- [ ] Success criteria

---

## 🎯 Quick Commands

### In Claude Desktop (when done designing):
```
Create a handoff file for Claude Code with:
- Feature: [name]
- Design decisions: [list]
- Files to modify: [list]
- Implementation steps: [list]
```

### In Claude Code (when starting):
```
Read [handoff-file].md and implement it
```

---

## 🚀 Automation Idea

You could create a script that:
1. Prompts you for key details
2. Generates a handoff file
3. Opens Claude Code automatically

Would you like me to create this?
