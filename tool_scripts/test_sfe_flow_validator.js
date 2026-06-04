/**
 * Unit and E2E Tests for the SFE Temporal Flow Validator
 * 
 * Sets up isolated test structures in scratch/ and executes programmatic assertions.
 * Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const TEST_DIR = path.resolve(PACKAGE_ROOT, 'scratch/test_flow_validator');
const TEMPLATE_PATH = path.resolve(PACKAGE_ROOT, 'templates/verify_sfe_flow_template.js');
const SCRIPT_PATH = path.resolve(TEST_DIR, 'tool_scripts/verify_sfe_flow.js');

function setupTestDir() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'tool_scripts'), { recursive: true });
  fs.copyFileSync(TEMPLATE_PATH, SCRIPT_PATH);
}

function runValidator(env = {}) {
  try {
    execSync(`node "${SCRIPT_PATH}"`, {
      cwd: TEST_DIR,
      env: { ...process.env, ...env },
      stdio: 'pipe'
    });
    return { status: 0, stdout: "", stderr: "" };
  } catch (err) {
    return {
      status: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : "",
      stderr: err.stderr ? err.stderr.toString() : ""
    };
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function testSuite() {
  console.log("=========================================================");
  console.log("      SFE TEMPORAL FLOW VALIDATOR INTEGRATION TESTS      ");
  console.log("=========================================================\n");

  // Assign test directory isolation to prevent polluting user settings
  process.env.SENFIDE_TEST_DIR = TEST_DIR;

  // --- Test Case 1: Greenfield (No BACKLOG.md, no code) ---
  console.log("🧪 Test Case 1: Greenfield Workspace...");
  setupTestDir();
  const res1 = runValidator();
  assertEqual(res1.status, 0, "Greenfield workspace must pass.");
  console.log("  🟢 Passed.\n");

  // --- Test Case 2: Greenfield with BACKLOG.md but no code ---
  console.log("🧪 Test Case 2: Backlog exists but zero code written...");
  setupTestDir();
  fs.writeFileSync(path.join(TEST_DIR, 'BACKLOG.md'), '# Backlog\n', 'utf-8');
  const res2 = runValidator();
  assertEqual(res2.status, 0, "Workspace with only backlog must pass.");
  console.log("  🟢 Passed.\n");

  // --- Test Case 3: Violation (Simultaneous backlog and code) ---
  console.log("🧪 Test Case 3: Simultaneous Backlog & Code Modifications (Bypass)...");
  setupTestDir();
  fs.writeFileSync(path.join(TEST_DIR, 'BACKLOG.md'), '# Backlog\n', 'utf-8');
  fs.writeFileSync(path.join(TEST_DIR, 'index.js'), 'console.log("hello");\n', 'utf-8');
  const res3 = runValidator();
  assertEqual(res3.status, 1, "Simultaneous modifications must fail.");
  if (!res3.stderr.includes("SFE FLOW ENFORCEMENT FAILURE")) {
    throw new Error(`Expected flow failure error in stderr, got:\n${res3.stderr}`);
  }
  console.log("  🟢 Passed (Correctly rejected bypass).\n");

  // --- Test Case 4: Sequential (Timed sequential modifications) ---
  console.log("🧪 Test Case 4: Sequential Timed Modifications (>15s delay)...");
  setupTestDir();
  const backlogFile = path.join(TEST_DIR, 'BACKLOG.md');
  const codeFile = path.join(TEST_DIR, 'index.js');
  
  fs.writeFileSync(backlogFile, '# Backlog\n', 'utf-8');
  
  // Set BACKLOG.md modification time to 20 seconds ago
  const oldTime = (Date.now() - 20000) / 1000;
  fs.utimesSync(backlogFile, oldTime, oldTime);
  
  // Write code file now
  fs.writeFileSync(codeFile, 'console.log("hello");\n', 'utf-8');
  
  const res4 = runValidator();
  assertEqual(res4.status, 0, "Sequential changes with delay must pass.");
  console.log("  🟢 Passed.\n");

  // --- Test Case 5: Env Bypass Override ---
  console.log("🧪 Test Case 5: Environment Override Bypass (SFE_BYPASS=true)...");
  setupTestDir();
  fs.writeFileSync(path.join(TEST_DIR, 'BACKLOG.md'), '# Backlog\n', 'utf-8');
  fs.writeFileSync(path.join(TEST_DIR, 'index.js'), 'console.log("hello");\n', 'utf-8');
  const res5 = runValidator({ SFE_BYPASS: 'true' });
  assertEqual(res5.status, 0, "Environment variable SFE_BYPASS must override validator checks.");
  console.log("  🟢 Passed.\n");

  // --- Test Case 6: Config Bypass Override ---
  console.log("🧪 Test Case 6: Config State Bypass (bypassEnforcement=true)...");
  setupTestDir();
  const localWorkspaceDir = path.join(TEST_DIR, 'local-workspace');
  fs.mkdirSync(localWorkspaceDir, { recursive: true });
  fs.writeFileSync(
    path.join(localWorkspaceDir, 'state.json'),
    JSON.stringify({ bypassEnforcement: true }),
    'utf-8'
  );
  fs.writeFileSync(path.join(TEST_DIR, 'BACKLOG.md'), '# Backlog\n', 'utf-8');
  fs.writeFileSync(path.join(TEST_DIR, 'index.js'), 'console.log("hello");\n', 'utf-8');
  const res6 = runValidator();
  assertEqual(res6.status, 0, "bypassEnforcement configuration must override validator checks.");
  console.log("  🟢 Passed.\n");

  // Cleanup
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }

  console.log("🎉 All 6 validator test cases passed successfully!");
}

testSuite();
