const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:8085/index.html', { waitUntil: 'load' });

  const audit = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim().replace(/\n+/g, ' '),
      href: a.getAttribute('href'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel')
    }));

    const textContent = document.body.innerText;

    return {
      anchors,
      hasPlaceholderHash: anchors.some(a => a.href === '#' || a.href?.startsWith('#')),
      hasExampleCom: anchors.some(a => a.href?.includes('example.com')),
      hasJavascriptVoid: anchors.some(a => a.href?.includes('javascript:')),
      textLength: textContent.length
    };
  });

  console.log('AUDIT LINKS RESULT:');
  console.log(JSON.stringify(audit, null, 2));

  await browser.close();
})();
