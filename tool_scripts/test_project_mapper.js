/**
 * test_project_mapper.js
 * 
 * Unit and integration tests for the SFE 0.8.0 Project Mapping static analyzer.
 * Verifies stack analysis, fallback, and blueprint synthesis across mock workspaces.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic.
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { detectProjectStack, generateMapReport, scanFiles } from './project_mapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_ROOT = path.resolve(__dirname, '../output_test/project-mapper-test');

/**
 * Helper to recursively create folders and write mock files.
 */
function createMockFile(filePath, content = '') {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Initializes mock workspaces for testing.
 */
function setupMockWorkspaces() {
  if (fs.existsSync(TEST_ROOT)) {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_ROOT, { recursive: true });

  // 1. Mock Workspace A: JS Node project (with Jest, Docker)
  const wsA = path.join(TEST_ROOT, 'node-project');
  createMockFile(path.join(wsA, 'package.json'), JSON.stringify({
    name: "mock-node-app",
    dependencies: { "pg": "^8.0.0" },
    devDependencies: { "jest": "^29.0.0" }
  }));
  createMockFile(path.join(wsA, 'src/index.js'), '// Entry point');
  createMockFile(path.join(wsA, 'Dockerfile'), 'FROM node:18');

  // 2. Mock Workspace B: Python project (with pytest)
  const wsB = path.join(TEST_ROOT, 'python-project');
  createMockFile(path.join(wsB, 'requirements.txt'), 'pytest==7.0.0\nSQLAlchemy==1.4.0\npsycopg2==2.9.1');
  createMockFile(path.join(wsB, 'app/main.py'), '# Python main');

  // 3. Mock Workspace C: Agnostic C++ project (other languages fallback)
  const wsC = path.join(TEST_ROOT, 'cpp-project');
  createMockFile(path.join(wsC, 'src/main.cpp'), '#include <iostream>');
  createMockFile(path.join(wsC, 'CMakeLists.txt'), '# CMake config');

  // 4. Mock Workspace D: Non-coding project (prose fallback)
  const wsD = path.join(TEST_ROOT, 'prose-project');
  createMockFile(path.join(wsD, 'README.md'), '# Project readme');
  createMockFile(path.join(wsD, 'docs/outline.txt'), 'Editorial outline contents');
}

function runMapperTests() {
  console.log("=====================================================");
  console.log("      Running SFE Project Mapping Engine Tests       ");
  console.log("=====================================================\n");

  try {
    setupMockWorkspaces();
    console.log("🧹 Mock workspaces set up successfully.\n");

    // --- Test Case 1: scanFiles ---
    console.log("🧪 Test Case 1: scanFiles directory traversing...");
    const filesA = scanFiles(path.join(TEST_ROOT, 'node-project'));
    assert.strictEqual(filesA.length, 3, "Should find exactly 3 files in Node mock workspace");
    console.log("  ✓ Correct file count scanned.");

    // --- Test Case 2: JS Node Project Detection ---
    console.log("\n🧪 Test Case 2: Node/JS project stack mapping...");
    const infoA = detectProjectStack(filesA);
    assert.strictEqual(infoA.stack, 'js', "Should identify Javascript stack");
    assert.ok(infoA.isCoding, "Should identify as coding project");
    assert.ok(infoA.hasDocker, "Should identify Docker configuration");
    assert.ok(infoA.testFrameworks.includes('jest'), "Should identify Jest");
    assert.ok(infoA.databases.includes('postgres'), "Should identify PostgreSQL client pg");
    // Verify suggested archetypes
    assert.ok(infoA.archetypes.devops, "Should recommend DevOps archetype due to Dockerfile");
    assert.ok(infoA.archetypes.auditor, "Should recommend Auditor archetype due to Database connection");
    console.log("  ✓ Javascript/Node stack features detected correctly.");

    // --- Test Case 3: Python Project Detection ---
    console.log("\n🧪 Test Case 3: Python project stack mapping...");
    const filesB = scanFiles(path.join(TEST_ROOT, 'python-project'));
    const infoB = detectProjectStack(filesB);
    assert.strictEqual(infoB.stack, 'py', "Should identify Python stack");
    assert.ok(infoB.testFrameworks.includes('pytest'), "Should identify pytest framework");
    assert.ok(infoB.databases.includes('postgres'), "Should identify postgres through psycopg2/sqla checks");
    console.log("  ✓ Python stack features detected correctly.");

    // --- Test Case 4: Other Languages Cascade Fallback ---
    console.log("\n🧪 Test Case 4: Agnostic/Other languages cascade fallback...");
    const filesC = scanFiles(path.join(TEST_ROOT, 'cpp-project'));
    const infoC = detectProjectStack(filesC);
    assert.strictEqual(infoC.stack, 'default', "Should fall back to default agnostic stack");
    assert.ok(infoC.isCoding, "Should identify C++ project as coding task");
    assert.strictEqual(infoC.archetypes.developer.name, 'Developer (default)', "Developer stack name should be default");
    assert.ok(infoC.archetypes.developer.toolGroups.includes('command'), "Coding default stack developer must retain command permission");
    console.log("  ✓ Falls back gracefully to default agnostic execution stack.");

    // --- Test Case 5: Non-Coding Prose Fallback ---
    console.log("\n🧪 Test Case 5: Non-coding prose fallback mapping...");
    const filesD = scanFiles(path.join(TEST_ROOT, 'prose-project'));
    const infoD = detectProjectStack(filesD);
    assert.strictEqual(infoD.stack, 'default', "Should fall back to default stack");
    assert.strictEqual(infoD.isCoding, false, "Should identify prose project as non-coding");
    assert.strictEqual(infoD.archetypes.developer.name, 'Writer/Content Creator', "Developer archetype should map to Writer");
    assert.strictEqual(infoD.archetypes.pm.name, 'Editorial/Backlog Planner', "PM archetype should map to Editorial Planner");
    // Assert least-privilege permissions (no command permissions for non-coding)
    assert.strictEqual(infoD.archetypes.developer.toolGroups.includes('command'), false, "Non-coding developer must deny command permissions");
    assert.strictEqual(infoD.archetypes.qa.toolGroups.includes('command'), false, "Non-coding QA must deny command permissions");
    console.log("  ✓ Falls back gracefully to non-coding editorial stack with restricted permissions.");

    // --- Test Case 6: Blueprint Synthesis Verification ---
    console.log("\n🧪 Test Case 6: Blueprint synthesis mapping...");
    const report = generateMapReport(path.join(TEST_ROOT, 'node-project'));
    assert.strictEqual(report.blueprint.projectName, 'node-project', "Blueprint project name must be resolved");
    const devSkill = report.blueprint.skills.find(s => s.archetype === 'developer');
    assert.ok(devSkill, "Blueprint must contain developer skill");
    assert.strictEqual(devSkill.language, 'js', "Developer skill language should map to js");
    assert.ok(devSkill.customTasks.length > 0, "Developer skill should have custom tasks suggested");
    console.log("  ✓ Blueprint synthesized and task instructions generated successfully.");

    console.log("\n=====================================================");
    console.log("🎉 SFE Project Mapping Engine tests passed successfully!");
    console.log("=====================================================");
    
    // Cleanup mock workspaces
    try {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    } catch (e) {}

    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Mapping tests failed: ${err.message}`);
    console.error(err.stack);
    
    // Cleanup mock workspaces
    try {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    } catch (e) {}
    
    process.exit(1);
  }
}

runMapperTests();
