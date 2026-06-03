/**
 * Unit Test Suite for SFE 0.7.5 Defensive Error Diagnostics
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const TEST_DIR = path.join(PACKAGE_ROOT, 'output_test/test_defensive_error_sandbox');

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function runTests() {
  console.log("=====================================================");
  console.log("    Running SFE 0.7.5 Defensive Error Diagnostics     ");
  console.log("=====================================================\n");

  try {
    cleanDirectory(TEST_DIR);
    fs.mkdirSync(TEST_DIR, { recursive: true });

    // 1. Scaffold a test blueprint using node CLI entry
    console.log("🧪 Step 1: Scaffolding test environment with --blueprint...");
    const testBlueprint = {
      projectName: path.join(TEST_DIR, "error-gate-test"),
      skills: [
        {
          name: "test-js-skill",
          archetype: "developer",
          description: "Test JavaScript skill",
          language: "js",
          triggers: ["/test-js"],
          tags: ["test"]
        },
        {
          name: "test-py-skill",
          archetype: "developer",
          description: "Test Python skill",
          language: "py",
          triggers: ["/test-py"],
          tags: ["test"]
        }
      ],
      agents: [
        {
          name: "test-developer-agent",
          role: "Developer",
          description: "Test developer agent",
          allowedSkills: ["test-js-skill", "test-py-skill"],
          toolGroups: ["read_file", "write_file", "command"]
        }
      ]
    };

    const blueprintPath = path.join(TEST_DIR, 'blueprint.json');
    fs.writeFileSync(blueprintPath, JSON.stringify(testBlueprint, null, 2), 'utf-8');

    // Run the compiler to scaffold the skills
    const cliBinary = path.join(PACKAGE_ROOT, 'cli_bin/cli.js');
    execSync(`node "${cliBinary}" --blueprint "${blueprintPath}" --force`, {
      env: { ...process.env, SENFIDE_TEST_DIR: TEST_DIR },
      stdio: 'ignore'
    });

    const jsCheckScript = path.join(TEST_DIR, 'error-gate-test/skillsets/test-js-skill/scripts/security_check.js');
    const pyCheckScript = path.join(TEST_DIR, 'error-gate-test/skillsets/test-py-skill/scripts/security_check.py');

    if (!fs.existsSync(jsCheckScript)) {
      throw new Error(`Scaffold failed: ${jsCheckScript} is missing.`);
    }
    if (!fs.existsSync(pyCheckScript)) {
      throw new Error(`Scaffold failed: ${pyCheckScript} is missing.`);
    }
    console.log("  ✓ Scaffold successfully completed.");

    // 2. Execute JS Script with violation to trigger Catch block
    console.log("\n🧪 Step 2: Running JS script with error trigger...");
    try {
      execSync(`node "${jsCheckScript}"`, {
        env: { ...process.env, UNEXPECTED_PLAIN_TEXT_KEY: "my-fake-secret-key" },
        stdio: 'pipe'
      });
      throw new Error("Assertion failed: JS verification script exited with 0 instead of throwing an error.");
    } catch (err) {
      const output = err.stderr ? err.stderr.toString() : err.stdout.toString();
      console.log("  [Output Captured]:");
      console.log(output.split('\n').map(l => `    > ${l}`).join('\n'));

      // Assertions
      if (!output.includes("JAVASCRIPT EXECUTION ERROR DIAGNOSTICS")) {
        throw new Error("Assertion failed: Output missing JAVASCRIPT DIAGNOSTICS header.");
      }
      if (!output.includes("- **Message**: Security violation: Hardcoded API keys")) {
        throw new Error("Assertion failed: Output missing exception message description.");
      }
      if (!output.includes("- **Stack Trace**:")) {
        throw new Error("Assertion failed: Output missing stack trace details.");
      }
      if (!output.includes("- **Action Plan**: Inspect the stack trace.")) {
        throw new Error("Assertion failed: Output missing diagnostic action plan.");
      }
      console.log("  🟢 JS Defensive Exception Wrapper Verified Successfully!");
    }

    // 3. Execute Python Script with violation to trigger Except block
    console.log("\n🧪 Step 3: Running Python script with error trigger...");
    let hasPython = false;
    try {
      execSync('python --version', { stdio: 'ignore' });
      hasPython = true;
    } catch (e) {
      console.log("  ⚠️ Python is not installed or not in PATH. Skipping Python wrapper assertions.");
    }

    if (hasPython) {
      try {
        execSync(`python "${pyCheckScript}"`, {
          env: { ...process.env, UNEXPECTED_PLAIN_TEXT_KEY: "my-fake-secret-key" },
          stdio: 'pipe'
        });
        throw new Error("Assertion failed: Python verification script exited with 0 instead of throwing an error.");
      } catch (err) {
        const output = err.stderr ? err.stderr.toString() : err.stdout.toString();
        console.log("  [Output Captured]:");
        console.log(output.split('\n').map(l => `    > ${l}`).join('\n'));

        // Assertions
        if (!output.includes("PYTHON EXECUTION ERROR DIAGNOSTICS")) {
          throw new Error("Assertion failed: Output missing PYTHON DIAGNOSTICS header.");
        }
        if (!output.includes("- **Message**: Security violation: Hardcoded API keys")) {
          throw new Error("Assertion failed: Output missing exception message description.");
        }
        if (!output.includes("- **Traceback**:")) {
          throw new Error("Assertion failed: Output missing Python traceback details.");
        }
        if (!output.includes("- **Action Plan**: Review the error trace above.")) {
          throw new Error("Assertion failed: Output missing diagnostic action plan.");
        }
        console.log("  🟢 Python Defensive Exception Wrapper Verified Successfully!");
      }
    }

    console.log("\n🧹 Cleaning up test directory...");
    cleanDirectory(TEST_DIR);

    console.log("\n=====================================================");
    console.log("🎉 All Defensive Error Diagnostic Tests Passed Perfectly!");
    console.log("=====================================================");
    process.exit(0);

  } catch (globalErr) {
    console.error(`\n❌ Tests failed: ${globalErr.message}`);
    cleanDirectory(TEST_DIR);
    process.exit(1);
  }
}

runTests();
