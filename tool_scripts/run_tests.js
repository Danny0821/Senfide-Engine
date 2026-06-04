/**
 * Unified Test Orchestrator for Senfide Engine
 * 
 * Coordinates E2E setups/teardowns, runs all unit and E2E test suites sequentially,
 * gathers timing metrics and logs, prints a consolidated execution report, and exits
 * with clean exit codes.
 * 
 * Zero external dependencies.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Register all test files to run (in optimal logical order)
const TEST_SUITES = [
  { name: "Generator Engine Tests", path: "tool_scripts/test_generator.js" },
  { name: "Autolearner Tests", path: "tool_scripts/test_autolearner.js" },
  { name: "Database Indexing Tests", path: "tool_scripts/test_indexing.js" },
  { name: "E2E Index Sandbox Tests", path: "tool_scripts/verify_index_sandbox.js" },
  { name: "Blueprint Validator Tests", path: "tool_scripts/test_blueprint.js" },
  { name: "E2E Blueprint Scaffolding Tests", path: "tool_scripts/verify_blueprint_sandbox.js" },
  { name: "Path Normalization Tests", path: "tool_scripts/verify_cross_env.js" },
  { name: "Path Resolution Utility Tests", path: "tool_scripts/test_path_resolution.js" },
  { name: "Defensive Diagnostics Tests", path: "tool_scripts/test_defensive_errors.js" },
  { name: "CLI Commands Integration Tests", path: "tool_scripts/test_cli.js" },
  { name: "Lock Semaphore Contention Tests", path: "tool_scripts/test_lock_semaphore.js" },
  { name: "E2E Lifecycle Install/Uninstall", path: "tool_scripts/test_lifecycle.js" },
  { name: "Manifest Syntax Integrity Tests", path: "tool_scripts/test_manifest_integrity.js" },
  { name: "Autolearner Telemetry Integrity Tests", path: "tool_scripts/verify_autolearner_integrity.js" }
];

const INSTALLER_PATH = "tool_scripts/install_global.js";
const UNINSTALLER_PATH = "tool_scripts/uninstall_global.js";

async function executeTestSuite() {
  const startTime = Date.now();
  console.log("=========================================================");
  console.log("          SENFIDE ENGINE UNIFIED TEST HARNESS            ");
  console.log("=========================================================\n");

  const results = [];
  let installationSucceeded = false;

  // --- 1. SETUP PHASE: Global Installation ---
  console.log("🏁 [SETUP] Running global package installation...");
  const setupStart = Date.now();
  try {
    execSync(`node "${path.join(PACKAGE_ROOT, INSTALLER_PATH)}"`, { stdio: 'ignore' });
    installationSucceeded = true;
    console.log(`  ✓ Setup completed successfully in ${Date.now() - setupStart}ms.\n`);
  } catch (err) {
    console.error("  🔴 Setup Failed! Unable to register SFE globally: " + err.message);
    console.error("  Skipping to local tests...\n");
  }

  // --- 2. EXECUTION PHASE: Run all suites ---
  for (const suite of TEST_SUITES) {
    console.log(`🚀 Running Suite: ${suite.name} (${suite.path})...`);
    const suiteStart = Date.now();
    let status = "PASSED";
    let errorLog = "";

    try {
      execSync(`node "${path.join(PACKAGE_ROOT, suite.path)}"`, { stdio: 'pipe' });
    } catch (err) {
      status = "FAILED";
      errorLog = err.stdout.toString() + "\n" + err.stderr.toString();
    }

    const duration = Date.now() - suiteStart;
    results.push({ name: suite.name, path: suite.path, status, duration, errorLog });
    
    if (status === "PASSED") {
      console.log(`  🟢 Passed in ${duration}ms.\n`);
    } else {
      console.log(`  🔴 FAILED in ${duration}ms.\n`);
    }
  }

  // --- 3. TEARDOWN PHASE: Global Uninstallation ---
  if (installationSucceeded) {
    console.log("🧹 [TEARDOWN] Purging global package installations...");
    const teardownStart = Date.now();
    try {
      execSync(`node "${path.join(PACKAGE_ROOT, UNINSTALLER_PATH)}"`, { stdio: 'ignore' });
      console.log(`  ✓ Teardown completed successfully in ${Date.now() - teardownStart}ms.\n`);
    } catch (err) {
      console.error("  ⚠️ Warning: Teardown uninstallation failed: " + err.message);
    }
  }

  // --- 4. REPORT AGGREGATION ---
  const totalDuration = Date.now() - startTime;
  let totalTests = results.length;
  let passedTests = results.filter(r => r.status === "PASSED").length;
  let failedTests = totalTests - passedTests;

  console.log("\n=========================================================");
  console.log("                  UNIFIED EXECUTION REPORT                ");
  console.log("=========================================================");
  console.log(String("Test Suite").padEnd(35) + "Status".padEnd(12) + "Duration");
  console.log("---------------------------------------------------------");
  
  results.forEach(r => {
    const statusStr = r.status === "PASSED" ? "\x1b[32mPASSED\x1b[0m" : "\x1b[31mFAILED\x1b[0m";
    console.log(r.name.padEnd(35) + statusStr.padEnd(21) + `${r.duration}ms`);
  });
  console.log("=========================================================");
  console.log(`Total duration: ${totalDuration}ms`);
  console.log(`Suites executed: ${totalTests} | Passed: \x1b[32m${passedTests}\x1b[0m | Failed: \x1b[31m${failedTests}\x1b[0m`);
  console.log("=========================================================\n");

  // Print failure details if any
  if (failedTests > 0) {
    console.log("🔴 FAILURE DETAILS:");
    results.filter(r => r.status === "FAILED").forEach(r => {
      console.log(`\n--- [${r.name}] ---`);
      console.log(r.errorLog);
    });
    process.exit(1);
  } else {
    console.log("🎉 All test suites passed successfully!");
    process.exit(0);
  }
}

executeTestSuite();
