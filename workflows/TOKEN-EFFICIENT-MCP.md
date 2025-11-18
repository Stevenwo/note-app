# Token-Efficient MCP Usage Strategy

## 🎯 **Core Principle: Execute Locally, Return Summaries**

Instead of reading data into context, run code that processes it locally and returns only results.

## 📋 **Pattern 1: File Analysis**

**❌ OLD WAY (High Token Cost):**
```
1. read_file("large-file.rs") → 5K tokens
2. Claude processes in context → 3K tokens
3. Claude responds → 2K tokens
Total: 10K tokens
```

**✅ NEW WAY (Low Token Cost):**
```
1. start_process("python analyze-rust-file.py large-file.rs")
2. Script processes locally, returns summary → 500 tokens
Total: 500 tokens (20x more efficient!)
```

## 📋 **Pattern 2: Database Queries**

**❌ OLD WAY:**
```
1. Execute SQL query
2. Return all 500 rows → 8K tokens
3. Claude analyzes → 3K tokens
Total: 11K tokens
```

**✅ NEW WAY:**
```
1. start_process("python query-and-analyze.py")
2. Script queries, aggregates, returns summary → 600 tokens
Total: 600 tokens
```

## 📋 **Pattern 3: Code Search**

**❌ OLD WAY:**
```
1. list_directory(depth=3) → 4K tokens
2. read_file for multiple files → 6K tokens
3. Search and analyze → 3K tokens
Total: 13K tokens
```

**✅ NEW WAY:**
```
1. start_process("python smart-code-search.py 'create_note'")
2. Script searches, returns file:line matches → 400 tokens
Total: 400 tokens
```

## 🔧 **Desktop Commander Best Practices**

### Use Interactive Processes (REPL Pattern)
```python
# Start a persistent Python REPL
pid = start_process("python -i")

# Send commands without reloading context
interact_with_process(pid, "import pandas as pd")
interact_with_process(pid, "df = pd.read_csv('notes.csv')")
interact_with_process(pid, "print(df.describe())")  # Only see summary

# Reuse the same process for multiple operations
```

### Batch Operations
```python
# Instead of 10 separate file reads (20K tokens)
# Create one script that processes all files (1K tokens)
start_process("python batch-processor.py file1.rs file2.rs file3.rs")
```

### Filter Before Returning
```python
# Script should:
1. Load data
2. Process/filter locally
3. Return ONLY what's needed

# Example: Instead of returning 100 notes
# Return: "Found 100 notes. Top 5 by date: [list]"
```

## 📝 **Workflow Scripts We Need**

Essential scripts to create:
- `analyze-backend.py` - Analyze Rust codebase, return structure
- `check-frontend.py` - Check React components, return issues
- `query-db.py` - Database queries with aggregations
- `search-code.py` - Smart code search with context
- `test-feature.py` - Run tests, return pass/fail summary

## 🎯 **Golden Rules**

1. **Never read large files directly** → Use processing scripts
2. **Never return massive outputs** → Filter and summarize
3. **Reuse REPL sessions** → Don't restart Python for each command
4. **Batch related operations** → One script, multiple tasks
5. **Return structured summaries** → JSON with key findings only

## 📊 **Token Savings Examples**

| Task | Old Way | New Way | Savings |
|------|---------|---------|---------|
| Analyze 10 files | 25K tokens | 1.5K tokens | 94% |
| Database query | 8K tokens | 600 tokens | 92% |
| Code search | 12K tokens | 800 tokens | 93% |
| Feature scaffold | 15K tokens | 2K tokens | 87% |

## ✅ **This Approach**
- Reduces token usage by 80-95%
- Keeps Desktop Commander stable (fewer tool calls)
- Enables longer sessions (3-5x more work)
- Maintains context continuity
