import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
console.log('🚀 Starting Phoenix Desert Safari production build...');

// 1. Run Vite build to compile React 19 + Tailwind v4 client bundle into dist/
console.log('📦 Building client assets with Vite...');
try {
  execSync('npx vite build', { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// 2. Verify dist folder and index.html existence
const distDir = path.resolve(projectRoot, 'dist');
const distIndex = path.resolve(distDir, 'index.html');

if (!fs.existsSync(distIndex)) {
  console.error('❌ Build verification failed: dist/index.html was not generated.');
  process.exit(1);
}

const stats = fs.statSync(distIndex);
console.log(`✅ Client build verified: dist/index.html generated (${stats.size} bytes).`);

// 3. Verify server entry points exist
const serverJs = path.resolve(projectRoot, 'server.js');
const serverTs = path.resolve(projectRoot, 'server.ts');

if (!fs.existsSync(serverJs) || !fs.existsSync(serverTs)) {
  console.error('❌ Build verification failed: server entry point missing.');
  process.exit(1);
}

console.log('✅ Server entry points (server.js, server.ts) confirmed.');
console.log('✨ Production build completed successfully!');
process.exit(0);
