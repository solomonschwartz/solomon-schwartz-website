const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const BUILD_DIR = path.join(ROOT_DIR, 'website-v4.0', 'dist');

const KEEP_FILES = new Set([
  'package.json',
  'package-lock.json',
  'CNAME',
  'deploy.js',
  'tailwind.config.js',
  'postcss.config.js',
  'README.md',
  '.gitignore'
]);

const KEEP_DIRS = new Set([
  'website-v4.0',
  'website-v3.0',
  'website-v2.0',
  'website-v1.0',
  'node_modules',
  'netlify',
  '.git'
]);

console.log('🧼 Cleaning static files from root...');

fs.readdirSync(ROOT_DIR).forEach((item) => {
  const fullPath = path.join(ROOT_DIR, item);
  const stat = fs.statSync(fullPath);

  if (stat.isFile() && !KEEP_FILES.has(item)) {
    console.log(`🗑️  Deleting file: ${item}`);
    fs.unlinkSync(fullPath);
  }

  if (stat.isDirectory() && !KEEP_DIRS.has(item)) {
    console.log(`🗑️  Deleting directory: ${item}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('📦 Building site from website-v4.0...');
execSync('npm run build', { cwd: path.join(ROOT_DIR, 'website-v4.0'), stdio: 'inherit' });

console.log('🚚 Copying built files into root...');
copyRecursive(BUILD_DIR, ROOT_DIR);

console.log('✅ Deployment complete.');

function copyRecursive(srcDir, destDir) {
  fs.readdirSync(srcDir).forEach((item) => {
    const src = path.join(srcDir, item);
    const dest = path.join(destDir, item);
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyRecursive(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  });
}
