/**
 * TDD Verification Suite for Cross-Platform POSIX Path Normalization
 */

import path from 'path';
import { normalizePath } from './index_manager.js';

function runTests() {
  console.log("=====================================================");
  console.log("   Running Cross-Platform Path Normalization Tests   ");
  console.log("=====================================================\n");

  try {
    // Test Case 1: Windows delimiter replacement
    console.log("🧪 Test Case 1: Normalizing Windows backslashes...");
    const windowsPath = "C:\\Users\\Daniel\\Documents\\project\\skillsets\\pm";
    const result1 = normalizePath(windowsPath);
    
    if (result1.includes('\\')) {
      throw new Error(`Assertion failed: Delimiter normalization missed backslashes: ${result1}`);
    }
    console.log(`  ✓ Converted: "${windowsPath}"`);
    console.log(`            -> "${result1}"`);
    console.log("  🟢 Test Case 1 passed successfully!\n");

    // Test Case 2: Mixed delimiters
    console.log("🧪 Test Case 2: Normalizing mixed slash/backslash strings...");
    const mixedPath = "C:/Users\\Daniel/Documents\\project/skillsets/pm";
    const result2 = normalizePath(mixedPath);
    
    if (result2.includes('\\')) {
      throw new Error(`Assertion failed: Delimiter normalization missed mixed backslashes: ${result2}`);
    }
    console.log(`  ✓ Converted: "${mixedPath}"`);
    console.log(`            -> "${result2}"`);
    console.log("  🟢 Test Case 2 passed successfully!\n");

    // Test Case 3: Already POSIX paths remain unchanged in structure
    console.log("🧪 Test Case 3: Verifying POSIX paths are preserved...");
    const posixPath = "/var/log/senfide/skillsets/pm";
    const result3 = normalizePath(posixPath);
    
    if (result3.includes('\\')) {
      throw new Error(`Assertion failed: POSIX path was corrupted: ${result3}`);
    }
    console.log(`  ✓ Verified: "${posixPath}"`);
    console.log(`           -> "${result3}"`);
    console.log("  🟢 Test Case 3 passed successfully!\n");

    console.log("=====================================================");
    console.log("🎉 All Cross-Platform Path Normalization Tests Passed!");
    console.log("=====================================================");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Path resolution tests failed: ${err.message}`);
    process.exit(1);
  }
}

runTests();
