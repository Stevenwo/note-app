# 🚀 Quick Start - Claude Code for Note-App

## Launch Claude Code
```powershell
cd C:\dev\note-app
.\launch-claude-code.ps1
```

## First Commands to Try

### Test Browser Automation (Playwright)
```
Navigate to http://localhost:3000 and take a screenshot
```

### Test Rust Intelligence
```
Show me the main.rs file and explain the create_note endpoint
```

### Test File Operations
```
List all Rust files in the backend directory
```

## Common Workflows

### Frontend Development
1. Start services: `docker-compose up -d` (database)
2. Start backend: `cd backend && cargo run`
3. Start frontend: `cd frontend && npm run dev`
4. Launch Claude Code and ask to test the UI

### Backend Development
1. Start database
2. Launch Claude Code
3. Ask to analyze or modify Rust code
4. Claude Code can read, edit, and test your backend

### Full-Stack Feature Development
1. Start all services
2. Launch Claude Code
3. Work on both frontend and backend
4. Use Playwright to test changes in real-time

## MCP Servers Available
- 🎭 **Playwright**: Browser automation
- 🦀 **Rust Analyzer**: Code intelligence  
- 🐙 **GitHub**: Repository operations

## Need Help?
- Run verification: `.\verify-setup.ps1`
- Read full guide: `CLAUDE-CODE-SETUP.md`
- Just ask Claude Code - it knows how to use all its tools!
