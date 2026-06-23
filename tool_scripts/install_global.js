/**
 * Antigravity 2.0 Global Command Installer
 * 
 * Copies the slash command skill definitions to all standard global
 * Antigravity configuration directories, enabling system-wide access on Windows.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic (Code quality firewall).
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { syncSystemPath } from './path_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Target potential global configuration folders for Antigravity on Windows (Quad-Path Sync)
const GLOBAL_SKILLS_DIRS = [
  path.resolve(os.homedir(), '.gemini/skills'),
  path.resolve(os.homedir(), '.gemini/antigravity/skills'),
  path.resolve(os.homedir(), '.gemini/antigravity-cli/skills'),
  path.resolve(os.homedir(), '.gemini/config/skills')
];

const GLOBAL_TEMPLATES_DIRS = [
  path.resolve(os.homedir(), '.gemini/templates'),
  path.resolve(os.homedir(), '.gemini/antigravity/templates'),
  path.resolve(os.homedir(), '.gemini/antigravity-cli/templates'),
  path.resolve(os.homedir(), '.gemini/config/templates')
];

// Target global bin directory for Windows launchers
const GLOBAL_BIN_DIR = path.resolve(os.homedir(), '.gemini/config/bin');

// Source paths relative to package root (supports npx and local runs)
const LOCAL_GEN_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-gen');
const LOCAL_INTERVIEW_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-interview');
const LOCAL_BLUEPRINT_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-blueprint');
const LOCAL_UI_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-ui');
const LOCAL_MAP_PROJECT_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-map-project');
const LOCAL_IMPORT_PATH = path.join(PACKAGE_ROOT, 'command_manifests/sfe-import');

/**
 * Recursively copies a directory to a target destination in zero-dependency Node.js.
 */
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

/**
 * Safely copies the local slash command skill definitions to global user configuration.
 */
