const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  async function scrollToOpeningProgress(prog) {
    await page.evaluate((p) => {
      const st = ScrollTrigger.getById('opening');
      if (st) {
        const target = st.start + (st.end - st.start) * p;
        window.__lenis.scrollTo(target, { immediate: true });
        ScrollTrigger.update();
      }
    }, prog);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('--- FORWARD SCROLL CAPTURE ---');
  const forwardSteps = [0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  for (const p of forwardSteps) {
    await scrollToOpeningProgress(p);
    const fname = `hero_step_${Math.round(p * 100)}.png`;
    await page.screenshot({ path: fname });
    console.log(`Captured ${fname} at forward progress ${p}`);
  }

  console.log('--- REVERSE SCROLL CAPTURE ---');
  const reverseSteps = [0.8, 0.5, 0.2, 0];
  for (const p of reverseSteps) {
    await scrollToOpeningProgress(p);
    const fname = `hero_reverse_${Math.round(p * 100)}.png`;
    await page.screenshot({ path: fname });
    console.log(`Captured ${fname} at reverse progress ${p}`);
  }

  console.log('--- SCENE 02 ACTIVE PIN CAPTURE ---');
  await page.evaluate(() => {
    const st = ScrollTrigger.getById('anatomy');
    if (st) {
      const target = st.start + (st.end - st.start) * 0.4;
      window.__lenis.scrollTo(target, { immediate: true });
      ScrollTrigger.update();
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: `scene02_midpoint.png` });

  await browser.close();
})();
