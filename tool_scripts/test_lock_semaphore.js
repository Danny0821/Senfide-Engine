/**
 * Concurrency Lock Semaphore Integration Test Suite
 * 
 * Asserts file locking contentions, retries, backoffs, and timeout limits
 * using the production locking mechanism in cli_bin/cli.js.
 * 
 * Zero external dependencies.
 */

import { exec, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(PACKAGE_ROOT, 'cli_bin/cli.js');
const TEST_DIR = path.join(PACKAGE_ROOT, 'output_test/lock_test_workspace');

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function runLockTests() {
  console.log("=====================================================");
  console.log("          Running Concurrency Lock Semaphore Tests    ");
  console.log("=====================================================\n");

  try {
    cleanDirectory(TEST_DIR);
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // 1. Create a dummy blueprint JSON
    const blueprintPath = path.join(TEST_DIR, 'dummy_blueprint.json');
    const dummyBlueprint = {
      projectName: path.join(TEST_DIR, 'scaffolded_project'),
      skills: [
        {
          name: "test-lock-skill",
          archetype: "developer",
          description: "Test lock skill",
          language: "js",
          triggers: ["/test-lock"],
          tags: ["lock"]
        }
      ],
      agents: [
        {
          name: "test-lock-agent",
          role: "Developer",
          description: "Developer agent",
          allowedSkills: ["test-lock-skill"]
        }
      ]
    };
    fs.writeFileSync(blueprintPath, JSON.stringify(dummyBlueprint, null, 2), 'utf8');

    const lockFilePath = `${blueprintPath}.lock`;

    // --- TEST 1: Lock Timeout on Contention ---
    console.log("🧪 Test Case 1: Verifying lock timeout under indefinite lock contention...");
    
    // Hold the lock file manually
    fs.writeFileSync(lockFilePath, 'dummy-lock-content', 'utf8');

    try {
      // Execute SFE and wait for it to fail after 10 retries
      execSync(`node "${CLI_PATH}" --blueprint "${blueprintPath}" --force`, { stdio: 'pipe' });
      assert.fail("CLI should have timed out due to lock contention.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for lock timeout.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Timeout acquiring lock on"), "Output should contain timeout error: " + stderr);
      console.log("  ✓ Caught expected lock timeout exception.");
      console.log("  \x1b[32m🟢 Test Case 1 passed successfully!\x1b[0m");
    }

    // Clean lock file
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
    }

    // --- TEST 2: Lock Release and Queue Resumption ---
    console.log("\n🧪 Test Case 2: Verifying lock release and queue resumption...");

    // 1. Hold lock manually again
    fs.writeFileSync(lockFilePath, 'dummy-lock-content', 'utf8');

    // 2. Start SFE blueprint execution asynchronously in background
    let childExited = false;
    let childStatus = null;
    let childError = null;

    console.log("  -> Launching CLI subprocess in background (will block waiting for lock)...");
    const child = exec(`node "${CLI_PATH}" --blueprint "${blueprintPath}" --force`, (err) => {
      childExited = true;
      if (err) {
        childStatus = err.code || 1;
        childError = err.message;
      } else {
        childStatus = 0;
      }
    });

    // 3. Sleep 600ms (enough for 2-3 retries to occur)
    await new Promise(resolve => setTimeout(resolve, 600));
    assert.strictEqual(childExited, false, "Child process should still be waiting for the lock.");
    console.log("  -> Subprocess is actively blocked and retrying.");

    // 4. Release lock manually
    console.log("  -> Releasing lock file manually on host...");
    fs.unlinkSync(lockFilePath);

    // 5. Wait for background process to finish (up to 5 seconds)
    let waited = 0;
    while (!childExited && waited < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waited++;
    }

    assert.ok(childExited, "Background CLI process did not complete within timeout.");
    assert.strictEqual(childStatus, 0, `Background process failed with exit code ${childStatus}: ${childError}`);
    console.log("  ✓ Subprocess successfully detected lock release, acquired lock, and completed.");
    console.log("  \x1b[32m🟢 Test Case 2 passed successfully!\x1b[0m");

    // Clean up
    cleanDirectory(TEST_DIR);
    console.log("\n=====================================================");
    console.log("🎉 All Concurrency Lock Semaphore Tests passed!");
    console.log("=====================================================");
    process.exit(0);

  } catch (globalErr) {
    console.error(`\n❌ Lock semaphore tests failed: ${globalErr.message}`);
    cleanDirectory(TEST_DIR);
    process.exit(1);
  }
}

runLockTests();
