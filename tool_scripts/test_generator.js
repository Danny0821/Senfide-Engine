/**
 * Verification & Test Suite for Senfide Engine Scaffolder
 * Runs programmatic generation and asserts correct file structure creation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scaffoldSkillSystem, scaffoldHook, scaffoldAgent } from './generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root path for output tests
const TEST_OUTPUT_DIR = path.resolve(__dirname, '../output_test');
process.env.SENFIDE_TEST_DIR = path.join(TEST_OUTPUT_DIR, 'test-registry');

function cleanup() {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    try {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
      console.log("🧹 Cleaned up old test directory.");
    } catch (e) {
      console.warn("⚠️ Warning: Failed to fully clean old test directory (file locked):", e.message);
    }
  }
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Assertion failed: File does not exist at ${filePath}`);
  }
  console.log(`  ✓ Verified file exists: ${path.basename(filePath)}`);
}

function assertFileContains(filePath, substring) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Assertion failed: File does not exist at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes(substring)) {
    throw new Error(`Assertion failed: File ${filePath} does not contain expected substring "${substring}"`);
  }
  console.log(`  ✓ Verified file ${path.basename(filePath)} contains: "${substring.trim()}"`);
}

async function runTests() {
  console.log("=====================================================");
  console.log("   Running Senfide Engine Programmatic Tests         ");
  console.log("=====================================================\n");

  cleanup();

  try {
    // 1. Test Skill System / Multi-Agent Scaffolding
    console.log("🧪 Test Case 1: Scaffolding a Coordinated Skill System...");
    const systemDir = path.join(TEST_OUTPUT_DIR, 'python-coding-agency');
    await scaffoldSkillSystem({
      name: 'python-coding-agency',
      orchestrator: 'coding-coordinator',
      subSkillsText: 'python-audit, python-fixer',
      targetDir: systemDir
    });

    // Assert system files
    assertExists(path.join(systemDir, 'SYSTEM.md'));
    assertExists(path.join(systemDir, 'lessons_index.md'));
    assertExists(path.join(systemDir, 'playbook.md'));
    
    // Assert base structure files
    assertExists(path.join(systemDir, '.sfe-version'));
    assertFileContains(path.join(systemDir, '.sfe-version'), '0.6.9');
    assertExists(path.join(systemDir, 'local-workspace/sfe-mock.example'));
    assertExists(path.join(systemDir, '.gitignore'));
    assertFileContains(path.join(systemDir, '.gitignore'), 'local-workspace/');
    assertFileContains(path.join(systemDir, '.gitignore'), 'sfe-mock.env');

    // Assert sub-skills
    assertExists(path.join(systemDir, 'skillsets/python-audit/SKILL.md'));
    assertFileContains(path.join(systemDir, 'skillsets/python-audit/SKILL.md'), 'AST Security Firewalls');
    assertFileContains(path.join(systemDir, 'skillsets/python-audit/SKILL.md'), 'AST Dependency Fallbacks');
    assertExists(path.join(systemDir, 'skillsets/python-audit/lessons_index.md'));
    assertExists(path.join(systemDir, 'skillsets/python-audit/playbook.md'));
    assertExists(path.join(systemDir, 'skillsets/python-audit/scripts/security_check.py'));
    assertExists(path.join(systemDir, 'skillsets/python-audit/evals/evals.json'));
    assertExists(path.join(systemDir, 'skillsets/python-audit/references'));

    assertExists(path.join(systemDir, 'skillsets/python-fixer/SKILL.md'));
    assertFileContains(path.join(systemDir, 'skillsets/python-fixer/SKILL.md'), 'Two-Stage Type-Gating & TDD Loop');
    assertExists(path.join(systemDir, 'skillsets/python-fixer/lessons_index.md'));
    assertExists(path.join(systemDir, 'skillsets/python-fixer/playbook.md'));
    assertExists(path.join(systemDir, 'skillsets/python-fixer/evals/evals.json'));
    assertExists(path.join(systemDir, 'skillsets/python-fixer/references'));

    // Assert sub-agents
    assertExists(path.join(systemDir, 'agents/python-audit_agent/AGENT.md'));
    assertExists(path.join(systemDir, 'agents/python-fixer_agent/AGENT.md'));

    console.log("\n🟢 Test Case 1 passed successfully!\n");

    // 2. Test Standalone Agent Hook Rules
    console.log("🧪 Test Case 2: Scaffolding Standalone Hook...");
    const hookDir = path.join(TEST_OUTPUT_DIR, 'git-rules');
    scaffoldHook({
      name: 'leak_scanner',
      events: 'pre-commit',
      filePatterns: '*.py',
      severity: 'block',
      targetDir: hookDir
    });

    assertExists(path.join(hookDir, 'leak_scanner_hook.md'));
    console.log("\n🟢 Test Case 2 passed successfully!\n");

    // 3. Test Standalone Agent
    console.log("🧪 Test Case 3: Scaffolding Standalone Agent Profile...");
    const agentDir = path.join(TEST_OUTPUT_DIR, 'auditor-agent');
    scaffoldAgent({
      name: 'code-auditor',
      description: 'Audit TypeScript/Javascript code.',
      role: 'security expert',
      allowedSkills: 'typescript-audit',
      targetDir: agentDir
    });

    assertExists(path.join(agentDir, 'AGENT.md'));
    console.log("\n🟢 Test Case 3 passed successfully!\n");

    console.log("=====================================================");
    console.log("🎉 All programmatic scaffolding tests passed successfully!");
    console.log("=====================================================");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Test suite failed: ${err.message}`);
    process.exit(1);
  }
}

runTests();
