const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: err.toString() }));

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  // Helper to scroll to trigger progress
  async function scrollToProgress(triggerId, progress) {
    await page.evaluate((id, prog) => {
      const st = ScrollTrigger.getById(id);
      if (st) {
        const target = st.start + (st.end - st.start) * prog;
        window.__lenis.scrollTo(target, { immediate: true });
        ScrollTrigger.update();
      }
    }, triggerId, progress);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('--- 1. Capture Explore 01 (Opening start) ---');
  await page.evaluate(() => {
    window.__lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'proof_01_explore01.png' });

  console.log('--- 2. Capture Physical Shear Midpoint ---');
  await scrollToProgress('opening', 0.55);
  await page.screenshot({ path: 'proof_02_physical_shear.png' });

  console.log('--- 3. Capture Anatomy Midpoint ---');
  await scrollToProgress('anatomy', 0.5);
  await page.screenshot({ path: 'proof_03_anatomy_midpoint.png' });

  console.log('--- 4. Capture Caixa Vermelha Fechada ---');
  await scrollToProgress('redbox', 0.05);
  await page.screenshot({ path: 'proof_04_redbox_closed.png' });

  console.log('--- 5. Capture Caixa Vermelha Aberta ---');
  await scrollToProgress('redbox', 0.7);
  await page.screenshot({ path: 'proof_05_redbox_open.png' });

  console.log('--- 6. Capture Salão Iluminado ---');
  await scrollToProgress('dining', 0.6);
  await page.screenshot({ path: 'proof_06_dining_illuminated.png' });

  console.log('--- 7. Capture Final Poster ---');
  await page.evaluate(() => {
    window.__lenis.scrollTo(document.body.scrollHeight, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'proof_07_final_poster.png' });

  console.log('All 7 screenshots captured with surgical precision!');
  console.log('Console logs:', consoleMessages);
  await browser.close();
})();
