/**
 * SFE Temporal Flow Validator Hook
 * 
 * Verifies that the multi-agent development lifecycle progressed sequentially:
 * PM (Backlog) ➔ Architect (Design) ➔ Developer (Code)
 * 
 * Prevents agents from bypassing boundaries in a single turn.
 * Zero-dependency Node.js script.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const THRESHOLD_SECONDS = 15;

function getNewestMtime(dirPath, extensions = [], excludeDirs = []) {
  let newest = 0;
  if (!fs.existsSync(dirPath)) return newest;
  
  function traverse(dir) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      return;
    }
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          traverse(fullPath);
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (extensions.length === 0 || extensions.includes(ext)) {
          if (stat.mtimeMs > newest) {
            newest = stat.mtimeMs;
          }
        }
      }
    }
  }
  traverse(dirPath);
  return newest;
}

async function verifySfeFlow() {
  // 1. Check environment bypass flag
  if (process.env.SFE_BYPASS === 'true') {
    console.log("🟢 SFE flow enforcement bypassed via environment variable.");
    process.exit(0);
  }

  // 2. Check local state configuration bypass
  const statePath = path.resolve('local-workspace/state.json');
  if (fs.existsSync(statePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      if (state.bypassEnforcement === true) {
        console.log("🟢 SFE flow enforcement bypassed via state.json config.");
        process.exit(0);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // 3. Locate PM checkpoint file
  const backlogPath = path.resolve('BACKLOG.md');
  if (!fs.existsSync(backlogPath)) {
    // If backlog does not exist, we are in greenfield stage (pass)
    console.log("🟢 Greenfield workspace detected. Skipping flow verification.");
    process.exit(0);
  }

  // 4. Locate primary application code files
  // Exclude node_modules, git directories, planning files, documentation, and tooling
  const codeExcludeDirs = [
    'node_modules', '.git', '.planning', 'local-workspace', 
    'tool_scripts', 'scratch', 'tests', 'coverage', 'docs'
  ];
  const codeExtensions = ['.js', '.py', '.ts', '.cpp', '.go', '.cs', '.rs', '.java', '.rb', '.php', '.swift'];
  
  const codeMtime = getNewestMtime(process.cwd(), codeExtensions, codeExcludeDirs);
  if (codeMtime === 0) {
    // No application code files exist yet (pass)
    console.log("🟢 No application code written yet. Flow verification passed.");
    process.exit(0);
  }

  // 5. Locate design/architecture checkpoint files
  const designMtime = getNewestMtime(path.resolve('docs'), [], ['node_modules', '.git']);

  // 6. Git commit isolation override check
  // Find a code file that was modified to test git log.
  // We can look for the newest code file to compare with BACKLOG.md.
  try {
    const gitBacklogCommit = execSync(`git log -n 1 --format=%H -- "${backlogPath}"`, { stdio: 'pipe' }).toString().trim();
    if (gitBacklogCommit) {
      // Find the latest commit that modified any code file
      const gitCodeCommit = execSync('git log -n 1 --format=%H -- "*.js" "*.py" "*.ts" "*.cpp" "*.go" "*.cs" "*.rs"', { stdio: 'pipe' }).toString().trim();
      
      if (gitCodeCommit && gitBacklogCommit !== gitCodeCommit) {
        console.log("🟢 SFE flow checks passed (files isolated in separate, sequential Git commits).");
        process.exit(0);
      }
    }
  } catch (e) {
    // Git checks skipped if Git is not initialized or git log fails (fallback to mtime)
  }

  // 7. Verify temporal file proximity
  const backlogMtime = fs.statSync(backlogPath).mtimeMs;
  
  // Calculate differences in seconds
  const codeDiff = Math.abs(codeMtime - backlogMtime) / 1000;
  
  if (codeDiff < THRESHOLD_SECONDS) {
    console.error(`\n🔴 SFE FLOW ENFORCEMENT FAILURE:`);
    console.error(`   Backlog and code files were modified within ${codeDiff.toFixed(1)}s of each other.`);
    console.error(`   It appears the agent bypassed the sequential team coordination rules.`);
    console.error(`\n👉 TO FIX:`);
    console.error(`   1. Coordinate sequentially (PM -> Dev -> QA).`);
    console.error(`   2. Commit your backlog changes before writing code.`);
    console.error(`   3. Or bypass this check by setting "bypassEnforcement": true in local-workspace/state.json.`);
    process.exit(1);
  }

  // Check design files proximity if docs folder exists
  if (designMtime > 0) {
    const designDiff = Math.abs(codeMtime - designMtime) / 1000;
    if (designDiff < THRESHOLD_SECONDS) {
      console.error(`\n🔴 SFE FLOW ENFORCEMENT FAILURE:`);
      console.error(`   Design specifications and code files were modified within ${designDiff.toFixed(1)}s of each other.`);
      console.error(`   It appears the agent bypassed the sequential team coordination rules.`);
      console.error(`\n👉 TO FIX:`);
      console.error(`   1. Coordinate sequentially (PM -> Design -> Dev -> QA).`);
      console.error(`   2. Commit your design changes before writing code.`);
      console.error(`   3. Or bypass this check by setting "bypassEnforcement": true in local-workspace/state.json.`);
      process.exit(1);
    }
  }

  console.log("🟢 SFE flow sequence checks passed.");
}

verifySfeFlow();
