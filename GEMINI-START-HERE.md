# GEMINI: START HERE

## Your Mission
Test the delete and star buttons in a note-taking app to verify they work end-to-end.

## Fastest Path (2 commands)

```powershell
cd C:\dev\note-app
.\run-tests.ps1
```

That's it! The script will:
- Check and start all services if needed
- Install Playwright if missing
- Run all 3 automated test scenarios
- Save results to test-results.json

## What You'll See

The browser will open automatically and you'll see:
- **Scenario 1**: Buttons appearing on hover ✅
- **Scenario 2**: Star button being clicked twice (toggle on, then off) ⭐
- **Scenario 3**: Last note being deleted 🗑️

Console output will show:
- 🌟 = Star operation
- 🗑️ = Delete operation  
- 📡 = Network request
- 📨 = Response
- ✅ = Success
- ❌ = Failure

## What to Report Back

After tests complete, report:

1. **Overall Result**: All tests passed? (Yes/No)

2. **Scenario Status**:
   - Scenario 1 (Buttons Visible): PASS/FAIL
   - Scenario 2 (Star Works): PASS/FAIL
   - Scenario 3 (Delete Works): PASS/FAIL

3. **Attach**: test-results.json file

4. **Console Output**: Copy the "TEST SUMMARY" section from console

5. **Any Issues**: Describe what failed and any error messages

## Example Success Output

```
📊 SCENARIO 1: PASS
📊 SCENARIO 2: PASS  
📊 SCENARIO 3: PASS

TEST SUMMARY
============
Total Scenarios: 3
✅ Passed: 3
❌ Failed: 0
```

## If Something Goes Wrong

### Services not running?
```powershell
.\workflows\restart-services.ps1
```

### Need to check service status?
```powershell
.\workflows\health-check.ps1
```

### Want to view test results?
```powershell
Get-Content test-results.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Tests fail but you want details?
Read the comprehensive test spec:
```powershell
Get-Content gemini-test-instructions.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Files You Have

All in C:\dev\note-app\:

1. **run-tests.ps1** ← RUN THIS (automated everything)
2. **comprehensive-test.js** ← The actual test script
3. **gemini-test-instructions.json** ← Full test specification  
4. **GEMINI-README.md** ← Detailed documentation
5. **test-results.json** ← Created after running tests

## Quick Checklist

- [ ] Navigate to C:\dev\note-app
- [ ] Run: .\run-tests.ps1
- [ ] Watch browser perform tests automatically
- [ ] Wait for "Test complete!" message
- [ ] Check test-results.json was created
- [ ] Report results back

## Expected Timeline

- Service startup: 10-15 seconds
- Playwright install (if needed): 30-60 seconds
- Test execution: 45-60 seconds
- Total: 1-2 minutes

Good luck! 🚀
