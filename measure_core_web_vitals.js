const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Track network requests
  const networkRequests = [];
  page.on('response', async res => {
    const url = res.url();
    const headers = res.headers();
    const contentLength = headers['content-length'] ? parseInt(headers['content-length']) : 0;
    networkRequests.push({ url, status: res.status(), size: contentLength });
  });

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'networkidle0' });

  const metrics = await page.evaluate(async () => {
    // LCP
    const lcpEntry = await new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? Math.round(lastEntry.startTime) : 0);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve(0), 1000);
    });

    // CLS
    let cls = 0;
    const clsEntries = performance.getEntriesByType('layout-shift');
    for (const entry of clsEntries) {
      if (!entry.hadRecentInput) cls += entry.value;
    }

    // Paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    // Memory
    const memory = window.performance.memory ? {
      usedJSHeapMB: (window.performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
      totalJSHeapMB: (window.performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)
    } : { usedJSHeapMB: 'N/A' };

    return {
      lcp: lcpEntry,
      fcp: Math.round(fcp),
      cls: cls.toFixed(4),
      memory
    };
  });

  // Calculate font weights & image weights
  const fontRequests = networkRequests.filter(r => r.url.includes('fonts.gstatic.com') || r.url.includes('fonts.googleapis.com'));
  const imageRequests = networkRequests.filter(r => r.url.includes('/imagens/'));

  console.log('=== PERFORMANCE METRICS ===');
  console.log('LCP:', metrics.lcp > 0 ? `${metrics.lcp}ms` : `${metrics.fcp}ms (FCP)`);
  console.log('CLS:', metrics.cls);
  console.log('Memory:', metrics.memory);
  console.log('Font requests:', fontRequests.length);
  console.log('Image requests:', imageRequests.map(i => `${i.url.split('/').pop()} (${(i.size/1024).toFixed(1)}KB)`));

  await browser.close();
})();
