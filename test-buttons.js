const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Opening http://localhost:3000...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  console.log('Looking for note cards...');
  const noteCards = await page.$$('article.note-card');
  console.log('Found', noteCards.length, 'note cards');
  
  if (noteCards.length > 0) {
    const firstCard = noteCards[0];
    console.log('Hovering over first card...');
    await firstCard.hover();
    await page.waitForTimeout(1000);
    
    const starButton = await firstCard.$('button[title*="Star"]');
    const deleteButton = await firstCard.$('button[title*="Delete"]');
    
    console.log('Star button found:', !!starButton);
    console.log('Delete button found:', !!deleteButton);
    
    if (starButton) {
      console.log('Clicking star button...');
      
      // Listen for network requests
      page.on('request', request => {
        if (request.url().includes('/star')) {
          console.log('Network request:', request.method(), request.url());
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/star')) {
          console.log('Network response:', response.status(), response.url());
        }
      });
      
      await starButton.click();
      await page.waitForTimeout(2000);
      console.log('Star button clicked');
    }
  }
  
  console.log('Test complete. Browser will stay open for 10 seconds...');
  await page.waitForTimeout(10000);
  await browser.close();
})().catch(console.error);
