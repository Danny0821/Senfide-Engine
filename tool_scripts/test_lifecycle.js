/**
 * E2E Lifecycle Installation & Uninstallation Test Suite
 * 
 * Verifies system-wide installation and cleanup by mapping a mock user home profile,
 * executing the global installer/uninstaller, and asserting file creation/cleanup.
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
const INSTALLER_PATH = path.join(PACKAGE_ROOT, 'tool_scripts/install_global.js');
const UNINSTALLER_PATH = path.join(PACKAGE_ROOT, 'tool_scripts/uninstall_global.js');
const MOCK_HOME = path.join(PACKAGE_ROOT, 'output_test/lifecycle_home_sandbox');

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function runLifecycleTests() {
  console.log("=====================================================");
  console.log("          Running Global Lifecycle E2E Tests          ");
  console.log("=====================================================\n");

  try {
    cleanDirectory(MOCK_HOME);
    fs.mkdirSync(MOCK_HOME, { recursive: true });

    // Mock environment options (redirect homedir for OS resolution)
    const execEnv = {
      ...process.env,
      USERPROFILE: MOCK_HOME,
      HOME: MOCK_HOME,
      // Block actual system PATH registration during installation tests
      Path: process.env.Path
    };

    // --- SETUP: RUN GLOBAL INSTALL ---
    console.log("🧪 Test Case 1: Running global installation setup...");
    
    // Run installer
    const installLogs = execSync(`node "${INSTALLER_PATH}"`, { env: execEnv, encoding: 'utf8' });
    
    // Assert structural creations inside the isolated mock home profile
    const targetSkillsDirs = [
      path.join(MOCK_HOME, '.gemini/skills'),
      path.join(MOCK_HOME, '.gemini/antigravity/skills'),
      path.join(MOCK_HOME, '.gemini/antigravity-cli/skills'),
      path.join(MOCK_HOME, '.gemini/config/skills')
    ];

    const targetBinDir = path.join(MOCK_HOME, '.gemini/config/bin');

    // 1. Verify manifests copied to all quad paths
    targetSkillsDirs.forEach(dir => {
      assert.ok(fs.existsSync(path.join(dir, 'sfe-gen/SKILL.md')), `Missing sfe-gen manifest in: ${dir}`);
      assert.ok(fs.existsSync(path.join(dir, 'sfe-interview/SKILL.md')), `Missing sfe-interview manifest in: ${dir}`);
      assert.ok(fs.existsSync(path.join(dir, 'sfe-blueprint/SKILL.md')), `Missing sfe-blueprint manifest in: ${dir}`);
    });
    console.log("  ✓ Sync manifests verified across all quad-paths.");

    // 2. Verify Windows launcher files are compiled
    if (process.platform === 'win32') {
      assert.ok(fs.existsSync(path.join(targetBinDir, 'sfe.cmd')), "Missing sfe.cmd launcher.");
      assert.ok(fs.existsSync(path.join(targetBinDir, 'sfe.ps1')), "Missing sfe.ps1 launcher.");
      assert.ok(fs.existsSync(path.join(targetBinDir, 'sfe_cli.target')), "Missing sfe_cli.target tracker.");

      const targetPath = fs.readFileSync(path.join(targetBinDir, 'sfe_cli.target'), 'utf8').trim();
      const expectedPath = path.join(PACKAGE_ROOT, 'cli_bin/cli.js');
      assert.strictEqual(targetPath, expectedPath, "Launcher target path mismatch.");
      console.log("  ✓ Windows launcher binaries and targets compiled successfully.");
    }

    console.log("  \x1b[32m🟢 Test Case 1 passed successfully!\x1b[0m");

    // --- TEARDOWN: RUN GLOBAL UNINSTALL ---
    console.log("\n🧪 Test Case 2: Running global uninstallation teardown...");

    // Run uninstaller
    const uninstallLogs = execSync(`node "${UNINSTALLER_PATH}"`, { env: execEnv, encoding: 'utf8' });

    // Assert complete structural cleanup inside the isolated mock home profile
    targetSkillsDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        assert.ok(!fs.existsSync(path.join(dir, 'sfe-gen')), `sfe-gen folder was not deleted in: ${dir}`);
        assert.ok(!fs.existsSync(path.join(dir, 'sfe-interview')), `sfe-interview folder was not deleted in: ${dir}`);
        assert.ok(!fs.existsSync(path.join(dir, 'sfe-blueprint')), `sfe-blueprint folder was not deleted in: ${dir}`);
      }
    });
    console.log("  ✓ Sync manifests purged cleanly across all quad-paths.");

    if (process.platform === 'win32') {
      assert.ok(!fs.existsSync(path.join(targetBinDir, 'sfe.cmd')), "sfe.cmd launcher was not deleted.");
      assert.ok(!fs.existsSync(path.join(targetBinDir, 'sfe.ps1')), "sfe.ps1 launcher was not deleted.");
      console.log("  ✓ Windows launcher binaries deleted successfully.");
    }

    console.log("  \x1b[32m🟢 Test Case 2 passed successfully!\x1b[0m");

    // Clean sandbox directory
    cleanDirectory(MOCK_HOME);
    console.log("\n=====================================================");
    console.log("🎉 Global Lifecycle E2E Tests passed successfully!   ");
    console.log("=====================================================");
    process.exit(0);

  } catch (globalErr) {
    console.error(`\n❌ Lifecycle tests failed: ${globalErr.message}`);
    cleanDirectory(MOCK_HOME);
    process.exit(1);
  }
}

runLifecycleTests();
