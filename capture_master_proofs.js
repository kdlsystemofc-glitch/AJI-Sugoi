const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: err.toString() }));

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

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

  console.log('=== 1. CAPTURE 01 HERO ===');
  await page.evaluate(() => {
    window.__lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '01_HERO.png' });

  console.log('=== 2. CAPTURE 02 PHYSICAL SHEAR — 50% ===');
  await scrollToProgress('opening', 0.5);
  await page.screenshot({ path: '02_PHYSICAL_SHEAR_50.png' });

  console.log('=== 3. CAPTURE 03 ANATOMY — 50% ===');
  await scrollToProgress('anatomy', 0.5);
  await page.screenshot({ path: '03_ANATOMY_50.png' });

  console.log('=== 4. CAPTURE 04 RED BOX — CLOSED ===');
  await scrollToProgress('redbox', 0.05);
  await page.screenshot({ path: '04_RED_BOX_CLOSED.png' });

  console.log('=== 5. CAPTURE 05 RED BOX — MID OPEN ===');
  await scrollToProgress('redbox', 0.45);
  await page.screenshot({ path: '05_RED_BOX_MID_OPEN.png' });

  console.log('=== 6. CAPTURE 06 RED BOX — OPEN ===');
  await scrollToProgress('redbox', 0.85);
  await page.screenshot({ path: '06_RED_BOX_OPEN.png' });

  console.log('=== 7. CAPTURE 07 DINING ===');
  await scrollToProgress('dining', 0.6);
  await page.screenshot({ path: '07_DINING.png' });

  console.log('=== 8. CAPTURE 08 FINAL ===');
  await page.evaluate(() => {
    window.__lenis.scrollTo(document.body.scrollHeight, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '08_FINAL.png' });

  console.log('=== REVERSE TEST: DOWN -> UP -> DOWN ===');
  // UP to Hero
  await page.evaluate(() => {
    window.__lenis.scrollTo(0, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'REVERSE_UP_HERO.png' });

  // DOWN back to Red Box Mid Open
  await scrollToProgress('redbox', 0.45);
  await page.screenshot({ path: 'REVERSE_DOWN_RED_BOX.png' });

  console.log('Capture finished. Console messages:', consoleMessages);
  await browser.close();
})();