function installGlobally() {
  console.log("=========================================================");
  console.log("     Installing Senfide Engine System-Wide CLI           ");
  console.log("=========================================================\n");

  try {
    // 1. Verify local source files exist
    if (!fs.existsSync(LOCAL_GEN_PATH)) {
      throw new Error(`Source sfe-gen folder not found at ${LOCAL_GEN_PATH}.\nPlease ensure you run this script from the workspace root.`);
    }
    if (!fs.existsSync(LOCAL_INTERVIEW_PATH)) {
      throw new Error(`Source sfe-interview folder not found at ${LOCAL_INTERVIEW_PATH}.`);
    }
    if (!fs.existsSync(LOCAL_BLUEPRINT_PATH)) {
      throw new Error(`Source sfe-blueprint folder not found at ${LOCAL_BLUEPRINT_PATH}.`);
    }
    if (!fs.existsSync(LOCAL_UI_PATH)) {
      throw new Error(`Source sfe-ui folder not found at ${LOCAL_UI_PATH}.`);
    }
    if (!fs.existsSync(LOCAL_MAP_PROJECT_PATH)) {
      throw new Error(`Source sfe-map-project folder not found at ${LOCAL_MAP_PROJECT_PATH}.`);
    }
    if (!fs.existsSync(LOCAL_IMPORT_PATH)) {
      throw new Error(`Source sfe-import folder not found at ${LOCAL_IMPORT_PATH}.`);
    }

    // 2. Synchronize to all potential native slash command folders (Quad-Path Sync)
    console.log("📁 Syncing slash command manifests to native global folders...");
    GLOBAL_SKILLS_DIRS.forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Clean up outdated legacy flat generate.md file if present in this folder
        const legacyFlatFile = path.join(dir, 'generate.md');
        if (fs.existsSync(legacyFlatFile)) {
          fs.unlinkSync(legacyFlatFile);
        }

        // Clean up legacy flat/folder generate, agentic-interviewer, grill-blueprint if present
        const oldGenPath = path.join(dir, 'generate');
        if (fs.existsSync(oldGenPath)) {
          fs.rmSync(oldGenPath, { recursive: true, force: true });
        }
        const oldInterviewPath = path.join(dir, 'agentic-interviewer');
        if (fs.existsSync(oldInterviewPath)) {
          fs.rmSync(oldInterviewPath, { recursive: true, force: true });
        }
        const oldBlueprintPath = path.join(dir, 'grill-blueprint');
        if (fs.existsSync(oldBlueprintPath)) {
          fs.rmSync(oldBlueprintPath, { recursive: true, force: true });
        }

        // Copy /sfe-gen folder
        const targetGenPath = path.join(dir, 'sfe-gen');
        if (fs.existsSync(targetGenPath)) {
          fs.rmSync(targetGenPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_GEN_PATH, targetGenPath);
        
        // Copy /sfe-interview manifest folder
        const targetInterviewPath = path.join(dir, 'sfe-interview');
        if (fs.existsSync(targetInterviewPath)) {
          fs.rmSync(targetInterviewPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_INTERVIEW_PATH, targetInterviewPath);

        // Copy /sfe-blueprint manifest folder
        const targetBlueprintPath = path.join(dir, 'sfe-blueprint');
        if (fs.existsSync(targetBlueprintPath)) {
          fs.rmSync(targetBlueprintPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_BLUEPRINT_PATH, targetBlueprintPath);

        // Copy /sfe-ui manifest folder
        const targetUiPath = path.join(dir, 'sfe-ui');
        if (fs.existsSync(targetUiPath)) {
          fs.rmSync(targetUiPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_UI_PATH, targetUiPath);

        // Copy /sfe-map-project manifest folder
        const targetMapProjectPath = path.join(dir, 'sfe-map-project');
        if (fs.existsSync(targetMapProjectPath)) {
          fs.rmSync(targetMapProjectPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_MAP_PROJECT_PATH, targetMapProjectPath);

        // Copy /sfe-import manifest folder
        const targetImportPath = path.join(dir, 'sfe-import');
        if (fs.existsSync(targetImportPath)) {
          fs.rmSync(targetImportPath, { recursive: true, force: true });
        }
        copyFolderRecursiveSync(LOCAL_IMPORT_PATH, targetImportPath);

        console.log(`  🟢 Synced to: ${dir}`);
      } catch (dirErr) {
        console.warn(`  ⚠️ Could not write to directory ${dir}: ${dirErr.message}`);
      }
    });

    // 2.2 Synchronize reference templates (import guides)
    console.log("\n📁 Syncing reference templates to native global folders...");
    const LOCAL_TEMPLATES_SRC = path.join(PACKAGE_ROOT, 'examples/import_guides');
    if (fs.existsSync(LOCAL_TEMPLATES_SRC)) {
      GLOBAL_TEMPLATES_DIRS.forEach(dir => {
        try {
          const targetGuidesPath = path.join(dir, 'import_guides');
          if (fs.existsSync(targetGuidesPath)) {
            fs.rmSync(targetGuidesPath, { recursive: true, force: true });
          }
          copyFolderRecursiveSync(LOCAL_TEMPLATES_SRC, targetGuidesPath);
          console.log(`  🟢 Synced templates to: ${dir}`);
        } catch (dirErr) {
          console.warn(`  ⚠️ Could not write templates to directory ${dir}: ${dirErr.message}`);
        }
      });
    }

    // 3. Compile and write local Windows launcher files
    if (process.platform === 'win32') {
      console.log("\n🚀 Compiling native Windows CLI launcher executables...");
      if (!fs.existsSync(GLOBAL_BIN_DIR)) {
        fs.mkdirSync(GLOBAL_BIN_DIR, { recursive: true });
      }

      // Clean up legacy antigravity-gen launchers to avoid clutter
      const oldCmd = path.join(GLOBAL_BIN_DIR, 'antigravity-gen.cmd');
      if (fs.existsSync(oldCmd)) fs.unlinkSync(oldCmd);
      const oldPs1 = path.join(GLOBAL_BIN_DIR, 'antigravity-gen.ps1');
      if (fs.existsSync(oldPs1)) fs.unlinkSync(oldPs1);

      const cliPath = path.join(PACKAGE_ROOT, 'cli_bin/cli.js');
      const targetPathFile = path.join(GLOBAL_BIN_DIR, 'sfe_cli.target');
      fs.writeFileSync(targetPathFile, cliPath, 'utf8');

      const cmdLauncherContent = `@echo off
set "TARGET_FILE=%~dp0sfe_cli.target"
if not exist "%TARGET_FILE%" (
    npx --no-install sfe %*
    exit /b
)
set /p CLI_PATH=<"%TARGET_FILE%"
if exist "%CLI_PATH%" (
    node "%CLI_PATH%" %*
) else (
    npx --no-install sfe %*
)
exit /b`;

      const ps1LauncherContent = `$targetFile = Join-Path $PSScriptRoot "sfe_cli.target"
if (Test-Path $targetFile) {
    $cliPath = Get-Content $targetFile
    if ($cliPath -is [array]) {
        $cliPath = $cliPath[0]
    }
    if ($cliPath) {
        $cliPath = $cliPath.Trim()
        if (Test-Path $cliPath) {
            node "$cliPath" $args
            exit $LASTEXITCODE
        }
    }
}
npx --no-install sfe $args
exit $LASTEXITCODE`;

      fs.writeFileSync(path.join(GLOBAL_BIN_DIR, 'sfe.cmd'), cmdLauncherContent, 'utf8');
      fs.writeFileSync(path.join(GLOBAL_BIN_DIR, 'sfe.ps1'), ps1LauncherContent, 'utf8');
      console.log(`  🟢 Windows CLI Launchers compiled inside: ${GLOBAL_BIN_DIR}`);

      // Run native Windows PATH registration
      try {
        syncSystemPath();
      } catch (pathErr) {
        console.warn(`  ⚠️ Windows PATH sync failed: ${pathErr.message}`);
      }
    }

    console.log(`\n🟢 Success! System-wide registration complete.`);
    console.log("\n✨ The native slash commands are now active globally!");
    console.log("👉 You can now type `/sfe-gen`, `/sfe-interview`, `/sfe-blueprint`, `/sfe-ui`, `/sfe-map-project`, or `/sfe-import` inside your Windows agy client.");
    console.log("=========================================================");
  } catch (err) {
    console.error(`\n🔴 Installation failed: ${err.message}`);
    process.exit(1);
  }
}

setTimeout(installGlobally, 1000);
