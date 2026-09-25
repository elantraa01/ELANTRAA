import fs from 'fs';
import path from 'path';

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const standaloneDir = path.resolve('.next/standalone');
if (fs.existsSync(standaloneDir)) {
  console.log('[standalone-copy] Found .next/standalone. Copying static and public assets...');
  
  // 1. Root level in standalone
  copyRecursive(path.resolve('public'), path.join(standaloneDir, 'public'));
  copyRecursive(path.resolve('.next/static'), path.join(standaloneDir, '.next/static'));

  // 2. In case of monorepo or project folder nesting inside standalone
  const entries = fs.readdirSync(standaloneDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'public') {
      const nestedDir = path.join(standaloneDir, entry.name);
      copyRecursive(path.resolve('public'), path.join(nestedDir, 'public'));
      copyRecursive(path.resolve('.next/static'), path.join(nestedDir, '.next/static'));
    }
  }
  console.log('[standalone-copy] Successfully copied static assets to standalone output.');
} else {
  console.log('[standalone-copy] .next/standalone directory not present, skipping standalone copy.');
}
