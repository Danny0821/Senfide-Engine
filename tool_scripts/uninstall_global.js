/**
 * Senfide Engine Global Command Uninstaller
 * 
 * Safely removes all globally synchronized slash command definitions
 * and compiled Windows CLI launchers from the host system.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic.
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Target potential global configuration folders for Antigravity on Windows (Quad-Path Sync)
const GLOBAL_SKILLS_DIRS = [
  path.resolve(os.homedir(), '.gemini/skills'),
  path.resolve(os.homedir(), '.gemini/antigravity/skills'),
  path.resolve(os.homedir(), '.gemini/antigravity-cli/skills'),
  path.resolve(os.homedir(), '.gemini/config/skills')
];

// Target global bin directory for Windows launchers
const GLOBAL_BIN_DIR = path.resolve(os.homedir(), '.gemini/config/bin');

function uninstallGlobally() {
  console.log("=========================================================");
  console.log("     Uninstalling Senfide Engine System-Wide CLI         ");
  console.log("=========================================================\n");

  try {
    // 1. Clean up slash command folders
    console.log("📁 Purging global slash command manifests...");
    GLOBAL_SKILLS_DIRS.forEach(dir => {
      try {
        if (fs.existsSync(dir)) {
          // Remove old /generate folder
          const oldGenDir = path.join(dir, 'generate');
          if (fs.existsSync(oldGenDir)) {
            fs.rmSync(oldGenDir, { recursive: true, force: true });
            console.log(`  ✓ Removed legacy generate from: ${dir}`);
          }
          
          // Remove old /agentic-interviewer folder
          const oldInterviewDir = path.join(dir, 'agentic-interviewer');
          if (fs.existsSync(oldInterviewDir)) {
            fs.rmSync(oldInterviewDir, { recursive: true, force: true });
            console.log(`  ✓ Removed legacy agentic-interviewer from: ${dir}`);
          }

          // Remove old /grill-blueprint folder
          const oldBlueprintDir = path.join(dir, 'grill-blueprint');
          if (fs.existsSync(oldBlueprintDir)) {
            fs.rmSync(oldBlueprintDir, { recursive: true, force: true });
            console.log(`  ✓ Removed legacy grill-blueprint from: ${dir}`);
          }

          // Remove /sfe-gen folder
          const commandDir = path.join(dir, 'sfe-gen');
          if (fs.existsSync(commandDir)) {
            fs.rmSync(commandDir, { recursive: true, force: true });
            console.log(`  ✓ Removed sfe-gen from: ${dir}`);
          }
          
          // Remove /sfe-interview folder
          const interviewDir = path.join(dir, 'sfe-interview');
          if (fs.existsSync(interviewDir)) {
            fs.rmSync(interviewDir, { recursive: true, force: true });
            console.log(`  ✓ Removed sfe-interview from: ${dir}`);
          }

          // Remove /sfe-blueprint folder
          const blueprintDir = path.join(dir, 'sfe-blueprint');
          if (fs.existsSync(blueprintDir)) {
            fs.rmSync(blueprintDir, { recursive: true, force: true });
            console.log(`  ✓ Removed sfe-blueprint from: ${dir}`);
          }

          // Remove /sfe-ui folder
          const uiDir = path.join(dir, 'sfe-ui');
          if (fs.existsSync(uiDir)) {
            fs.rmSync(uiDir, { recursive: true, force: true });
            console.log(`  ✓ Removed sfe-ui from: ${dir}`);
          }

          // Remove /sfe-map-project folder
          const mapDir = path.join(dir, 'sfe-map-project');
          if (fs.existsSync(mapDir)) {
            fs.rmSync(mapDir, { recursive: true, force: true });
            console.log(`  ✓ Removed sfe-map-project from: ${dir}`);
          }
        }
      } catch (dirErr) {
        console.warn(`  ⚠️ Warning: Could not clean folder ${dir}: ${dirErr.message}`);
      }
    });

    // 2. Remove Windows CLI launchers
    if (fs.existsSync(GLOBAL_BIN_DIR)) {
      console.log("\n🚀 Purging compiled Windows CLI launcher executables...");
      
      // Clean sfe launchers
      const sfeCmd = path.join(GLOBAL_BIN_DIR, 'sfe.cmd');
      if (fs.existsSync(sfeCmd)) {
        fs.unlinkSync(sfeCmd);
        console.log("  ✓ Removed sfe.cmd launcher.");
      }
      const sfePs1 = path.join(GLOBAL_BIN_DIR, 'sfe.ps1');
      if (fs.existsSync(sfePs1)) {
        fs.unlinkSync(sfePs1);
        console.log("  ✓ Removed sfe.ps1 launcher.");
      }

      // Clean legacy launchers
      const oldCmd = path.join(GLOBAL_BIN_DIR, 'antigravity-gen.cmd');
      if (fs.existsSync(oldCmd)) {
        fs.unlinkSync(oldCmd);
        console.log("  ✓ Removed legacy antigravity-gen.cmd launcher.");
      }
      const oldPs1 = path.join(GLOBAL_BIN_DIR, 'antigravity-gen.ps1');
      if (fs.existsSync(oldPs1)) {
        fs.unlinkSync(oldPs1);
        console.log("  ✓ Removed legacy antigravity-gen.ps1 launcher.");
      }
    }

    console.log(`\n🟢 Success! System-wide cleanup complete.`);
    console.log("=========================================================");
  } catch (err) {
    console.error(`\n🔴 Uninstallation failed: ${err.message}`);
    process.exit(1);
  }
}

setTimeout(uninstallGlobally, 500);
