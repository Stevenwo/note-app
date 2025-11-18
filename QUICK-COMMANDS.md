# Ready-to-Paste Commands for Claude Code / Gemini CLI

## Quick Start (Copy Entire Block)

### For Claude Code:
```
Read C:\dev\note-app\PROJECT-CONTEXT.json for full project context.

IMMEDIATE TASK: Debug star and delete button functionality.

STEPS:
1. Run C:\dev\note-app\workflows\health-check.ps1 to verify services
2. Test backend endpoints directly:
   - Invoke-RestMethod -Uri http://localhost:8080/api/notes -Method GET | Select-Object -First 1
   - Invoke-RestMethod -Uri http://localhost:8080/api/notes/1/star -Method PUT
   - Invoke-RestMethod -Uri http://localhost:8080/api/notes/1 -Method DELETE
3. Use Playwright MCP to:
   - Navigate to http://localhost:3000
   - Open browser DevTools Network tab
   - Click star button on first note
   - Click delete button on first note
   - Capture what API calls (if any) are made
4. Identify the disconnect between frontend buttons and backend API
5. Fix the issue and write changes to files
6. Re-test with Playwright

TOKEN RULES: Use batch operations, write code to files, don't output full code in chat.
```

### For Gemini CLI:
```bash
gemini -f C:\dev\note-app\PROJECT-CONTEXT.json "Debug star and delete buttons. Run health-check.ps1, test backend APIs with Invoke-RestMethod, use Playwright to click buttons and show network requests. Fix frontend-backend communication."
```

---

## Specific Debugging Commands

### Test Backend Only:
```
Read PROJECT-CONTEXT.json. Test these endpoints and tell me which work:
1. GET http://localhost:8080/api/notes
2. PUT http://localhost:8080/api/notes/1/star
3. DELETE http://localhost:8080/api/notes/1

Use Invoke-RestMethod for testing.
```

### Test Frontend Only (with Playwright):
```
Read PROJECT-CONTEXT.json. Use Playwright to:
1. Navigate to http://localhost:3000
2. Wait for notes to load
3. Click the star icon on the first note card
4. Observe browser console and network tab
5. Click the trash/delete icon
6. Report what happens and any errors
```

### Full Stack Investigation:
```
Read PROJECT-CONTEXT.json. Follow the layered_testing_approach:
1. Database layer: Verify notes exist with is_starred column
2. Backend layer: Test star/delete endpoints respond correctly
3. Frontend layer: Use Playwright to test button clicks and API calls
4. Report where the breakdown occurs
```

---

## Add New Feature Template:

```
Read PROJECT-CONTEXT.json.

TASK: Implement [FEATURE_NAME]

REQUIREMENTS:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

APPROACH:
1. Check missing_features list in JSON for similar features
2. Follow tech_stack specifications
3. Implement backend first (Rust/Axum)
4. Then implement frontend (Next.js/TypeScript)
5. Test each layer with appropriate tools
6. Write all code to files

Use token-efficient workflows. Batch operations when possible.
```

---

## Service Management Commands:

### Check Status:
```powershell
C:\dev\note-app\workflows\health-check.ps1
```

### Restart All Services:
```powershell
C:\dev\note-app\workflows\restart-services.ps1
```

### Query Database Directly:
```powershell
docker exec -it notes-db psql -U postgres -d notes_db -c "SELECT id, title, is_starred FROM notes LIMIT 5;"
```

### Check Backend Logs:
```powershell
# If backend running as process, check its output
# Or add logging endpoint to backend
```

---

## For Session Recovery (if context lost):

```
Read C:\dev\note-app\PROJECT-CONTEXT.json for complete project state.

QUICK STATUS:
- Frontend: Next.js on localhost:3000
- Backend: Rust/Axum on localhost:8080  
- Database: PostgreSQL in Docker (notes_db)
- Current issue: Star and delete buttons not working
- MCP tools: Desktop Commander + Playwright available

Run health-check.ps1 and report status. Then await instructions.
```

---

## Common Issues Quick Fixes:

### "Backend not responding":
```
Run C:\dev\note-app\workflows\restart-services.ps1
Test with: Invoke-RestMethod -Uri http://localhost:8080/api/notes -Method GET
```

### "No notes displayed":
```
Check database: docker exec -it notes-db psql -U postgres -d notes_db -c "SELECT COUNT(*) FROM notes;"
If empty, may need to re-import or backend needs restart
```

### "Buttons don't work":
```
Use Playwright to check browser console for errors
Verify event handlers in src/components/NoteCard.tsx
Check src/lib/api.ts for correct API function implementations
```

---

## Example Complete Session:

```
Read C:\dev\note-app\PROJECT-CONTEXT.json

SESSION GOAL: Fix star and delete buttons

WORKFLOW:
1. health-check.ps1 - verify services running
2. Test backend: Invoke-RestMethod -Uri http://localhost:8080/api/notes/1/star -Method PUT
3. Playwright: Navigate to localhost:3000, click star button, show network activity
4. Identify issue (event handler? API call? CORS? URL config?)
5. Fix in appropriate file (NoteCard.tsx or api.ts)
6. Playwright: Re-test to confirm fix
7. Repeat for delete button
8. Done!

Use token-efficient patterns: batch edits, write to files, filter output.
```
