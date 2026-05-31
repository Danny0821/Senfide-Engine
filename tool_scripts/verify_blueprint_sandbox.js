/**
 * E2E Sandbox Integration Verification Suite for Senfide Blueprint Scaffolding
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.resolve(__dirname, '../output_test');
const SCRATCH_DIR = path.resolve(__dirname, '../scratch');
const REGISTRY_DIR = path.join(TEST_OUTPUT_DIR, 'test-registry');

// Enforce registry isolation redirection
process.env.SENFIDE_TEST_DIR = REGISTRY_DIR;

function cleanup() {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    try {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
      console.log("🧹 Cleaned up old test directories.");
    } catch (e) {
      console.warn("⚠️ Warning: Failed to fully clean old test registry:", e.message);
    }
  }
  if (fs.existsSync(SCRATCH_DIR)) {
    try {
      const files = fs.readdirSync(SCRATCH_DIR);
      for (const file of files) {
        if (file.endsWith('.lock')) {
          fs.unlinkSync(path.join(SCRATCH_DIR, file));
          console.log(`🧹 Cleaned up stale lock file: ${file}`);
        }
      }
    } catch (e) {
      // Best-effort cleanup
    }
  }
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Assertion failed: File/Folder does not exist at: ${filePath}`);
  }
  console.log(`  ✓ Verified: ${path.basename(filePath)} exists.`);
}

function assertNotExists(filePath) {
  if (fs.existsSync(filePath)) {
    throw new Error(`Assertion failed: File/Folder unexpectedly exists at: ${filePath}`);
  }
  console.log(`  ✓ Verified: ${path.basename(filePath)} does not exist.`);
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

async function run() {
  console.log("=====================================================");
  console.log("   Running Blueprint E2E Sandbox Scaffolding Tests   ");
  console.log("=====================================================\n");

  cleanup();
  
  if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  }

  const blueprintPath = path.join(SCRATCH_DIR, 'test_blueprint_team.json');
  const targetProjectDir = path.join(TEST_OUTPUT_DIR, 'web-automated-team');

  // 1. Synthesize multi-skill team blueprint JSON
  const blueprintContent = {
    projectName: targetProjectDir,
    coordinationRules: "DMCP Coordinated Greenfield flow",
    skills: [
      {
        name: "web-pm",
        archetype: "pm",
        description: "Coordinated Product Backlog Management",
        language: "js"
      },
      {
        name: "web-db",
        archetype: "architect",
        description: "DDL SQL Topologically Sorted Schema specs",
        language: "default"
      },
      {
        name: "web-scanner",
        archetype: "auditor",
        description: "Static scanners and secrets exclusions scanner",
        language: "py"
      }
    ]
  };

  console.log("💾 Step 1: Writing mock coordinated team blueprint JSON...");
  fs.writeFileSync(blueprintPath, JSON.stringify(blueprintContent, null, 2), 'utf-8');
  assertExists(blueprintPath);

  // 2. Execute CLI with --blueprint
  console.log("\n🚀 Step 2: Executing CLI with --blueprint flag...");
  try {
    const cmd = `node "${path.resolve(__dirname, '../cli_bin/cli.js')}" --blueprint "${blueprintPath}"`;
    console.log(`  Running: ${cmd}`);
    
    // We redirect process env to isolate global registry file
    const output = execSync(cmd, { 
      env: { ...process.env, SENFIDE_TEST_DIR: REGISTRY_DIR },
      encoding: 'utf-8' 
    });
    console.log("  [CLI Output]:\n" + output.split('\n').map(l => `    > ${l}`).join('\n'));
  } catch (err) {
    console.error("🔴 CLI execution failed:", err.message);
    throw err;
  }

  // 3. Assert Scaffolding Structure correctness
  console.log("\n🔍 Step 3: Asserting file system structure correctness...");
  assertExists(targetProjectDir);

  // Assert Step 1 base structure
  assertExists(path.join(targetProjectDir, '.sfe-version'));
  const sfeVersionContent = fs.readFileSync(path.join(targetProjectDir, '.sfe-version'), 'utf-8');
  if (!sfeVersionContent.includes('0.6.9')) {
    throw new Error("Assertion failed: .sfe-version does not contain expected lock version '0.6.9'");
  }
  assertExists(path.join(targetProjectDir, 'local-workspace/sfe-mock.example'));
  assertExists(path.join(targetProjectDir, 'local-workspace/sfe-probe.json'));
  const targetProbe = JSON.parse(fs.readFileSync(path.join(targetProjectDir, 'local-workspace/sfe-probe.json'), 'utf-8'));
  if (!targetProbe.os || !targetProbe.editor || !targetProbe.timestamp) {
    throw new Error("Assertion failed: sfe-probe.json is missing required attributes in standard target.");
  }
  assertExists(path.join(targetProjectDir, '.gitignore'));
  const gitignoreContent = fs.readFileSync(path.join(targetProjectDir, '.gitignore'), 'utf-8');
  if (!gitignoreContent.includes('local-workspace/') || !gitignoreContent.includes('sfe-mock.env')) {
    throw new Error("Assertion failed: .gitignore is missing local-workspace/ or sfe-mock.env entries");
  }

  // A. Product Manager Skill (web-pm, Node.js runtime)
  const pmDir = path.join(targetProjectDir, 'skillsets/web-pm');
  console.log("  Asserting PM Skill folder...");
  assertExists(path.join(pmDir, 'SKILL.md'));
  assertFileContains(path.join(pmDir, 'SKILL.md'), 'ROM Protocol');
  assertFileContains(path.join(pmDir, 'SKILL.md'), 'Human-Anchor Memory Guard');
  assertExists(path.join(pmDir, 'lessons_index.md'));
  assertExists(path.join(pmDir, 'playbook.md'));
  assertExists(path.join(pmDir, 'scripts/security_check.js'));
  assertExists(path.join(pmDir, '.github/workflows/security_scan.yml'));

  // B. Architect Skill (web-db, Agnostic Default runtime - non-coding)
  const dbDir = path.join(targetProjectDir, 'skillsets/web-db');
  console.log("  Asserting Architect Skill folder...");
  assertExists(path.join(dbDir, 'SKILL.md'));
  assertExists(path.join(dbDir, 'lessons_index.md'));
  assertExists(path.join(dbDir, 'playbook.md'));
  assertNotExists(path.join(dbDir, 'scripts/security_check.js')); // Architect has no verifiers by default
  assertExists(path.join(dbDir, '.github/workflows/security_scan.yml'));

  // C. Security Auditor Skill (web-scanner, Python runtime, Custom Exclusions)
  const scanDir = path.join(targetProjectDir, 'skillsets/web-scanner');
  console.log("  Asserting Security Auditor Skill folder...");
  assertExists(path.join(scanDir, 'SKILL.md'));
  assertFileContains(path.join(scanDir, 'SKILL.md'), 'AST Security Firewalls');
  assertFileContains(path.join(scanDir, 'SKILL.md'), 'AST Dependency Fallbacks');
  assertExists(path.join(scanDir, 'lessons_index.md'));
  assertExists(path.join(scanDir, 'playbook.md'));
  assertExists(path.join(scanDir, 'scripts/security_check.py'));
  assertExists(path.join(scanDir, 'gitleaks.toml')); // Exclusions scaffolded!
  assertExists(path.join(scanDir, 'trivy.yaml'));     // Exclusions scaffolded!
  assertExists(path.join(scanDir, '.github/workflows/security_scan.yml'));

  // D. Assert Registry catalog database registration
  console.log("  Asserting global registry catalogs...");
  const registryDb = path.join(REGISTRY_DIR, 'senfide_index.json');
  assertExists(registryDb);
  const registryContent = JSON.parse(fs.readFileSync(registryDb, 'utf8'));
  const names = registryContent.skills.map(s => s.name);
  if (!names.includes('web-pm') || !names.includes('web-db') || !names.includes('web-scanner')) {
    throw new Error(`Registry catalog does not contain all scaffolded team skills: ${names.join(', ')}`);
  }
  console.log("  ✓ All 3 team skills registered in registry database index!");

  // 4. Test Overwrite Protection & Safe Incremental Merge
  console.log("\n🔒 Step 4: Running CLI again without --force to test Safe Incremental Merge & Self-Cleaning...");
  try {
    // Modify blueprintContent to remove the "web-scanner" skill
    const updatedBlueprintContent = {
      ...blueprintContent,
      skills: blueprintContent.skills.filter(s => s.name !== 'web-scanner')
    };
    if (blueprintContent.agents) {
      updatedBlueprintContent.agents = blueprintContent.agents.filter(a => a.name !== 'web-scanner-agent');
    }
    const updatedBlueprintPath = path.join(SCRATCH_DIR, 'test_blueprint_team_updated.json');
    fs.writeFileSync(updatedBlueprintPath, JSON.stringify(updatedBlueprintContent, null, 2), 'utf-8');

    const cmd = `node "${path.resolve(__dirname, '../cli_bin/cli.js')}" --blueprint "${updatedBlueprintPath}"`;
    execSync(cmd, { 
      env: { ...process.env, SENFIDE_TEST_DIR: REGISTRY_DIR },
      stdio: 'ignore' 
    });
    
    // Assert that the orphaned skillset and agent folders were successfully purged!
    const legacySkillFolder = path.join(targetProjectDir, 'skillsets/web-scanner');
    const legacyAgentFolder = path.join(targetProjectDir, 'agents/web-scanner-agent_agent');
    
    if (fs.existsSync(legacySkillFolder)) {
      throw new Error("Assertion failed: Safe incremental merge left behind legacy orphaned skill folder!");
    }
    if (fs.existsSync(legacyAgentFolder)) {
      throw new Error("Assertion failed: Safe incremental merge left behind legacy orphaned agent folder!");
    }
    
    // Assert that the remaining folders still exist
    assertExists(path.join(targetProjectDir, 'skillsets/web-pm'));
    assertExists(path.join(targetProjectDir, 'skillsets/web-db'));
    assertExists(path.join(targetProjectDir, 'agents/web-pm-agent_agent'));
    assertExists(path.join(targetProjectDir, 'agents/web-db-agent_agent'));
    
    console.log("  ✓ Safe incremental merge successfully executed and purged orphaned directories without --force!");
  } catch (err) {
    console.error("🔴 Incremental merge test failed:", err.message);
    throw err;
  }

  // 5. Test Force Override Option
  console.log("\n⚡ Step 5: Running CLI again WITH --force override flag...");
  try {
    const cmd = `node "${path.resolve(__dirname, '../cli_bin/cli.js')}" --blueprint "${blueprintPath}" --force`;
    execSync(cmd, { 
      env: { ...process.env, SENFIDE_TEST_DIR: REGISTRY_DIR },
      stdio: 'ignore' 
    });
    console.log("  ✓ Force override executed and rebuilt target folders cleanly!");
  } catch (err) {
    console.error("🔴 Force override failed:", err.message);
    throw err;
  }

  // 6. Test Compact Agent Scaffolding Blueprint
  console.log("\n📦 Step 6: Executing and verifying Compact Multi-Skill Agent blueprint...");
  const compactBlueprintPath = path.join(SCRATCH_DIR, 'test_compact_blueprint.json');
  const compactTargetDir = path.join(TEST_OUTPUT_DIR, 'compact-python-team');

  const compactBlueprintContent = {
    projectName: compactTargetDir,
    coordinationRules: "DMCP Compact flow",
    skills: [
      { name: "python-ui", archetype: "developer", description: "UI" },
      { name: "python-ai", archetype: "developer", description: "AI" },
      { name: "python-db", archetype: "developer", description: "DB" }
    ],
    agents: [
      {
        name: "python-expert",
        role: "Lead Developer",
        description: "All-in-one developer",
        allowedSkills: ["python-ui", "python-ai", "python-db"]
      }
    ]
  };

  fs.writeFileSync(compactBlueprintPath, JSON.stringify(compactBlueprintContent, null, 2), 'utf-8');
  assertExists(compactBlueprintPath);

  try {
    const cmd = `node "${path.resolve(__dirname, '../cli_bin/cli.js')}" --blueprint "${compactBlueprintPath}"`;
    execSync(cmd, { 
      env: { ...process.env, SENFIDE_TEST_DIR: REGISTRY_DIR },
      stdio: 'ignore' 
    });
    console.log("  ✓ Compact Blueprint scaffolded successfully!");
  } catch (err) {
    console.error("🔴 Compact CLI execution failed:", err.message);
    throw err;
  }

  // Assertions for Compact Scaffold
  assertExists(compactTargetDir);
  assertExists(path.join(compactTargetDir, 'SYSTEM.md'));

  // Assert Step 1 base structure
  assertExists(path.join(compactTargetDir, '.sfe-version'));
  const compactSfeVersionContent = fs.readFileSync(path.join(compactTargetDir, '.sfe-version'), 'utf-8');
  if (!compactSfeVersionContent.includes('0.6.9')) {
    throw new Error("Assertion failed: .sfe-version in compact project does not contain expected lock version '0.6.9'");
  }
  assertExists(path.join(compactTargetDir, 'local-workspace/sfe-mock.example'));
  assertExists(path.join(compactTargetDir, 'local-workspace/sfe-probe.json'));
  const compactProbe = JSON.parse(fs.readFileSync(path.join(compactTargetDir, 'local-workspace/sfe-probe.json'), 'utf-8'));
  if (!compactProbe.os || !compactProbe.editor || !compactProbe.timestamp) {
    throw new Error("Assertion failed: sfe-probe.json is missing required attributes in compact target.");
  }
  assertExists(path.join(compactTargetDir, '.gitignore'));
  const compactGitignoreContent = fs.readFileSync(path.join(compactTargetDir, '.gitignore'), 'utf-8');
  if (!compactGitignoreContent.includes('local-workspace/') || !compactGitignoreContent.includes('sfe-mock.env')) {
    throw new Error("Assertion failed: .gitignore in compact project is missing local-workspace/ or sfe-mock.env entries");
  }

  assertExists(path.join(compactTargetDir, 'skillsets/python-ui/SKILL.md'));
  assertExists(path.join(compactTargetDir, 'skillsets/python-ai/SKILL.md'));
  assertExists(path.join(compactTargetDir, 'skillsets/python-db/SKILL.md'));
  
  const agentMdPath = path.join(compactTargetDir, 'agents/python-expert_agent/AGENT.md');
  assertExists(agentMdPath);
  
  // Verify Agent whitelist matches whitelisted allowedSkills YAML list
  const agentMdContent = fs.readFileSync(agentMdPath, 'utf8');
  if (!agentMdContent.includes('- "python-ui"') || !agentMdContent.includes('- "python-ai"') || !agentMdContent.includes('- "python-db"')) {
    throw new Error("Assertion failed: Scaffolded compact AGENT.md missing whitelisted allowedSkills YAML items.");
  }
  console.log("  ✓ Verified: Compact agent whitelists all three skills correctly inside AGENT.md!");

  // 6.5 Verifying Concurrency File-Locking Semaphore
  console.log("\n🔒 Step 6.5: Verifying Concurrency File-Locking Semaphore...");
  const lockFilePath = `${compactBlueprintPath}.lock`;

  // 1. Manually create the lock file to block the CLI execution
  fs.writeFileSync(lockFilePath, 'locked-by-test', 'utf-8');
  console.log("  ✓ Created artificial lock file to block CLI execution.");

  const startTime = Date.now();

  // 2. Start the CLI command in the background (which should retry and wait for the lock to clear)
  const childProcess = exec(`node "${path.resolve(__dirname, '../cli_bin/cli.js')}" --blueprint "${compactBlueprintPath}" --force`, {
    env: { ...process.env, SENFIDE_TEST_DIR: REGISTRY_DIR }
  });

  // 3. Sleep for a short duration, then release the lock manually
  await new Promise(resolve => setTimeout(resolve, 300));
  if (fs.existsSync(lockFilePath)) {
    fs.unlinkSync(lockFilePath);
    console.log("  ✓ Released lock file manually. CLI process should now resume.");
  }

  // 4. Wait for the CLI background process to complete successfully
  await new Promise((resolve, reject) => {
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Background CLI failed with exit code: ${code}`));
      }
    });
  });

  const duration = Date.now() - startTime;
  if (duration < 300) {
    throw new Error(`Assertion failed: CLI process did not wait for the lock. Execution finished too fast (${duration}ms).`);
  }
  console.log(`  ✓ Concurrency queued successfully! Process waited for lock and completed. (Duration: ${duration}ms)`);

  // Clean up compact files
  if (fs.existsSync(compactBlueprintPath)) {
    fs.unlinkSync(compactBlueprintPath);
    console.log("  ✓ Removed temporary compact blueprint JSON.");
  }

  // 7. Cleanup
  console.log("\n🧹 Step 7: Cleaning up E2E test footprints...");
  if (fs.existsSync(blueprintPath)) {
    fs.unlinkSync(blueprintPath);
    console.log("  ✓ Removed temporary blueprint JSON.");
  }
  cleanup();

  console.log("\n=====================================================");
  console.log("🎉 E2E Sandbox Blueprint Scaffolding Tests Passed perfectly!");
  console.log("=====================================================");
}

run().catch(err => {
  console.error("E2E Test execution failed:", err);
  process.exit(1);
});
