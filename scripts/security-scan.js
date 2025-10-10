#!/usr/bin/env node

/**
 * Security scan script that runs npm audit and npm outdated,
 * ensuring all commands execute while preserving the audit exit code for CI/CD.
 */

import { execSync } from 'child_process';

let auditExitCode = 0;

try {
  console.log('Running npm audit...');
  execSync('npm audit', { stdio: 'inherit' });
  console.log('✅ No vulnerabilities found');
} catch (error) {
  auditExitCode = error.status || 1;
  console.log(`❌ Audit found issues (exit code: ${auditExitCode})`);
}

try {
  console.log('\nRunning npm outdated...');
  execSync('npm outdated', { stdio: 'inherit' });
} catch (error) {
  // npm outdated exits with code 1 when outdated packages are found
  // This is expected behavior, so we ignore the exit code
  console.log('📦 Outdated packages found (this is informational only)');
}

console.log('\n🛡️ Security scan complete');

// Exit with the original audit exit code so CI fails on vulnerabilities
process.exit(auditExitCode);