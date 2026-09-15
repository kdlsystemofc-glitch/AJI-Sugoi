const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  // Initial Metrics
  const initialMemory = await page.evaluate(() => {
    return window.performance.memory ? {
      usedJSHeapSizeMB: (window.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
      totalJSHeapSizeMB: (window.performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)
    } : { usedJSHeapSizeMB: 'N/A', totalJSHeapSizeMB: 'N/A' };
  });

  // Check Runtime Singleton Integrity
  const runtimeAudit = await page.evaluate(() => {
    return {
      lenisInstanceCount: window.__lenis ? 1 : 0,
      lenisSmoothWheel: window.__lenis?.options?.smoothWheel,
      scrollTriggerCount: ScrollTrigger.getAll().length,
      scrollTriggers: ScrollTrigger.getAll().map(st => ({
        id: st.vars.id || 'anonymous',
        trigger: st.vars.trigger,
        pin: !!st.vars.pin,
        scrub: st.vars.scrub
      }))
    };
  });

  // 5 CYCLES STRESS TEST: DOWN -> UP -> DOWN -> UP -> DOWN
  console.log('Starting 5 cycles stress test...');
  for (let c = 1; c <= 5; c++) {
    await page.evaluate(() => {
      window.__lenis.scrollTo(document.body.scrollHeight, { immediate: false });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      window.__lenis.scrollTo(0, { immediate: false });
    });
    await new Promise(r => setTimeout(r, 800));
  }

  // Post Stress Metrics & CLS
  const postStressMetrics = await page.evaluate(() => {
    const memory = window.performance.memory ? {
      usedJSHeapSizeMB: (window.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
      totalJSHeapSizeMB: (window.performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)
    } : { usedJSHeapSizeMB: 'N/A', totalJSHeapSizeMB: 'N/A' };

    // Performance Entries
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    return {
      memory,
      fcp: Math.round(fcp)
    };
  });

  // Measure CLS via PerformanceObserver in browser
  const webVitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      let clsValue = 0;
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // unsupported
      }

      setTimeout(() => {
        resolve({
          cls: clsValue.toFixed(4)
        });
      }, 300);
    });
  });

  console.log('=== RUNTIME AUDIT ===');
  console.log(JSON.stringify(runtimeAudit, null, 2));
  console.log('=== INITIAL MEMORY ===', initialMemory);
  console.log('=== POST 5-CYCLE MEMORY ===', postStressMetrics.memory);
  console.log('=== WEB VITALS ===', webVitals, 'FCP:', postStressMetrics.fcp + 'ms');

  await browser.close();
})();
