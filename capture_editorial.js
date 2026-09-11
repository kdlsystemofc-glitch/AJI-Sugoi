const puppeteer = require("puppeteer");
const path = require("path");
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  
  const fileUrl = "file://" + path.resolve(__dirname, "explore-03.html");
  
  // Desktop 1440x900
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: "networkidle0" });
  await page.screenshot({ path: "screenshot_explore_03_editorial.png" });
  
  // Mobile 390x844
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await mobilePage.goto(fileUrl, { waitUntil: "networkidle0" });
  await mobilePage.screenshot({ path: "screenshot_explore_03_mobile.png" });

  await browser.close();
  console.log("Screenshots captured successfully.");
})();
