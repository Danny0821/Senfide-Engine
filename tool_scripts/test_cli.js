/**
 * CLI Integration Test Suite for Senfide Engine
 * 
 * Verifies flag routing, help logs, option fallbacks, and parameter error cases
 * by executing the compiled CLI entry point (cli_bin/cli.js) under various scenarios.
 * 
 * Zero external dependencies.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(PACKAGE_ROOT, 'cli_bin/cli.js');

function runCliTests() {
  console.log("=====================================================");
  console.log("             Running SFE CLI Integration Tests        ");
  console.log("=====================================================\n");

  try {
    // 1. Test help flag (-h / --help)
    console.log("🧪 Test Case 1: Verifying --help flag...");
    const helpOutput = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf8' });
    assert.ok(helpOutput.includes("Usage: sfe [options]"), "Help output missing Usage description.");
    assert.ok(helpOutput.includes("--install"), "Help output missing --install option.");
    assert.ok(helpOutput.includes("--blueprint"), "Help output missing --blueprint option.");
    console.log("  🟢 Test Case 1 passed successfully!");

    // 2. Test default fallback (no options)
    console.log("\n🧪 Test Case 2: Verifying no options default fallback...");
    const defaultOutput = execSync(`node "${CLI_PATH}"`, { encoding: 'utf8' });
    assert.ok(defaultOutput.includes("Conversational-First Onboarding is active!"), "Default printout missing welcome instructions.");
    assert.ok(defaultOutput.includes("Usage: sfe [options]"), "Default printout missing options summary.");
    console.log("  🟢 Test Case 2 passed successfully!");

    // 3. Test --search error case (missing search term)
    console.log("\n🧪 Test Case 3: Verifying --search with missing term...");
    try {
      execSync(`node "${CLI_PATH}" --search`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code when term is missing.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for missing term.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Please specify a search term"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 3 passed successfully!");
    }

    // 4. Test --remove error case (missing name)
    console.log("\n🧪 Test Case 4: Verifying --remove with missing name...");
    try {
      execSync(`node "${CLI_PATH}" --remove`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code when name is missing.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for missing name.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Please specify a skill name to remove"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 4 passed successfully!");
    }

    // 5. Test --blueprint error case (missing path)
    console.log("\n🧪 Test Case 5: Verifying --blueprint with missing path...");
    try {
      execSync(`node "${CLI_PATH}" --blueprint`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code when blueprint path is missing.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for missing blueprint path.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Please specify a blueprint JSON file path"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 5 passed successfully!");
    }

    // 6. Test --blueprint error case (non-existent path)
    console.log("\n🧪 Test Case 6: Verifying --blueprint with invalid path...");
    try {
      execSync(`node "${CLI_PATH}" --blueprint "scratch/missing_blueprint.json"`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code for non-existent blueprint path.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for invalid path.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Blueprint file does not exist"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 6 passed successfully!");
    }

    // 7. Test --scan error case (non-existent path)
    console.log("\n🧪 Test Case 7: Verifying --scan with invalid path...");
    try {
      execSync(`node "${CLI_PATH}" --scan "C:/invalid/scan/path"`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code for non-existent scan folder.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for invalid path.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Target scan folder does not exist"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 7 passed successfully!");
    }
    // 8. Test --map error case (non-existent path)
    console.log("\n🧪 Test Case 8: Verifying --map with invalid path...");
    try {
      execSync(`node "${CLI_PATH}" --map "C:/invalid/map/path"`, { stdio: 'pipe' });
      assert.fail("CLI should have exited with error code for non-existent map folder.");
    } catch (err) {
      assert.strictEqual(err.status, 1, "Exit code should be 1 for invalid path.");
      const stderr = err.stderr ? err.stderr.toString() : err.stdout.toString();
      assert.ok(stderr.includes("Target map folder does not exist"), "Unexpected error message: " + stderr);
      console.log("  🟢 Test Case 8 passed successfully!");
    }

    // 9. Test --map execution (valid path)
    console.log("\n🧪 Test Case 9: Verifying --map execution with valid path...");
    const testDir = path.join(PACKAGE_ROOT, 'tool_scripts');
    const mapOutput = execSync(`node "${CLI_PATH}" --map "${testDir}"`, { encoding: 'utf8' });
    assert.ok(mapOutput.includes("SFE Project Mapping Analysis Report"), "Map output missing summary report.");
    assert.ok(mapOutput.includes("Suggested SFE DevTeam Archetypes"), "Map output missing archetypes suggestion.");
    
    // Assert blueprint.json is written to process.cwd()/scratch/blueprint.json because it was run non-interactively
    const expectedBlueprint = path.join(process.cwd(), 'scratch/blueprint.json');
    assert.ok(fs.existsSync(expectedBlueprint), "Blueprint file not written in non-interactive mode.");
    
    // Clean up scratch/blueprint.json if created during test
    try {
      fs.unlinkSync(expectedBlueprint);
    } catch (e) {}
    console.log("  🟢 Test Case 9 passed successfully!");

    console.log("\n=====================================================");
    console.log("🎉 All SFE CLI Integration Tests passed successfully!");
    console.log("=====================================================");
    process.exit(0);

  } catch (globalErr) {
    console.error(`\n❌ CLI integration tests failed: ${globalErr.message}`);
    process.exit(1);
  }
}

runCliTests();
