const { chromium } = require('playwright');

async function runTests() {
  console.log('='.repeat(80));
  console.log('PRE-TEST: Verifying API is accessible');
  console.log('='.repeat(80) + '\n');
  
  // Pre-test API verification
  try {
    const http = require('http');
    
    // Check backend health
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8080/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Backend health check: OK');
          resolve();
        } else {
          reject(new Error(`Backend returned status ${res.statusCode}`));
        }
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Backend health check timeout')));
    });
    
    // Check notes API
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8080/api/notes?limit=1', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Notes API check: OK');
          resolve();
        } else {
          reject(new Error(`Notes API returned status ${res.statusCode}`));
        }
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Notes API timeout')));
    });
    
    console.log('✅ All pre-test API checks passed\n');
  } catch (error) {
    console.error('❌ PRE-TEST FAILED:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('   1. Check if PostgreSQL is running: docker ps | findstr note-app-db');
    console.error('   2. Restart services: .\\workflows\\restart-services.ps1');
    console.error('   3. Verify health: .\\workflows\\health-check.ps1');
    console.error('   4. Check backend logs for errors\n');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const page = await browser.newPage();
  const results = {
    timestamp: new Date().toISOString(),
    scenarios: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Set up console and network listeners
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log('🖥️ BROWSER:', text);
    logs.push({ type: 'console', text, timestamp: Date.now() });
  });

  const networkActivity = [];
  page.on('request', req => {
    if (req.url().includes('/api/notes')) {
      const info = `${req.method()} ${req.url()}`;
      console.log('📤 REQUEST:', info);
      networkActivity.push({ type: 'request', method: req.method(), url: req.url(), timestamp: Date.now() });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/notes')) {
      const info = `${res.status()} ${res.url()}`;
      console.log('📥 RESPONSE:', info);
      networkActivity.push({ type: 'response', status: res.status(), url: res.url(), timestamp: Date.now() });
    }
  });

  try {
    // ============================================================================
    // SCENARIO 1: Visual Verification - Buttons Appear on Hover
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 1: Visual Verification - Buttons Appear on Hover');
    console.log('='.repeat(80) + '\n');
    
    const scenario1 = {
      id: '1',
      name: 'Visual Verification - Buttons Appear on Hover',
      status: 'RUNNING',
      steps: [],
      logs: [],
      networkActivity: []
    };

    try {
      // Step 1: Navigate to app
      console.log('Step 1: Opening http://localhost:3000');
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      scenario1.steps.push({ step: 1, status: 'PASS', note: 'Page loaded' });

      // Step 2: Wait for load
      console.log('Step 2: Waiting for page to fully load (increased to 10s)');
      await page.waitForTimeout(10000);
      scenario1.steps.push({ step: 2, status: 'PASS', note: 'Wait completed' });

      // Step 3: Count note cards
      console.log('Step 3: Counting note cards');
      const noteCards = await page.$$('article.note-card');
      console.log(`✅ Found ${noteCards.length} note cards`);
      scenario1.steps.push({ 
        step: 3, 
        status: noteCards.length > 0 ? 'PASS' : 'FAIL', 
        note: `Found ${noteCards.length} cards` 
      });

      if (noteCards.length === 0) {
        throw new Error('No note cards found on page');
      }

      // Step 4: Hover over first card
      console.log('Step 4: Hovering over first note card');
      await noteCards[0].hover();
      await page.waitForTimeout(1000);
      scenario1.steps.push({ step: 4, status: 'PASS', note: 'Hover action completed' });

      // Step 5: Check for star button
      console.log('Step 5: Looking for star button');
      const starButton = await noteCards[0].$('button[title*="Star"]');
      const starFound = !!starButton;
      console.log(`${starFound ? '✅' : '❌'} Star button found: ${starFound}`);
      scenario1.steps.push({ 
        step: 5, 
        status: starFound ? 'PASS' : 'FAIL', 
        note: `Star button ${starFound ? 'found' : 'NOT FOUND'}` 
      });

      // Step 6: Check for delete button
      console.log('Step 6: Looking for delete button');
      const deleteButton = await noteCards[0].$('button[title*="Delete"]');
      const deleteFound = !!deleteButton;
      console.log(`${deleteFound ? '✅' : '❌'} Delete button found: ${deleteFound}`);
      scenario1.steps.push({ 
        step: 6, 
        status: deleteFound ? 'PASS' : 'FAIL', 
        note: `Delete button ${deleteFound ? 'found' : 'NOT FOUND'}` 
      });

      scenario1.status = (starFound && deleteFound) ? 'PASS' : 'FAIL';
    } catch (error) {
      console.error('❌ SCENARIO 1 FAILED:', error.message);
      scenario1.status = 'FAIL';
      scenario1.error = error.message;
    }

    results.scenarios.push(scenario1);
    console.log(`\n📊 SCENARIO 1: ${scenario1.status}\n`);

    // ============================================================================
    // SCENARIO 2: Star Functionality Test
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 2: Star Functionality Test');
    console.log('='.repeat(80) + '\n');

    const scenario2 = {
      id: '2',
      name: 'Star Functionality Test',
      status: 'RUNNING',
      steps: [],
      logs: [...logs],
      networkActivity: [...networkActivity],
      starStateChanges: []
    };

    try {
      // Clear previous logs
      logs.length = 0;
      networkActivity.length = 0;

      console.log('Step 1: Getting first note card');
      const noteCards = await page.$$('article.note-card');
      if (noteCards.length === 0) throw new Error('No note cards available');
      
      const firstCard = noteCards[0];
      
      // Check initial star state
      console.log('Step 2: Checking initial star state');
      await firstCard.hover();
      await page.waitForTimeout(500);
      
      const starBtn = await firstCard.$('button[title*="Star"]');
      if (!starBtn) throw new Error('Star button not found');
      
      const starSvg = await starBtn.$('svg');
      const initialClasses = await starSvg.getAttribute('class');
      const initiallyStarred = initialClasses.includes('fill-current');
      console.log(`⭐ Initial star state: ${initiallyStarred ? 'STARRED' : 'NOT STARRED'}`);
      scenario2.starStateChanges.push({ 
        action: 'initial', 
        starred: initiallyStarred, 
        classes: initialClasses 
      });

      // Click star button (first toggle)
      console.log('Step 3: Clicking star button (first click)');
      console.log('👆 Clicking star button now...');
      await starBtn.click();
      await page.waitForTimeout(2000);

      // Capture logs after first click
      scenario2.logs.push(...logs.map(l => ({ ...l, action: 'first_click' })));
      scenario2.networkActivity.push(...networkActivity.map(n => ({ ...n, action: 'first_click' })));

      // Check expected console logs
      const hasStarringLog = logs.some(l => l.text.includes('🌟'));
      const hasFetchingLog = logs.some(l => l.text.includes('📡'));
      const hasResponseLog = logs.some(l => l.text.includes('📨'));
      const hasSuccessLog = logs.some(l => l.text.includes('✅'));

      console.log(`\nConsole Log Check:`);
      console.log(`  ${hasStarringLog ? '✅' : '❌'} Has 🌟 starring log`);
      console.log(`  ${hasFetchingLog ? '✅' : '❌'} Has 📡 fetching log`);
      console.log(`  ${hasResponseLog ? '✅' : '❌'} Has 📨 response log`);
      console.log(`  ${hasSuccessLog ? '✅' : '❌'} Has ✅ success log`);

      scenario2.steps.push({
        step: 3,
        status: (hasStarringLog && hasFetchingLog && hasResponseLog && hasSuccessLog) ? 'PASS' : 'FAIL',
        note: 'Console logs',
        details: { hasStarringLog, hasFetchingLog, hasResponseLog, hasSuccessLog }
      });

      // Check network activity
      const hasStarRequest = networkActivity.some(n => 
        n.type === 'request' && n.method === 'PUT' && n.url.includes('/star')
      );
      const hasSuccessResponse = networkActivity.some(n => 
        n.type === 'response' && n.status === 200 && n.url.includes('/star')
      );

      console.log(`\nNetwork Activity Check:`);
      console.log(`  ${hasStarRequest ? '✅' : '❌'} PUT request to /star endpoint`);
      console.log(`  ${hasSuccessResponse ? '✅' : '❌'} 200 OK response`);

      scenario2.steps.push({
        step: 4,
        status: (hasStarRequest && hasSuccessResponse) ? 'PASS' : 'FAIL',
        note: 'Network activity',
        details: { hasStarRequest, hasSuccessResponse }
      });

      // Check UI updated
      console.log('\nStep 4: Checking if UI updated');
      await firstCard.hover();
      const updatedStarSvg = await starBtn.$('svg');
      const updatedClasses = await updatedStarSvg.getAttribute('class');
      const nowStarred = updatedClasses.includes('fill-current');
      const stateToggled = nowStarred !== initiallyStarred;
      
      console.log(`⭐ New star state: ${nowStarred ? 'STARRED' : 'NOT STARRED'}`);
      console.log(`${stateToggled ? '✅' : '❌'} Star state toggled: ${stateToggled}`);
      
      scenario2.starStateChanges.push({ 
        action: 'after_first_click', 
        starred: nowStarred, 
        classes: updatedClasses,
        toggled: stateToggled
      });

      scenario2.steps.push({
        step: 5,
        status: stateToggled ? 'PASS' : 'FAIL',
        note: 'UI state changed',
        details: { initiallyStarred, nowStarred, stateToggled }
      });

      // Toggle back
      console.log('\nStep 5: Clicking star button again (toggle back)');
      logs.length = 0;
      networkActivity.length = 0;
      
      await starBtn.click();
      await page.waitForTimeout(2000);

      const finalStarSvg = await starBtn.$('svg');
      const finalClasses = await finalStarSvg.getAttribute('class');
      const finalStarred = finalClasses.includes('fill-current');
      const returnedToInitial = finalStarred === initiallyStarred;

      console.log(`⭐ Final star state: ${finalStarred ? 'STARRED' : 'NOT STARRED'}`);
      console.log(`${returnedToInitial ? '✅' : '❌'} Returned to initial state: ${returnedToInitial}`);

      scenario2.starStateChanges.push({ 
        action: 'after_second_click', 
        starred: finalStarred, 
        classes: finalClasses,
        returnedToInitial
      });

      scenario2.steps.push({
        step: 6,
        status: returnedToInitial ? 'PASS' : 'FAIL',
        note: 'Star toggled back',
        details: { finalStarred, initiallyStarred, returnedToInitial }
      });

      // Determine overall scenario status
      const allStepsPassed = scenario2.steps.every(s => s.status === 'PASS');
      scenario2.status = allStepsPassed ? 'PASS' : 'FAIL';

    } catch (error) {
      console.error('❌ SCENARIO 2 FAILED:', error.message);
      scenario2.status = 'FAIL';
      scenario2.error = error.message;
      scenario2.logs = logs;
      scenario2.networkActivity = networkActivity;
    }

    results.scenarios.push(scenario2);
    console.log(`\n📊 SCENARIO 2: ${scenario2.status}\n`);

    // ============================================================================
    // SCENARIO 3: Delete Functionality Test
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 3: Delete Functionality Test');
    console.log('='.repeat(80) + '\n');

    const scenario3 = {
      id: '3',
      name: 'Delete Functionality Test',
      status: 'RUNNING',
      steps: [],
      logs: [],
      networkActivity: [],
      noteCounts: {}
    };

    try {
      // Clear logs
      logs.length = 0;
      networkActivity.length = 0;

      // Set up dialog handler BEFORE triggering delete
      let dialogAppeared = false;
      let dialogMessage = '';
      
      page.once('dialog', async dialog => {
        dialogAppeared = true;
        dialogMessage = dialog.message();
        console.log(`🗨️  Dialog appeared: "${dialogMessage}"`);
        await dialog.accept();
        console.log('✅ Dialog accepted');
      });

      // Step 1: Count initial notes
      console.log('Step 1: Counting notes before deletion');
      let noteCards = await page.$$('article.note-card');
      const initialCount = noteCards.length;
      console.log(`📊 Initial note count: ${initialCount}`);
      scenario3.noteCounts.initial = initialCount;
      scenario3.steps.push({ 
        step: 1, 
        status: 'PASS', 
        note: `Initial count: ${initialCount}` 
      });

      // Step 2: Get last note card
      console.log('Step 2: Selecting last note card for deletion');
      const lastCard = noteCards[noteCards.length - 1];
      await lastCard.hover();
      await page.waitForTimeout(500);
      scenario3.steps.push({ step: 2, status: 'PASS', note: 'Card selected' });

      // Step 3: Click delete button
      console.log('Step 3: Clicking delete button');
      const deleteBtn = await lastCard.$('button[title*="Delete"]');
      if (!deleteBtn) throw new Error('Delete button not found');
      
      console.log('👆 Clicking delete button now...');
      await deleteBtn.click();
      
      // Wait for dialog to appear and be handled
      await page.waitForTimeout(1000);
      
      console.log(`${dialogAppeared ? '✅' : '❌'} Dialog appeared: ${dialogAppeared}`);
      if (dialogMessage) {
        console.log(`   Message: "${dialogMessage}"`);
      }

      scenario3.steps.push({
        step: 3,
        status: dialogAppeared ? 'PASS' : 'FAIL',
        note: 'Delete confirmation',
        details: { dialogAppeared, dialogMessage }
      });

      // Wait for deletion to complete
      await page.waitForTimeout(2000);

      // Capture logs
      scenario3.logs = [...logs];
      scenario3.networkActivity = [...networkActivity];

      // Check console logs
      const hasDeletingLog = logs.some(l => l.text.includes('🗑️'));
      const hasFetchingLog = logs.some(l => l.text.includes('📡'));
      const hasResponseLog = logs.some(l => l.text.includes('📨'));
      const hasSuccessLog = logs.some(l => l.text.includes('✅'));

      console.log(`\nConsole Log Check:`);
      console.log(`  ${hasDeletingLog ? '✅' : '❌'} Has 🗑️ deleting log`);
      console.log(`  ${hasFetchingLog ? '✅' : '❌'} Has 📡 fetching log`);
      console.log(`  ${hasResponseLog ? '✅' : '❌'} Has 📨 response log`);
      console.log(`  ${hasSuccessLog ? '✅' : '❌'} Has ✅ success log`);

      scenario3.steps.push({
        step: 4,
        status: (hasDeletingLog && hasFetchingLog) ? 'PASS' : 'FAIL',
        note: 'Console logs',
        details: { hasDeletingLog, hasFetchingLog, hasResponseLog, hasSuccessLog }
      });

      // Check network activity
      const hasDeleteRequest = networkActivity.some(n => 
        n.type === 'request' && n.method === 'DELETE'
      );
      const hasSuccessResponse = networkActivity.some(n => 
        n.type === 'response' && (n.status === 200 || n.status === 204)
      );

      console.log(`\nNetwork Activity Check:`);
      console.log(`  ${hasDeleteRequest ? '✅' : '❌'} DELETE request sent`);
      console.log(`  ${hasSuccessResponse ? '✅' : '❌'} Success response (200/204)`);

      scenario3.steps.push({
        step: 5,
        status: (hasDeleteRequest && hasSuccessResponse) ? 'PASS' : 'FAIL',
        note: 'Network activity',
        details: { hasDeleteRequest, hasSuccessResponse }
      });

      // Step 4: Count notes after deletion
      console.log('\nStep 6: Counting notes after deletion');
      noteCards = await page.$$('article.note-card');
      const afterDeleteCount = noteCards.length;
      const countDecremented = afterDeleteCount === (initialCount - 1);
      
      console.log(`📊 After deletion count: ${afterDeleteCount}`);
      console.log(`${countDecremented ? '✅' : '❌'} Count decremented: ${countDecremented} (expected ${initialCount - 1}, got ${afterDeleteCount})`);
      
      scenario3.noteCounts.afterDelete = afterDeleteCount;
      scenario3.steps.push({
        step: 6,
        status: countDecremented ? 'PASS' : 'FAIL',
        note: 'Note removed from UI',
        details: { initialCount, afterDeleteCount, countDecremented }
      });

      // Step 5: Refresh and verify persistence
      console.log('\nStep 7: Refreshing page to verify persistence');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      noteCards = await page.$$('article.note-card');
      const afterReloadCount = noteCards.length;
      const persistedCorrectly = afterReloadCount === afterDeleteCount;

      console.log(`📊 After reload count: ${afterReloadCount}`);
      console.log(`${persistedCorrectly ? '✅' : '❌'} Deletion persisted: ${persistedCorrectly}`);

      scenario3.noteCounts.afterReload = afterReloadCount;
      scenario3.steps.push({
        step: 7,
        status: persistedCorrectly ? 'PASS' : 'FAIL',
        note: 'Deletion persisted',
        details: { afterDeleteCount, afterReloadCount, persistedCorrectly }
      });

      // Overall status
      const allStepsPassed = scenario3.steps.every(s => s.status === 'PASS');
      scenario3.status = allStepsPassed ? 'PASS' : 'FAIL';

    } catch (error) {
      console.error('❌ SCENARIO 3 FAILED:', error.message);
      scenario3.status = 'FAIL';
      scenario3.error = error.message;
      scenario3.logs = logs;
      scenario3.networkActivity = networkActivity;
    }

    results.scenarios.push(scenario3);
    console.log(`\n📊 SCENARIO 3: ${scenario3.status}\n`);

  } catch (error) {
    console.error('❌ TEST SUITE FAILED:', error);
  } finally {
    // Calculate summary
    results.summary.total = results.scenarios.length;
    results.summary.passed = results.scenarios.filter(s => s.status === 'PASS').length;
    results.summary.failed = results.scenarios.filter(s => s.status === 'FAIL').length;

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal Scenarios: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log('\nScenario Results:');
    results.scenarios.forEach(s => {
      console.log(`  ${s.status === 'PASS' ? '✅' : '❌'} ${s.id}: ${s.name}`);
    });

    // Save detailed results to file
    const fs = require('fs');
    const resultsPath = 'C:\\dev\\note-app\\test-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

    console.log('\n⏰ Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);
