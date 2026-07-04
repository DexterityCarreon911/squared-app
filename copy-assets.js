const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..');
const destDir = path.resolve(__dirname, 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${item}`);
    }
  }
}

console.log('Copying images...');
copyDir(path.join(srcDir, 'images'), path.join(destDir, 'images'));

console.log('Copying avatars...');
copyDir(path.join(srcDir, 'avatars'), path.join(destDir, 'avatars'));

console.log('Copying fx...');
copyDir(path.join(srcDir, 'fx'), path.join(destDir, 'fx'));

console.log('Copying favicon...');
fs.copyFileSync(path.join(srcDir, 'Squared_Logo.ico'), path.join(destDir, 'favicon.ico'));
console.log('All assets copied!');
