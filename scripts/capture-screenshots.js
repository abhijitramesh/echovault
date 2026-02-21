const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate to the app
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the app to fully load
    await page.waitForSelector('main', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Extra wait for animations

    // 1. Hero shot - full page
    console.log('📸 Capturing hero shot...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'hero.png'),
      fullPage: false
    });
    console.log('✅ Hero shot saved');

    // 2. Voice recorder section
    console.log('📸 Capturing voice recorder...');
    const voiceRecorder = await page.$('.neon-card');
    if (voiceRecorder) {
      await voiceRecorder.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'voice-recorder.png')
      });
      console.log('✅ Voice recorder saved');
    }

    // 3. Search section - scroll to it and capture
    console.log('📸 Capturing search section...');
    await page.evaluate(() => {
      const searchSection = document.querySelectorAll('main > div')[1];
      if (searchSection) searchSection.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'search-section.png'),
      fullPage: false
    });
    console.log('✅ Search section saved');

    // 4. Memory list section
    console.log('📸 Capturing memory list...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'memory-list.png'),
      fullPage: false
    });
    console.log('✅ Memory list saved');

    // 5. Full page screenshot
    console.log('📸 Capturing full page...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'full-app.png'),
      fullPage: true
    });
    console.log('✅ Full page saved');

    console.log('\n🎉 All screenshots captured successfully!');
    console.log(`📁 Saved to: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
