const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targetImages = [
  'imgi_42_639856189_18564622342037059_7155013422789376632_n.jpg',
  'imgi_16_660665702_18418324108125243_6473536147567592195_n.jpg',
  'imgi_47_621995783_18104209954826534_4197973133947307511_n.jpg',
  'imgi_51_625949395_18358099891202664_240056681359955242_n.jpg',
  'imgi_27_652008549_18124938691570370_4252929218745402272_n.jpg'
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let totalBefore = 0;
  let totalAfter = 0;

  for (const imgName of targetImages) {
    const srcPath = path.join(__dirname, 'imagens', imgName);
    const statBefore = fs.statSync(srcPath);
    totalBefore += statBefore.size;

    const imgBase64 = fs.readFileSync(srcPath).toString('base64');
    const mime = 'image/jpeg';
    const dataUri = `data:${mime};base64,${imgBase64}`;

    const webpBase64 = await page.evaluate(async (uri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/webp', 0.88);
          resolve(dataUrl.split(',')[1]);
        };
        img.src = uri;
      });
    }, dataUri);

    const outWebpName = imgName.replace('.jpg', '.webp');
    const outPath = path.join(__dirname, 'imagens', outWebpName);
    fs.writeFileSync(outPath, Buffer.from(webpBase64, 'base64'));

    const statAfter = fs.statSync(outPath);
    totalAfter += statAfter.size;

    console.log(`${imgName}: ${(statBefore.size/1024).toFixed(1)}KB -> ${outWebpName}: ${(statAfter.size/1024).toFixed(1)}KB (-${(100 - (statAfter.size/statBefore.size)*100).toFixed(1)}%)`);
  }

  console.log(`TOTAL BEFORE: ${(totalBefore/1024).toFixed(1)}KB (${(totalBefore/(1024*1024)).toFixed(2)}MB)`);
  console.log(`TOTAL AFTER: ${(totalAfter/1024).toFixed(1)}KB (${(totalAfter/(1024*1024)).toFixed(2)}MB)`);
  console.log(`TOTAL SAVINGS: -${(100 - (totalAfter/totalBefore)*100).toFixed(1)}%`);

  await browser.close();
})();
