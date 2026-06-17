/**
 * test_indexing.js
 * 
 * Automated unit test suite verifying registry operations, frontmatter parsers,
 * fuzzy searches, and workspace crawler traversals.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getRegistryDir,
  getRegistryPath,
  loadIndex,
  saveIndex,
  registerSkill,
  searchSkills,
  parseFrontmatter,
  scanWorkspace,
  normalizePath,
  unregisterSkill
} from './index_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup isolated testing directory
const TEST_DIR = path.resolve(__dirname, '../output_test/autolearner-test-workspace/registry-test-env');
process.env.SENFIDE_TEST_DIR = TEST_DIR;

function cleanTestEnv() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTests() {
  console.log("=====================================================");
  console.log("     Running Senfide Registry Database Tests         ");
  console.log("=====================================================\n");

  try {
    cleanTestEnv();

    // 1. Path Resolution Overrides
    console.log("🧪 Test 1: Directory path override...");
    const regDir = getRegistryDir();
    assert(regDir === TEST_DIR, `Registry directory mismatch. Expected ${TEST_DIR}, got ${regDir}`);
    const regPath = getRegistryPath();
    assert(regPath === path.join(TEST_DIR, 'senfide_index.json'), `Registry file path mismatch.`);
    console.log("  ✓ Directory override working perfectly.");

    // 2. Load missing index
    console.log("\n🧪 Test 2: Loading empty registry index...");
    const index = loadIndex();
    assert(index.version === '1.0.0', "Missing index version mismatch.");
    assert(Array.isArray(index.skills), "Index skills list must be an array.");
    assert(index.skills.length === 0, "Index skills list must be empty.");
    assert(fs.existsSync(TEST_DIR), "Loading should create testing directory recursively.");
    console.log("  ✓ Empty registry correctly bootstrapped.");

    // 3. Register skill metadata
    console.log("\n🧪 Test 3: Registering new skill...");
    const skillPath = path.join(TEST_DIR, 'mock-skill-a');
    fs.mkdirSync(skillPath, { recursive: true });

    const metadata = {
      name: 'mock-skill-a',
      description: 'A mock skill description for testing.',
      version: '1.2.3',
      triggers: ['/trigger-a', 'run a'],
      tags: ['test', 'mock', 'alpha']
    };

    const entry = registerSkill(metadata, skillPath);
    assert(entry.name === 'mock-skill-a', "Registered name mismatch.");
    assert(entry.description === 'A mock skill description for testing.', "Description mismatch.");
    assert(entry.version === '1.2.3', "Version mismatch.");
    assert(entry.path === normalizePath(skillPath), "Path mapping mismatch.");
    assert(entry.triggers.includes('/trigger-a'), "Triggers not saved.");
    assert(entry.tags.includes('alpha'), "Tags not saved.");
    assert(entry.registeredAt !== undefined, "Registration timestamp missing.");
    console.log("  ✓ New skill registered successfully.");

    // 4. Update existing skill
    console.log("\n🧪 Test 4: Updating registered skill...");
    const originalRegAt = entry.registeredAt;
    
    // Wait a brief millisecond to verify timestamp stability
    const updatedMetadata = {
      name: 'mock-skill-a',
      description: 'Updated mock description.',
      version: '1.2.4',
      triggers: ['/new-trigger'],
      tags: ['updated']
    };

    const updatedEntry = registerSkill(updatedMetadata, skillPath);
    assert(updatedEntry.description === 'Updated mock description.', "Updated description mismatch.");
    assert(updatedEntry.version === '1.2.4', "Updated version mismatch.");
    assert(updatedEntry.registeredAt === originalRegAt, "Original registration timestamp must be preserved.");
    console.log("  ✓ Existing skill updated and preserved registration timestamps.");

    // 5. Search skills
    console.log("\n🧪 Test 5: Search & Fuzzy query matching...");
    // Add another skill for comparison
    registerSkill({
      name: 'security-scanner',
      description: 'Secures secret files.',
      triggers: ['/scan-secrets'],
      tags: ['security', 'audit']
    }, path.join(TEST_DIR, 'security-scanner'));

    const search1 = searchSkills('mock');
    assert(search1.length === 1, `Expected 1 match, got ${search1.length}`);
    assert(search1[0].name === 'mock-skill-a', "Search query mismatch.");

    const search2 = searchSkills('security');
    assert(search2.length === 1, `Expected 1 match for "security", got ${search2.length}`);
    assert(search2[0].name === 'security-scanner', "Security search mismatch.");

    const search3 = searchSkills('audit');
    assert(search3.length === 1, `Expected match on tag "audit".`);

    const searchEmpty = searchSkills('non-existent');
    assert(searchEmpty.length === 0, "Non-existent query should return zero matches.");
    console.log("  ✓ Casing and fuzzy match searches validated.");

    // 6. Frontmatter parsing
    console.log("\n🧪 Test 6: Frontmatter parsing...");
    
    // 6a. Legacy Frontmatter
    const legacySkillMd = `---
name: "git-branch-naming-validator"
description: "Verify local Git branch names"
version: "0.1.0"
triggers:
  - "idea: check branch name"
  - "/validate-branch"
requirements:
  - "node: >=18"
  - "python: >=3.10"
---
# Main Content here
`;
    const parsedLegacy = parseFrontmatter(legacySkillMd);
    assert(parsedLegacy !== null, "Parsing legacy frontmatter failed.");
    assert(parsedLegacy.name === 'git-branch-naming-validator', "Legacy name mismatch.");
    assert(parsedLegacy.version === '0.1.0', "Legacy version mismatch.");
    assert(Array.isArray(parsedLegacy.triggers), "Legacy triggers must be array.");
    assert(parsedLegacy.triggers.length === 2, "Legacy triggers size mismatch.");
    assert(Array.isArray(parsedLegacy.requirements), "Legacy requirements must be array.");
    assert(parsedLegacy.requirements.length === 2, "Legacy requirements size mismatch.");

    // 6b. Standard-compliant Nested Frontmatter
    const standardSkillMd = `---
name: "git-branch-naming-validator"
description: "Verify local Git branch names"
compatibility: "Requires node: >=18, python: >=3.10"
metadata:
  version: "0.1.0"
  triggers: "/validate-branch"
---
# Main Content here
`;
    const parsedStandard = parseFrontmatter(standardSkillMd);
    assert(parsedStandard !== null, "Parsing standard frontmatter failed.");
    assert(parsedStandard.name === 'git-branch-naming-validator', "Standard name mismatch.");
    assert(parsedStandard.version === '0.1.0', "Standard version mismatch.");
    assert(Array.isArray(parsedStandard.triggers), "Standard triggers must be normalized to array.");
    assert(parsedStandard.triggers.length === 1, "Standard triggers size mismatch.");
    assert(parsedStandard.triggers[0] === '/validate-branch', "Standard trigger mismatch.");
    assert(Array.isArray(parsedStandard.requirements), "Standard compatibility must be normalized to requirements array.");
    assert(parsedStandard.requirements.length === 2, "Standard requirements size mismatch.");
    assert(parsedStandard.requirements[0] === 'node: >=18', "Requirement[0] mismatch.");
    assert(parsedStandard.requirements[1] === 'python: >=3.10', "Requirement[1] mismatch.");

    console.log("  ✓ Yaml frontmatter parsed and normalized seamlessly for both legacy and standard formats.");

    // 7. Directory Crawling Workspace Discovery
    console.log("\n🧪 Test 7: Directory scanning...");
    // Scaffold a fake skill folder in test workspace
    const crawlerWorkspace = path.join(TEST_DIR, 'crawler-workspace');
    const childSkillDir = path.join(crawlerWorkspace, 'my-discovered-skill');
    fs.mkdirSync(childSkillDir, { recursive: true });
    fs.writeFileSync(path.join(childSkillDir, 'SKILL.md'), standardSkillMd, 'utf8');

    // Trigger crawl
    const discovered = scanWorkspace(crawlerWorkspace);
    assert(discovered.length === 1, `Discovered size mismatch: ${discovered.length}`);
    assert(discovered[0].name === 'git-branch-naming-validator', "Discovered skill mismatch.");
    console.log("  ✓ Directory crawled and registered discovered skills.");

    // 8. Unregistering/Deleting registered skill
    console.log("\n🧪 Test 8: Unregistering and Purging skills...");
    // Register a mock skill inside the mock global config folder
    const globalBase = getRegistryDir();
    const globalSkillPath = path.join(globalBase, 'skills', 'global-mock-skill');
    fs.mkdirSync(globalSkillPath, { recursive: true });
    
    registerSkill({
      name: 'global-mock-skill',
      description: 'Mock skill inside global config workspace.',
      version: '0.1.0'
    }, globalSkillPath);

    // Assert it exists in index and disk
    const idxBefore = loadIndex();
    assert(idxBefore.skills.some(s => s.name === 'global-mock-skill'), "Global skill not found in index.");
    assert(fs.existsSync(globalSkillPath), "Global mock skill folder does not exist on disk.");

    // Unregister with purge (deleteFiles = true)
    const removedSkill = unregisterSkill('global-mock-skill', true);
    assert(removedSkill.name === 'global-mock-skill', "Unregistered name mismatch.");

    // Assert it is sliced from index and deleted from disk
    const idxAfter = loadIndex();
    assert(!idxAfter.skills.some(s => s.name === 'global-mock-skill'), "Skill must be removed from global index.");
    assert(!fs.existsSync(globalSkillPath), "Physical global mock skill folder must be deleted from disk.");

    // Assert unregistering a non-existent skill throws
    try {
      unregisterSkill('non-existent-skill');
      assert(false, "Unregistering non-existent skill must throw an error.");
    } catch (e) {
      assert(e.message.includes('not registered'), "Expected error message structure mismatch.");
    }
    console.log("  ✓ Unregistration database updates and physical file purge validated.");

    console.log("\n=====================================================");
    console.log("🎉 All registry unit tests passed successfully!");
    console.log("=====================================================");
    
    cleanTestEnv();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Unit Test Suite failed: ${err.message}`);
    console.error(err.stack);
    cleanTestEnv();
    process.exit(1);
  }
}

runTests();
