import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
console.log('🧹 Running comprehensive project code quality and syntax audit...');

let hasErrors = false;

// 1. TypeScript syntax & type safety check
console.log('1️⃣ Checking TypeScript types & syntax...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: projectRoot });
  console.log('   ✅ TypeScript verification passed.');
} catch (error) {
  console.error('   ❌ TypeScript compilation errors detected.');
  hasErrors = true;
}

// 2. Validate JSON files
console.log('2️⃣ Validating project JSON configurations...');
const jsonFiles = [
  'package.json',
  'metadata.json',
  'tsconfig.json',
  'tours_knowledge_base.json',
  'tours_availability.json',
];

for (const file of jsonFiles) {
  const filePath = path.resolve(projectRoot, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      JSON.parse(content);
      console.log(`   ✅ ${file} is valid JSON.`);
    } catch (err) {
      console.error(`   ❌ ${file} has JSON syntax errors:`, err.message);
      hasErrors = true;
    }
  }
}

// 3. Security audit: ensure no live credentials or API keys in .env.example
console.log('3️⃣ Auditing environment templates for credential leakage...');
const envExamplePath = path.resolve(projectRoot, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  const sensitivePatterns = [
    /AIza[0-9A-Za-z-_]{35}/, // Live Google API key pattern
    /ghp_[0-9A-Za-z]{36}/, // GitHub token
    /xox[baprs]-[0-9a-zA-Z]{10,48}/, // Slack token
  ];
  for (const pattern of sensitivePatterns) {
    if (pattern.test(envContent)) {
      console.error('   ❌ Detected potential active secret in .env.example!');
      hasErrors = true;
    }
  }
  console.log('   ✅ .env.example clean (no hardcoded secrets or API keys found).');
}

// 4. Validate SEO tags & Structured Data in index.html
console.log('4️⃣ Auditing SEO & HTML structure in index.html...');
const indexPath = path.resolve(projectRoot, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  if (!indexHtml.includes('<title>') || !indexHtml.includes('name="description"')) {
    console.error('   ❌ index.html is missing title or meta description tag.');
    hasErrors = true;
  } else {
    console.log('   ✅ index.html title and meta description present.');
  }

  if (!indexHtml.includes('application/ld+json')) {
    console.warn('   ⚠️ Warning: No JSON-LD structured data tag found in index.html.');
  } else {
    console.log('   ✅ index.html JSON-LD structured schema detected.');
  }
}

if (hasErrors) {
  console.error('\n❌ Linting audit failed with errors.');
  process.exit(1);
} else {
  console.log('\n✨ All linting and project health checks passed successfully!');
  process.exit(0);
}
