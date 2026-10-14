import { execSync } from 'node:child_process';

console.log('🔍 Running TypeScript compiler type check (tsc --noEmit)...');

try {
  execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ TypeScript typecheck passed with 0 errors.');
  process.exit(0);
} catch (error) {
  console.error('❌ TypeScript typecheck found errors.');
  process.exit(1);
}
