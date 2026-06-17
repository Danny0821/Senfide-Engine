/**
 * verify_index_sandbox.js
 * 
 * End-to-end integration test validating the Senfide index CLI commands
 * (--list, --search, --scan) inside a simulated sandbox project workspace.
 * 
 * Generates its own fresh test fixtures at runtime to remain 100% self-contained.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scaffoldSkill } from './generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target test registry and source sandbox folders
const RUN_ID = Date.now() + Math.random().toString(36).substring(2, 7);
const SANDBOX_REGISTRY_DIR = path.resolve(__dirname, `../output_test/autolearner-test-workspace/sandbox-registry-${RUN_ID}`);
process.env.SENFIDE_TEST_DIR = SANDBOX_REGISTRY_DIR;
const SOURCE_SANDBOX_DIR = path.resolve(__dirname, `../output_test/autolearner-test-workspace/sandbox-project-${RUN_ID}`);
const CLI_PATH = path.resolve(__dirname, '../cli_bin/cli.js');

function cleanRegistry() {
  try {
    if (fs.existsSync(SANDBOX_REGISTRY_DIR)) {
      fs.rmSync(SANDBOX_REGISTRY_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(SOURCE_SANDBOX_DIR)) {
      fs.rmSync(SOURCE_SANDBOX_DIR, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn("⚠️ Warning: Failed to fully clean sandbox registry/project folders:", e.message);
  }
}

function runCommandWithEnv(args) {
  return execSync(`node "${CLI_PATH}" ${args}`, {
    env: {
      ...process.env,
      SENFIDE_TEST_DIR: SANDBOX_REGISTRY_DIR
    },
    encoding: 'utf8'
  });
}

function runSandboxVerification() {
  console.log("=====================================================");
  console.log("     Starting E2E Sandbox Registry Verification       ");
  console.log("=====================================================\n");

  try {
    cleanRegistry();

    // 0. Setup fresh sandbox workspace with mock skills
    console.log("🛠️ Preparing fresh sandbox workspace...");
    fs.mkdirSync(SOURCE_SANDBOX_DIR, { recursive: true });

    scaffoldSkill({
      name: 'file-security-scanner',
      description: 'Scan files for credentials and toxic shell commands.',
      tags: 'security, files, audit',
      targetDir: path.join(SOURCE_SANDBOX_DIR, 'file-security-scanner'),
      localOnly: true
    });

    scaffoldSkill({
      name: 'git-branch-naming-validator',
      description: 'Verify local Git branch names comply with repository conventions.',
      tags: 'git, branch, validation',
      targetDir: path.join(SOURCE_SANDBOX_DIR, 'git-branch-naming-validator'),
      localOnly: true
    });

    console.log("\n✓ Mock skills scaffolded successfully.\n");

    // 1. Initial Empty List check
    console.log("🧪 Step 1: Listing empty registry...");
    const initialList = runCommandWithEnv('--list');
    if (!initialList.includes('No skills registered yet')) {
      throw new Error(`Expected empty warning, got: ${initialList}`);
    }
    console.log("  ✓ Initial list verified empty.");

    // 2. Scan sandbox projects
    console.log("\n🧪 Step 2: Scanning sandbox workspace recursively...");
    const scanOutput = runCommandWithEnv(`--scan "${SOURCE_SANDBOX_DIR}"`);
    console.log(scanOutput);
    
    if (!scanOutput.includes('Scan completed successfully!') || !scanOutput.includes('Registered 2 new skill(s)')) {
      throw new Error("Scan execution did not register the expected 2 sandbox skills.");
    }
    console.log("  ✓ Directory scan successfully parsed and indexed both sandbox skills.");

    // 3. Search matching skill
    console.log("\n🧪 Step 3: Searching for registered 'branch' skill...");
    const searchBranch = runCommandWithEnv('--search branch');
    console.log(searchBranch);

    if (!searchBranch.includes('git-branch-naming-validator') || !searchBranch.includes('Found: 1 matching skill(s)')) {
      throw new Error(`Fuzzy search for 'branch' failed. Output: ${searchBranch}`);
    }
    console.log("  ✓ Fuzzy search correctly discovered matching branch-validator.");

    // 4. Search matching skill by tag
    console.log("\n🧪 Step 4: Searching by tag 'security'...");
    const searchSecurity = runCommandWithEnv('--search security');
    console.log(searchSecurity);

    if (!searchSecurity.includes('file-security-scanner') || !searchSecurity.includes('Found: 1 matching skill(s)')) {
      throw new Error(`Fuzzy search for tag 'security' failed. Output: ${searchSecurity}`);
    }
    console.log("  ✓ Tag fuzzy search successfully discovered security scanner.");

    // 5. Complete list check
    console.log("\n🧪 Step 5: Listing all registered skills...");
    const finalList = runCommandWithEnv('--list');
    console.log(finalList);

    if (!finalList.includes('file-security-scanner') || !finalList.includes('git-branch-naming-validator')) {
      throw new Error("Complete listing did not report both skills.");
    }
    console.log("  ✓ Registry list displays catalog correctly.");

    // 6. Local-Only Scaffolding E2E Check
    console.log("\n🧪 Step 6: Scaffolding local-only skill...");
    scaffoldSkill({
      name: 'local-only-mock',
      description: 'A mock skill kept strictly local.',
      tags: 'local, mock',
      targetDir: path.join(SOURCE_SANDBOX_DIR, 'local-only-mock'),
      localOnly: true
    });
    
    // Assert it does NOT appear in index list
    const postLocalList = runCommandWithEnv('--list');
    if (postLocalList.includes('local-only-mock')) {
      throw new Error("Local-only skill was unexpectedly registered in the global index.");
    }
    console.log("  ✓ Local-only skill scaffolding correctly bypassed global catalog indexing.");

    // 7. E2E Unregistration Check
    console.log("\n🧪 Step 7: Unregistering skill via CLI...");
    const removeOutput = runCommandWithEnv('--remove file-security-scanner');
    console.log(removeOutput);

    if (!removeOutput.includes('Successfully unregistered skill "file-security-scanner"')) {
      throw new Error(`Unregistration command failed. Output: ${removeOutput}`);
    }

    // Verify it is gone from the list
    const postRemoveList = runCommandWithEnv('--list');
    console.log(postRemoveList);
    if (postRemoveList.includes('file-security-scanner')) {
      throw new Error("Skill was not removed from list after unregistering.");
    }
    if (!postRemoveList.includes('git-branch-naming-validator')) {
      throw new Error("Unrelated skill was lost during unregistration.");
    }
    console.log("  ✓ E2E unregistration successfully removed the target skill.");

    // 8. E2E Advanced Mode Skill Creation Check
    console.log("\n🧪 Step 8: Scaffolding custom skill in Advanced Mode (Python script)...");
    const advancedSkillDir = path.join(SOURCE_SANDBOX_DIR, 'go-advanced-skill');
    
    scaffoldSkill({
      name: 'go-advanced-skill',
      description: 'Advanced Go systems optimizer.',
      tags: 'go, advanced, performance',
      targetDir: advancedSkillDir,
      creationMode: 'advanced',
      customTriggers: ['/audit-go', 'context: golang'],
      customRequirements: ['go: >=1.20', 'python: >=3.10'],
      customTasks: ['Audit channel closures', 'Perform escape allocation checks'],
      customReviews: ['Verify no unsafe blocks', 'Assert clippy warning compliance'],
      scriptLanguage: 'py' // Python verification script!
    });

    // Assert files created
    const skillMdPath = path.join(advancedSkillDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error("Advanced skill SKILL.md was not created.");
    }
    const skillMdContent = fs.readFileSync(skillMdPath, 'utf8');
    if (!skillMdContent.includes('go: >=1.20') || !skillMdContent.includes('/audit-go')) {
      throw new Error("Advanced skill SKILL.md is missing custom triggers/requirements.");
    }
    if (!skillMdContent.includes('Audit channel closures')) {
      throw new Error("Advanced skill SKILL.md is missing custom task definitions.");
    }
    if (!skillMdContent.includes('Verify no unsafe blocks')) {
      throw new Error("Advanced skill SKILL.md is missing custom review checks.");
    }

    // Assert Python verification script exists and is shebang-hardened
    const pyScriptPath = path.join(advancedSkillDir, 'scripts/security_check.py');
    if (!fs.existsSync(pyScriptPath)) {
      throw new Error("Advanced Python verification script was not created.");
    }
    const pyContent = fs.readFileSync(pyScriptPath, 'utf8');
    if (!pyContent.includes('#!/usr/bin/env python3')) {
      throw new Error("Advanced Python verification script shebang is missing or unhardened.");
    }
    console.log("  ✓ Hardened Python verification script generated perfectly.");

    // Assert it appears in the index list
    const postAdvancedList = runCommandWithEnv('--list');
    console.log(postAdvancedList);
    if (!postAdvancedList.includes('go-advanced-skill')) {
      throw new Error("Advanced skill was not registered in the global catalog.");
    }
    
    // 9. E2E Greenfield Multi-Archetype Self-Coordination & Stack-Specific Telemetry Check (DMCP & Archetypes)
    console.log("\n🧪 Step 9: Verifying dynamic Archetype Classification, DMCP Playbook isolation, and Telemetry Registries...");
    const architectSkillDir = path.join(SOURCE_SANDBOX_DIR, 'figma-to-html-wireframes');
    const developerSkillDir = path.join(SOURCE_SANDBOX_DIR, 'react-user-dashboard');
    const pythonSkillDir = path.join(SOURCE_SANDBOX_DIR, 'python-audit-api');
    const cppSkillDir = path.join(SOURCE_SANDBOX_DIR, 'cpp-core-optimizer');

    // A. Scaffold Architect Skill
    scaffoldSkill({
      name: 'figma-to-html-wireframes',
      description: 'Design wireframes and architectural blueprints for frontend.',
      tags: 'figma, figma-to-html, wireframes, architect',
      targetDir: architectSkillDir,
      creationMode: 'quick',
      localOnly: true
    });

    // B. Scaffold Developer JS Skill
    scaffoldSkill({
      name: 'react-user-dashboard',
      description: 'Build React components and frontend interface.',
      tags: 'react, frontend, dev, component',
      targetDir: developerSkillDir,
      creationMode: 'quick',
      localOnly: true
    });

    // C. Scaffold Developer Python Skill
    scaffoldSkill({
      name: 'python-audit-api',
      description: 'Python FastAPI server security auditor.',
      tags: 'python, fastapi, auditor, dev',
      targetDir: pythonSkillDir,
      creationMode: 'advanced',
      archetype: 'developer',
      scriptLanguage: 'py',
      localOnly: true
    });

    // D. Scaffold Future Stack Skill to verify Safe Cascade Fallback
    scaffoldSkill({
      name: 'cpp-core-optimizer',
      description: 'High-performance C++ systems optimizer.',
      tags: 'cpp, systems, performance',
      targetDir: cppSkillDir,
      creationMode: 'advanced',
      archetype: 'developer',
      scriptLanguage: 'cpp', // Unsupported script stack! Triggers fallback chain
      localOnly: true
    });

    // E. Scaffold DevOps Skill
    const devopsSkillDir = path.join(SOURCE_SANDBOX_DIR, 'devops-deploy-pipeline');
    scaffoldSkill({
      name: 'devops-deploy-pipeline',
      description: 'Docker deployment pipeline.',
      tags: 'devops, docker, deploy',
      targetDir: devopsSkillDir,
      creationMode: 'advanced',
      archetype: 'devops',
      localOnly: true
    });

    // F. Scaffold QA Skill
    const qaSkillDir = path.join(SOURCE_SANDBOX_DIR, 'qa-integration-suite');
    scaffoldSkill({
      name: 'qa-integration-suite',
      description: 'QA integration test suite.',
      tags: 'qa, test, integration',
      targetDir: qaSkillDir,
      creationMode: 'advanced',
      archetype: 'qa',
      localOnly: true
    });

    // G. Scaffold Security Auditor Skill
    const auditorSkillDir = path.join(SOURCE_SANDBOX_DIR, 'secret-leak-detector');
    scaffoldSkill({
      name: 'secret-leak-detector',
      description: 'Gitleaks safety scanning auditor.',
      tags: 'security, audit, scanner',
      targetDir: auditorSkillDir,
      creationMode: 'advanced',
      archetype: 'auditor',
      localOnly: true
    });

    // H. Scaffold PM Skill
    const pmSkillDir = path.join(SOURCE_SANDBOX_DIR, 'scrum-board-tracker');
    scaffoldSkill({
      name: 'scrum-board-tracker',
      description: 'Project Roadmap tracking PM.',
      tags: 'pm, backlog, roadmap',
      targetDir: pmSkillDir,
      creationMode: 'advanced',
      archetype: 'pm',
      localOnly: true
    });

    // 1. Assert figma-to-html-wireframes (Architect Archetype) contains correct playbook, DMCP, and zero-slop design telemetries
    if (!fs.existsSync(path.join(architectSkillDir, 'SKILL.md'))) {
      throw new Error("Architect skill SKILL.md was not created.");
    }
    const archSkillContent = fs.readFileSync(path.join(architectSkillDir, 'SKILL.md'), 'utf8');
    if (!archSkillContent.includes('docs/architecture/') || !archSkillContent.includes('schema.sql')) {
      throw new Error("Architect skill is missing dynamic blueprint tasks!");
    }
    if (archSkillContent.includes('pytest') || archSkillContent.includes('Catch2') || archSkillContent.includes('npm test')) {
      throw new Error("AI Slop detected: Architect skill contains software testing references!");
    }
    if (!archSkillContent.includes('Choreographed Fallback') || !archSkillContent.includes('You are a Designer/Architect')) {
      throw new Error("Architect skill is missing the correct DMCP handshake guidelines!");
    }
    if (archSkillContent.includes('<autolearner>')) {
      throw new Error("Token Waste: Redundant <autolearner> block found in Architect playbook!");
    }

    // Assert Architect Telemetry Zero-Slop
    const archPlaybook = fs.readFileSync(path.join(architectSkillDir, 'references/playbook.md'), 'utf8');
    if (!archPlaybook.includes('[SCHEMA_01]') || !archPlaybook.includes('Foreign Key constraints')) {
      throw new Error("Architect playbook is missing database schema design telemetry!");
    }
    if (archPlaybook.includes('process.env') || archPlaybook.includes('readline') || archPlaybook.includes('pytest')) {
      throw new Error("AI Slop: Architect playbook contains programming stack telemetry!");
    }
    console.log("  ✓ Architect skill structurally validated (Zero-Slop, Pure Design Telemetry, correct DMCP).");

    // 2. Assert react-user-dashboard (Developer JS Archetype) contains correct playbook, TDD, and Node-specific telemetry
    if (!fs.existsSync(path.join(developerSkillDir, 'SKILL.md'))) {
      throw new Error("Developer skill SKILL.md was not created.");
    }
    const devSkillContent = fs.readFileSync(path.join(developerSkillDir, 'SKILL.md'), 'utf8');
    if (!devSkillContent.includes('active unit test suites') || !devSkillContent.includes('npm init')) {
      throw new Error("Developer skill is missing dynamic bootstrapping or TDD tasks!");
    }
    if (!devSkillContent.includes('Choreographed Fallback') || !devSkillContent.includes('You are a Developer')) {
      throw new Error("Developer skill is missing the correct DMCP handshake guidelines!");
    }
    if (devSkillContent.includes('<autolearner>')) {
      throw new Error("Token Waste: Redundant <autolearner> block found in Developer playbook!");
    }

    // Assert Developer JS Telemetry
    const devPlaybook = fs.readFileSync(path.join(developerSkillDir, 'references/playbook.md'), 'utf8');
    if (!devPlaybook.includes('[CLI_INPUT_01]') || !devPlaybook.includes('process.env')) {
      throw new Error("Developer JS playbook is missing Node.js environment telemetry!");
    }
    if (devPlaybook.includes('pytest') || devPlaybook.includes('pathlib')) {
      throw new Error("AI Slop: Developer JS playbook contaminated with Python telemetry!");
    }
    console.log("  ✓ Developer JS skill structurally validated (TDD-Based, JS Telemetry, correct DMCP).");

    // 3. Assert python-audit-api (Developer Python) contains correct pure Python telemetry (Zero-Slop regression fix)
    const pyPlaybook = fs.readFileSync(path.join(pythonSkillDir, 'references/playbook.md'), 'utf8');
    if (!pyPlaybook.includes('[TEST_RUNNER_01]') || !pyPlaybook.includes('pytest') || !pyPlaybook.includes('pathlib')) {
      throw new Error("Developer Python playbook is missing pytest/pathlib telemetry!");
    }
    if (pyPlaybook.includes('process.env') || pyPlaybook.includes('readline')) {
      throw new Error("AI Slop: Developer Python playbook contaminated with Node.js/JS telemetry!");
    }
    console.log("  ✓ Developer Python skill structurally validated (TDD-Based, Python Telemetry, zero JS-slop).");

    // 4. Assert future/unsupported language fallback resolves cleanly to default agnostic telemetry
    const cppPlaybook = fs.readFileSync(path.join(cppSkillDir, 'references/playbook.md'), 'utf8');
    if (!cppPlaybook.includes('[OS_PATH_01]') || !cppPlaybook.includes('[ENV_SECRET_01]')) {
      throw new Error("Fallback cascade failed: C++ skill did not generate default agnostic telemetry!");
    }
    if (cppPlaybook.includes('process.env') || cppPlaybook.includes('pytest')) {
      throw new Error("Fallback cascade failed: Agnostic telemetry contaminated with stack-specific tags!");
    }
    console.log("  ✓ Safe Cascade Fallback validated (developer:cpp fell back cleanly to default agnostic telemetry).");

    // 5. Assert devops-deploy-pipeline (DevOps Archetype) contains correct DevOps telemetry
    const devopsPlaybook = fs.readFileSync(path.join(devopsSkillDir, 'references/playbook.md'), 'utf8');
    if (!devopsPlaybook.includes('[DOCKER_MOUNT_01]') || !devopsPlaybook.includes('Windows volume mount')) {
      throw new Error("DevOps playbook is missing volume mount telemetry!");
    }
    if (devopsPlaybook.includes('process.env') || devopsPlaybook.includes('pytest')) {
      throw new Error("AI Slop: DevOps playbook contaminated with programming stack telemetry!");
    }
    console.log("  ✓ DevOps skill structurally validated (Zero-Slop, Pure DevOps Telemetry).");

    // 6. Assert qa-integration-suite (QA Archetype) contains correct QA telemetry
    const qaPlaybook = fs.readFileSync(path.join(qaSkillDir, 'references/playbook.md'), 'utf8');
    if (!qaPlaybook.includes('[TEST_TIMEOUT_01]') || !qaPlaybook.includes('waitForSelector')) {
      throw new Error("QA playbook is missing test timeout telemetry!");
    }
    if (qaPlaybook.includes('Foreign Key') || qaPlaybook.includes('pytest')) {
      throw new Error("AI Slop: QA playbook contaminated with database or python telemetry!");
    }
    console.log("  ✓ QA skill structurally validated (Zero-Slop, Pure QA Telemetry).");

    // 7. Assert secret-leak-detector (Auditor Archetype) contains correct Auditor telemetry
    const auditorPlaybook = fs.readFileSync(path.join(auditorSkillDir, 'references/playbook.md'), 'utf8');
    if (!auditorPlaybook.includes('[SCANNER_RULE_01]') || !auditorPlaybook.includes('Semgrep false positive')) {
      throw new Error("Auditor playbook is missing scanner rule telemetry!");
    }
    if (auditorPlaybook.includes('readline') || auditorPlaybook.includes('Figma')) {
      throw new Error("AI Slop: Auditor playbook contaminated with JS or wireframe telemetry!");
    }
    console.log("  ✓ Security Auditor skill structurally validated (Zero-Slop, Pure Auditor Telemetry).");

    // 8. Assert scrum-board-tracker (PM Archetype) contains correct PM telemetry
    const pmPlaybook = fs.readFileSync(path.join(pmSkillDir, 'references/playbook.md'), 'utf8');
    if (!pmPlaybook.includes('[BACKLOG_01]') || !pmPlaybook.includes('prioritization tag duplication')) {
      throw new Error("PM playbook is missing backlog prioritization telemetry!");
    }
    if (pmPlaybook.includes('process.env') || pmPlaybook.includes('pytest')) {
      throw new Error("AI Slop: PM playbook contaminated with programming stack telemetry!");
    }
    console.log("  ✓ Product Manager skill structurally validated (Zero-Slop, Pure PM Telemetry).");

    console.log("  ✓ Multi-Archetype Greenfield self-coordination and Dynamic Telemetry E2E verified perfectly.");

    console.log("\n=====================================================");
    console.log("🎉 E2E Sandbox Registry Verification passed perfectly!");
    console.log("=====================================================");

    cleanRegistry();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Sandbox E2E Verification failed: ${err.message}`);
    cleanRegistry();
    process.exit(1);
  }
}

runSandboxVerification();
