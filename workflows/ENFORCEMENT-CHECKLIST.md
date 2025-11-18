# Claude Workflow Enforcement Checklist

## Before Making ANY Tool Call, Ask:

### 1. Can This Be Batched?
- [ ] Am I about to make multiple similar tool calls?
- [ ] Could these be combined into one script?
- [ ] Is there an existing workflow script for this?

**If YES → Create/use a workflow script instead**

### 2. Am I Reading Large Data Into Context?
- [ ] Am I reading a file over 100 lines?
- [ ] Am I dumping database results without filtering?
- [ ] Am I returning full output instead of a summary?

**If YES → Filter/process in script, return summary only**

### 3. Is There a Workflow Script For This?
- [ ] health-check.ps1 - For app status checks
- [ ] restart-services.ps1 - For restarting services
- [ ] find-notes.py - For searching notes
- [ ] batch-edit.py - For multiple file edits

**If YES → Use the workflow script**

### 4. Should I Create a New Workflow?
- [ ] Will this operation be repeated?
- [ ] Does it involve 3+ tool calls?
- [ ] Could it save 5,000+ tokens?

**If YES → Create new workflow script first**

## Token Usage Guidelines:

### GOOD (Token Efficient):
✅ Read SESSION-STATE.md at chat start (500 tokens)
✅ Run health-check.ps1 for status (1,200 tokens)
✅ Create script with multiple operations (2,000 tokens)
✅ Process data in script, return summary (1,000 tokens)
✅ Batch multiple edits with batch-edit.py (2,000 tokens)

**Total: ~6,700 tokens for complete workflow**

### BAD (Token Heavy):
❌ Search past conversations for context (50,000 tokens)
❌ list_sessions + multiple start_process (8,000 tokens)
❌ read_file multiple times (15,000 tokens)
❌ Individual edit_block calls (5,000 tokens each)
❌ Returning full file contents (10,000 tokens)

**Total: ~88,000 tokens for same workflow**

**Savings: 92% reduction in token usage**

## Enforcement Rules:

1. **ALWAYS start with SESSION-STATE.md** - Never search conversations
2. **NEVER make 5+ tool calls** without creating a script
3. **NEVER read files >100 lines** into context without filtering
4. **ALWAYS batch edits** - Use batch-edit.py for multiple files
5. **ALWAYS filter results** - Process data in scripts, return summaries

## Quick Decision Tree:

```
User asks for something
    ↓
Does SESSION-STATE.md exist? 
    → YES: Read it first (saves 50,000 tokens)
    → NO: Start without context
    ↓
Is there a workflow script for this?
    → YES: Use it
    → NO: Continue to next check
    ↓
Will this require 3+ tool calls?
    → YES: Create workflow script
    → NO: OK to use tool calls directly
    ↓
Will this read/return large data?
    → YES: Filter in script first
    → NO: OK to return directly
```

## Example: Following the Checklist

### User Request:
"Check if app is running, restart if needed, find aquaponics notes"

### BAD Approach (Old Way):
1. list_sessions (1,000 tokens)
2. start_process: docker ps (1,500 tokens)
3. start_process: netstat (1,500 tokens)
4. start_process: restart services (3,000 tokens)
5. Query database directly (5,000 tokens)
6. Return full results (8,000 tokens)
**Total: 20,000 tokens**

### GOOD Approach (Workflow Way):
1. Read SESSION-STATE.md (500 tokens)
2. Run health-check.ps1 (1,200 tokens)
3. If needed: restart-services.ps1 (1,500 tokens)
4. Run find-notes.py "aquaponics" (1,500 tokens)
**Total: 4,700 tokens**

**Savings: 76% token reduction**

## When to Break the Rules:

ONLY use multiple tool calls when:
- User explicitly asks to see step-by-step process
- Debugging requires seeing intermediate results
- Single operation genuinely cannot be scripted

Even then, ask: "Should I create a workflow script for this?"
