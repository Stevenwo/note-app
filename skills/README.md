# Skills - Token-Efficient Operations

## 📋 What Are Skills?

Skills are reusable scripts that process data LOCALLY instead of passing it through the context window. This dramatically reduces token usage.

## 🎯 Token Savings Example

**Without Skills (Old Way):**
```
Read entire database → 50K tokens
Filter in conversation → 10K tokens  
Process results → 5K tokens
Total: 65K tokens
```

**With Skills (New Way):**
```
Run search-notes.py "aquaponics" → 500 tokens
Returns: "Found 3 notes" + summaries
Total: 500 tokens (99.2% savings!)
```

## 🚀 Available Skills

### analyze-project.py
Analyzes the entire codebase and returns summary statistics
```bash
python skills/analyze-project.py
```
Returns: File counts, line counts, not full file contents

### search-notes.py
Searches the notes database efficiently
```bash
python skills/search-notes.py "aquaponics" 10
```
Returns: Note IDs and previews, not full content

## 💡 How to Use

When you need to:
- **Search notes** → Use `search-notes.py` 
- **Analyze code** → Use `analyze-project.py`
- **Process data** → Create a new skill script

**Key principle:** Process data in Python, return only summaries.

## 📝 Creating New Skills

Template:
```python
"""
Skill Name - What it does
Returns summary, not full data
"""
def do_work():
    # Process data locally
    big_data = load_large_dataset()
    summary = analyze(big_data)
    return summary  # Only return summary!

if __name__ == "__main__":
    print(do_work())
```

## 🎓 Based on Anthropic's Research

This approach is documented in Anthropic's article:
https://www.anthropic.com/engineering/code-execution-with-mcp

Token savings: **Up to 98.7%**
