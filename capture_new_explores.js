const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  const captures = [
    { file: "explore-landscape.html", out: "screenshot_explore_landscape.png" },
    { file: "explore-box.html", out: "screenshot_explore_box.png" },
    { file: "explore-quiet.html", out: "screenshot_explore_quiet.png" }
  ];

  for (const item of captures) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    const url = "file://" + path.resolve(__dirname, item.file);
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.screenshot({ path: item.out });
    console.log(`Captured ${item.out}`);
  }

  await browser.close();
  console.log("All 3 new visual explorations captured successfully.");
})();
