const puppeteer = require('puppeteer');

const viewports = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
  { name: 'laptop_1366x768', width: 1366, height: 768 },
  { name: 'tablet_landscape_1024x768', width: 1024, height: 768 },
  { name: 'tablet_portrait_768x1024', width: 768, height: 1024 },
  { name: 'mobile_430x932', width: 430, height: 932 },
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'mobile_375x812', width: 375, height: 812 },
  { name: 'mobile_360x800', width: 360, height: 800 }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const results = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load', timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));

    // Audit overflow and layout
    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth;

      const buttons = Array.from(document.querySelectorAll('a, button')).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          text: el.innerText.trim().slice(0, 20),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          meetsMinTarget: rect.width >= 44 && rect.height >= 44
        };
      });

      return {
        hasHorizontalOverflow,
        scrollWidth,
        clientWidth,
        buttons
      };
    });

    results.push({
      viewport: `${vp.width}x${vp.height} (${vp.name})`,
      overflow: metrics.hasHorizontalOverflow ? `OVERFLOW DETECTED (${metrics.scrollWidth} > ${metrics.clientWidth})` : 'NO OVERFLOW (OK)',
      buttonTargets: metrics.buttons.filter(b => b.text.length > 0)
    });

    // Capture designated screenshots
    if (vp.name === 'desktop_1440x900') {
      await page.screenshot({ path: 'screenshot_1440x900.png' });
    }
    if (vp.name === 'tablet_portrait_768x1024') {
      await page.screenshot({ path: 'screenshot_768x1024.png' });
    }
    if (vp.name === 'mobile_390x844') {
      await page.screenshot({ path: 'screenshot_390x844.png' });
    }
  }

  console.log('=== VIEWPORT MATRIX AUDIT RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
})();
