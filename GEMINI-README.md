# Test Instructions for Gemini CLI

## Overview
You need to test the delete and star functionality of a note-taking app. Two files have been prepared for you:

1. **gemini-test-instructions.json** - Comprehensive test specification with all context
2. **comprehensive-test.js** - Automated Playwright test script

## Quick Start

### Option 1: Run the Automated Test (RECOMMENDED)
```powershell
cd C:\dev\note-app
node comprehensive-test.js
```

This will:
- Open a visible browser window
- Run all 3 test scenarios automatically
- Show progress in real-time with emoji indicators
- Save detailed results to `test-results.json`
- Keep browser open for 10 seconds at the end for review

### Option 2: Manual Testing with Playwright

If the automated script has issues, you can test manually:

1. Install Playwright in the project (if not already):
```powershell
cd C:\dev\note-app
npm install playwright
```

2. Create custom test scripts based on gemini-test-instructions.json

## Prerequisites - CRITICAL!

Before running tests, ensure all services are running:

```powershell
cd C:\dev\note-app
.\workflows\health-check.ps1
```

Expected output: All three services should show `[OK] Running`
- Frontend (Next.js) on port 3000
- Backend (Rust/Axum) on port 8080  
- PostgreSQL (Docker)

If any service is down:
```powershell
.\workflows\restart-services.ps1
```

## What the Test Does

### Scenario 1: Visual Verification
- Opens http://localhost:3000
- Verifies note cards render
- Hovers over a card
- Checks if star and delete buttons appear

### Scenario 2: Star Functionality
- Clicks the star button
- Verifies API call (PUT /api/notes/:id/star)
- Checks console logs for: 🌟, 📡, 📨, ✅
- Confirms UI updates (star icon fills/unfills)
- Toggles star back to original state

### Scenario 3: Delete Functionality
- Counts initial notes
- Clicks delete button on last note
- Handles confirmation dialog
- Verifies API call (DELETE /api/notes/:id)
- Checks console logs for: 🗑️, 📡, 📨, ✅
- Confirms note disappears from UI
- Refreshes page to verify deletion persisted

## Expected Results

✅ **SUCCESS**: All 3 scenarios pass
- Buttons appear on hover
- Star toggles correctly and persists
- Delete removes note permanently
- All API calls return 200/204 status
- Console logs show all expected emojis

❌ **FAILURE**: Any scenario fails
- Check the console output for specific failure
- Review `test-results.json` for detailed diagnostics
- See "Debugging Checklist" in gemini-test-instructions.json

## Output Files

After running tests, check:
- **test-results.json** - Complete test results with all logs and network activity
- **Console output** - Real-time test progress with emoji indicators

## Reporting Back

Please provide:

1. **Summary**: Did all tests pass? (Yes/No)
2. **Scenario Results**: 
   - Scenario 1: PASS/FAIL
   - Scenario 2: PASS/FAIL  
   - Scenario 3: PASS/FAIL
3. **Console Logs**: Copy key console output (especially lines with emojis)
4. **Network Activity**: Any failed API calls?
5. **Issues Found**: Describe any problems
6. **test-results.json**: Attach or paste the full results file

## Troubleshooting

### "Cannot find module 'playwright'"
```powershell
cd C:\dev\note-app
npm install playwright
```

### Services not running
```powershell
.\workflows\restart-services.ps1
```

### Port 3000 already in use
Multiple dev servers may be running. Kill them:
```powershell
Get-Process -Name node | Stop-Process -Force
.\workflows\restart-services.ps1
```

### Tests fail immediately
1. Check services are running
2. Open http://localhost:3000 manually - do you see note cards?
3. Open F12 console - are there JavaScript errors?
4. Check backend is responding: http://localhost:8080/api/health

## Advanced: Custom Tests

If you want to write custom tests, refer to:
- **gemini-test-instructions.json** - Full test specification
- **comprehensive-test.js** - Implementation examples

Use Desktop Commander MCP to:
- Read files: `desktop-commander:read_file`
- Run commands: `desktop-commander:start_process`
- Search code: `desktop-commander:start_search`

Use Playwright MCP for browser automation.

## Success Criteria

The features are working correctly if:
✅ Hovering shows buttons
✅ Star button toggles the star icon
✅ Star state persists after refresh
✅ Delete button shows confirmation dialog
✅ Delete removes note from UI immediately
✅ Deleted note doesn't reappear after refresh
✅ All API calls succeed (200/204 status)
✅ Console shows all expected emoji logs
