const fs = require("fs");
const path = require("path");

const files = fs.readdirSync("c:/cli/Aji Sugoi/imagens");
console.log("Total images:", files.length);
files.forEach(f => {
  const stat = fs.statSync(path.join("c:/cli/Aji Sugoi/imagens", f));
  console.log(`${f} - ${(stat.size / 1024).toFixed(1)} KB`);
});
