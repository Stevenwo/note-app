# Gemini: Run This Command

## The Command
```powershell
cd C:\dev\note-app
.\run-tests.ps1
```

## What It Does
- Verifies all services are running (starts them if needed)
- Checks API health
- Installs Playwright if needed
- Opens browser and runs automated tests
- Saves results to `test-results.json`

Takes ~2 minutes total.

## What to Report Back

### 1. Did it pass?
Copy the final summary from console:
```
TEST SUMMARY
============
Total Scenarios: 3
✅ Passed: ?
❌ Failed: ?
```

### 2. Send these files:
- `test-results.json` (full test details)

### 3. Any errors?
If tests failed, copy any error messages you saw.

## That's It!
Just run the command and send back the summary + test-results.json file.

## If You Get Errors
- Read: `TEST-FAILURE-FIX.md`
- Or: Ask Steve's Claude for help
