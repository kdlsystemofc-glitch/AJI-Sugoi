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

  async function scrollToElement(selector, offset = 0) {
    await page.evaluate((sel, off) => {
      const el = document.querySelector(sel);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + off;
        window.__lenis.scrollTo(top, { immediate: true });
        ScrollTrigger.update();
      }
    }, selector, offset);
    await new Promise(r => setTimeout(r, 400));
  }

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

  console.log('=== 2. CAPTURE 02 ANATOMY ===');
  await scrollToElement('.stage-anatomy', 0);
  await page.screenshot({ path: '02_ANATOMY.png' });

  console.log('=== 3. CAPTURE 03 RED BOX CLOSED ===');
  await scrollToProgress('redbox', 0.05);
  await page.screenshot({ path: '03_RED_BOX_CLOSED.png' });

  console.log('=== 4. CAPTURE 04 RED BOX OPEN ===');
  await scrollToProgress('redbox', 0.9);
  await page.screenshot({ path: '04_RED_BOX_OPEN.png' });

  console.log('=== 5. CAPTURE 05 DINING ===');
  await scrollToElement('.stage-dining', 100);
  await page.screenshot({ path: '05_DINING.png' });

  console.log('=== 6. CAPTURE 06 FINAL ===');
  await page.evaluate(() => {
    window.__lenis.scrollTo(document.body.scrollHeight, { immediate: true });
    ScrollTrigger.update();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '06_FINAL.png' });

  console.log('=== RUNNING DOWN -> UP -> DOWN 3 TIMES ===');
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`Cycle ${cycle}: DOWN...`);
    await page.evaluate(() => {
      window.__lenis.scrollTo(document.body.scrollHeight, { immediate: true });
      ScrollTrigger.update();
    });
    await new Promise(r => setTimeout(r, 100));

    console.log(`Cycle ${cycle}: UP...`);
    await page.evaluate(() => {
      window.__lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.update();
    });
    await new Promise(r => setTimeout(r, 100));

    console.log(`Cycle ${cycle}: DOWN to Red Box...`);
    await scrollToProgress('redbox', 0.85);
    await new Promise(r => setTimeout(r, 100));
  }

  // Audit information
  const auditData = await page.evaluate(() => {
    const triggers = ScrollTrigger.getAll();
    const pinSpacers = document.querySelectorAll('.pin-spacer');
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src.split('/').pop(),
      alt: img.alt,
      class: img.className
    }));
    return {
      scrollTriggerCount: triggers.length,
      pinnedCount: pinSpacers.length,
      images: images
    };
  });

  console.log('AUDIT RESULTS:', JSON.stringify(auditData, null, 2));
  console.log('CONSOLE MESSAGES:', consoleMessages);

  await browser.close();
})();
