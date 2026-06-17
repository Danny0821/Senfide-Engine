/**
 * Manual Sandbox Simulation Suite
 * 
 * Verifies that the generator CLI package functions perfectly
 * by programmatically scaffolding inside a separate sandbox-project folder.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scaffoldSkill } from './generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sandbox project target
const SANDBOX_DIR = path.resolve(__dirname, '../output_test/sandbox-project/file-security-scanner');

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Assertion failed: Sandbox file missing at ${filePath}`);
  }
  console.log(`  ✓ Sandbox Verified: ${path.basename(filePath)} exists.`);
}

function runSimulation() {
  console.log("=====================================================");
  console.log("     Starting Manual Sandbox Package Simulation       ");
  console.log("=====================================================\n");

  try {
    // 1. Clean old sandbox
    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
      console.log("🧹 Cleaned old sandbox-project folder.");
    }

    // 2. Trigger scaffolding
    console.log("🧪 Simulating package execution targeting sandbox-project...");
    scaffoldSkill({
      name: 'file-security-scanner',
      description: 'Scan files for credentials and toxic shell commands.',
      tags: 'security, files, audit',
      targetDir: SANDBOX_DIR
    });

    // 3. Assertions
    console.log("\n🧪 Running sandbox output assertions...");
    assertExists(path.join(SANDBOX_DIR, 'SKILL.md'));
    assertExists(path.join(SANDBOX_DIR, 'lessons_index.md'));
    assertExists(path.join(SANDBOX_DIR, 'references/playbook.md'));
    assertExists(path.join(SANDBOX_DIR, 'evals/evals.json'));
    assertExists(path.join(SANDBOX_DIR, 'references'));
    assertExists(path.join(SANDBOX_DIR, 'scripts/security_check.js'));

    console.log("\n=====================================================");
    console.log("🎉 Manual Sandbox Package Simulation passed successfully!");
    console.log("=====================================================");
  } catch (err) {
    console.error(`\n❌ Sandbox Simulation failed: ${err.message}`);
    process.exit(1);
  }
}

runSimulation();
