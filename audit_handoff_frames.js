const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

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

  const steps = [0.0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0];
  const coverageMap = [];

  for (const prog of steps) {
    await scrollToProgress('opening', prog);

    const frameData = await page.evaluate((p) => {
      const heroWrap = document.querySelector('.opening-media-wrap');
      const blade = document.querySelector('.opening-shear-blade');
      const incoming = document.querySelector('.opening-incoming-layer');

      const heroStyle = window.getComputedStyle(heroWrap);
      const bladeStyle = window.getComputedStyle(blade);
      const incomingStyle = window.getComputedStyle(incoming);

      return {
        progress: Math.round(p * 100) + '%',
        heroClip: heroStyle.clipPath,
        heroOpacity: heroStyle.opacity,
        heroZIndex: heroStyle.zIndex,
        bladeTransform: bladeStyle.transform,
        bladeZIndex: bladeStyle.zIndex,
        incomingOpacity: incomingStyle.opacity,
        incomingZIndex: incomingStyle.zIndex
      };
    }, prog);

    coverageMap.push(frameData);

    if (prog === 0.0) await page.screenshot({ path: 'handoff_00.png' });
    if (prog === 0.25) await page.screenshot({ path: 'handoff_25.png' });
    if (prog === 0.5) await page.screenshot({ path: 'handoff_50.png' });
    if (prog === 0.75) await page.screenshot({ path: 'handoff_75.png' });
    if (prog === 1.0) await page.screenshot({ path: 'handoff_100.png' });
  }

  console.log('=== COVERAGE MAP AUDIT ===');
  console.log(JSON.stringify(coverageMap, null, 2));

  console.log('=== REVERSE TEST: 100% -> 0% ===');
  await scrollToProgress('opening', 0.0);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'reverse_hero_reconstructed.png' });

  console.log('Audit completed. Errors:', consoleErrors);
  await browser.close();
})();
