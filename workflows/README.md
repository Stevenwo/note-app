# Token-Efficient Workflows

This directory contains scripts to minimize token usage when working with Claude.

## Why This Matters

With multiple MCP servers connected (GitHub, Desktop Commander, Playwright, Google Drive), 
every tool definition loads into Claude's context window. This can consume 100,000+ tokens 
before Claude even reads your message, causing conversations to end quickly.

## Token Savings by Using Scripts

| Approach | Token Usage | Example |
|----------|-------------|---------|
| **Multiple Tool Calls** | ~50,000 tokens | read_file → edit → read → edit → start_process |
| **Single Script** | ~2,000 tokens | python batch-edit.py edits.json |
| **Savings** | **96% reduction** | 🎉 |

## Available Workflows

### 1. `restart-services.ps1`
Restart all app services in one command instead of 5+ tool calls.

```powershell
.\workflows\restart-services.ps1
```

**Saves**: ~10,000 tokens per restart

### 2. `find-notes.py`
Search for notes without multiple database queries flowing through context.

```bash
python workflows/find-notes.py "aquaponics"
```

**Saves**: ~5,000 tokens per search

### 3. `batch-edit.py`
Apply multiple file edits at once. Create an `edits.json`:

```json
{
  "edits": [
    {
      "file": "frontend/components/NoteCard.tsx",
      "old": "onClick={undefined}",
      "new": "onClick={handleDelete}"
    },
    {
      "file": "backend/src/routes.rs",
      "old": "// TODO: delete endpoint",
      "new": "async fn delete_note(..."
    }
  ]
}
```

Then run:
```bash
python workflows/batch-edit.py edits.json
```

**Saves**: ~15,000 tokens for 3 edits

## Best Practices

1. **Start new chats by reading SESSION-STATE.md** - provides full context in ~500 tokens
2. **Batch operations** - group related changes into single scripts
3. **Filter before returning** - process data in scripts, return only summaries
4. **Use filesystem for state** - save progress between conversations

## Example: Token-Efficient Development Session

**Old Way** (High Token Usage):
```
User: "Check if app is running, restart if needed, then implement delete button"
Claude: 
  - list_sessions (1K tokens)
  - start_process x3 (10K tokens)
  - read_file NoteCard.tsx (5K tokens)
  - edit_block NoteCard.tsx (3K tokens)
  - read_file routes.rs (8K tokens)  
  - edit_block routes.rs (4K tokens)
Total: ~31K tokens
```

**New Way** (Low Token Usage):
```
User: "Check if app is running, restart if needed, then implement delete button"
Claude:
  - start_process: python check-and-restart.py (2K tokens)
  - start_process: python batch-edit.py delete-feature.json (2K tokens)
Total: ~4K tokens (87% savings!)
```

## Creating New Workflows

When you identify repetitive tasks, create a new workflow script:

1. Identify the task that requires multiple tool calls
2. Write a Python/PowerShell script that does it all
3. Run the script in ONE tool call
4. Return only essential results to context

## Token Budget Monitoring

Each Claude conversation has ~190,000 tokens. With efficient workflows:
- Previous conversations: Lasted 5-10 minutes (~50K tokens/min)
- With workflows: Can last 30-60 minutes (~3-5K tokens/min)

**That's a 10x improvement in conversation length!**
