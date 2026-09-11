const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  const fileUrl = "file://" + path.resolve(__dirname, "index.html");
  await page.goto(fileUrl, { waitUntil: "networkidle0" });
  
  // Full page screenshot
  await page.screenshot({ path: "screenshot_full_landing.png", fullPage: true });

  // Viewport 1 (Hero)
  await page.screenshot({ path: "screenshot_scene_01.png" });

  // Scene 2
  await page.evaluate(() => document.getElementById("craft").scrollIntoView());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "screenshot_scene_02.png" });

  // Scene 3
  await page.evaluate(() => document.getElementById("menu").scrollIntoView());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "screenshot_scene_03.png" });

  // Scene 4
  await page.evaluate(() => document.getElementById("verdict").scrollIntoView());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "screenshot_scene_04.png" });

  // Scene 5
  await page.evaluate(() => document.getElementById("experience").scrollIntoView());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "screenshot_scene_05.png" });

  // Scene 6
  await page.evaluate(() => document.getElementById("order").scrollIntoView());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "screenshot_scene_06.png" });

  await browser.close();
  console.log("All scene screenshots captured.");
})();
