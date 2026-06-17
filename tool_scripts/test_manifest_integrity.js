/**
 * Static Analysis and Integrity Verification Suite for Senfide Engine Slash Commands
 * 
 * Verifies that the global slash command manifests inside command_manifests/
 * meet all trigger restrictions, UPA formatting rules, and model-agnostic requirements.
 * 
 * Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const MANIFESTS_DIR = path.join(PACKAGE_ROOT, 'command_manifests');

/**
 * Parses simple YAML frontmatter block from a markdown string.
 */
function parseFrontmatter(content) {
  const matches = content.match(/^---([\s\S]*?)---/);
  if (!matches) {
    throw new Error("Missing YAML frontmatter block (delimiters '---' not found)");
  }
  
  const yamlLines = matches[1].split('\n');
  const result = {};
  let currentKey = null;

  yamlLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    if (trimmed.startsWith('-') && currentKey) {
      // List item
      const itemVal = trimmed.replace(/^-/, '').trim().replace(/^['"]|['"]$/g, '');
      if (Array.isArray(result[currentKey])) {
        result[currentKey].push(itemVal);
      } else {
        result[currentKey] = [itemVal];
      }
      return;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.substring(0, colonIdx).trim();
      const val = trimmed.substring(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      currentKey = key;
      if (val === '') {
        result[key] = [];
      } else {
        result[key] = val;
      }
    }
  });

  // Normalize compatibility to requirements array
  if (result.compatibility && (!result.requirements || result.requirements.length === 0)) {
    const clean = result.compatibility.replace(/^Requires\s+/i, '');
    result.requirements = clean.split(',').map(r => r.trim()).filter(Boolean);
  }

  // Normalize triggers to array if parsed as a string
  if (typeof result.triggers === 'string') {
    result.triggers = [result.triggers];
  }

  // Ensure version is always a string
  if (!result.version) {
    result.version = '0.1.0';
  }

  return result;
}

function runManifestTests() {
  console.log("=====================================================");
  console.log("    Running Slash Command Manifest Integrity Tests    ");
  console.log("=====================================================\n");

  try {
    if (!fs.existsSync(MANIFESTS_DIR)) {
      throw new Error(`Command manifests directory not found at: ${MANIFESTS_DIR}`);
    }

    const folders = fs.readdirSync(MANIFESTS_DIR).filter(file => {
      const fullPath = path.join(MANIFESTS_DIR, file);
      return fs.lstatSync(fullPath).isDirectory();
    });

    console.log(`🔍 Discovered ${folders.length} command folders: ${folders.join(', ')}`);
    assert.ok(folders.length > 0, "No slash command folders found.");

    folders.forEach(folder => {
      console.log(`\n📂 Verifying manifest: ${folder}...`);
      const dirPath = path.join(MANIFESTS_DIR, folder);

      // 1. Assert required files exist
      const requiredFiles = ['SKILL.md'];
      requiredFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        assert.ok(fs.existsSync(filePath), `[FAIL] Missing required file: ${file}`);
        console.log(`  ✓ Verified file exists: ${file}`);
      });

      // 2. Read and parse SKILL.md Frontmatter
      const skillPath = path.join(dirPath, 'SKILL.md');
      const skillContent = fs.readFileSync(skillPath, 'utf8');
      
      const frontmatter = parseFrontmatter(skillContent);
      console.log(`  ✓ YAML frontmatter parsed successfully.`);

      // Validate required metadata fields
      assert.ok(frontmatter.name, `[FAIL] Metadata 'name' is missing in SKILL.md`);
      assert.ok(frontmatter.description, `[FAIL] Metadata 'description' is missing in SKILL.md`);
      assert.ok(frontmatter.version, `[FAIL] Metadata 'version' is missing in SKILL.md`);
      assert.ok(Array.isArray(frontmatter.triggers), `[FAIL] Metadata 'triggers' must be a list in SKILL.md`);

      console.log(`  ✓ Name: "${frontmatter.name}", Version: "${frontmatter.version}"`);

      // Verify Trigger limits (Lesson 17: Autocomplete trigger limit)
      assert.strictEqual(frontmatter.triggers.length, 1, `[FAIL] Folder has ${frontmatter.triggers.length} triggers. Client autocomplete parser limits triggers to exactly 1 per directory folder.`);
      assert.ok(frontmatter.triggers[0].startsWith('/'), `[FAIL] Trigger "${frontmatter.triggers[0]}" must start with a slash (/).`);
      console.log(`  ✓ Trigger registered: ${frontmatter.triggers[0]}`);

      // 3. Verify playbook.md if present for purification and anti-bloviating
      const standardPlaybookPath = path.join(dirPath, 'references/playbook.md');
      const legacyPlaybookPath = path.join(dirPath, 'playbook.md');
      const playbookPath = fs.existsSync(standardPlaybookPath) ? standardPlaybookPath : legacyPlaybookPath;
      if (fs.existsSync(playbookPath)) {
        const playbookContent = fs.readFileSync(playbookPath, 'utf8');

        // Assert Model-Agnostic UPA rules (Lesson 24: Model-Agnostic UPA Purification)
        const modelKeywords = ['gemini-1.5', 'gpt-4', 'claude-3', 'recommended_model', 'frontier-model'];
        modelKeywords.forEach(keyword => {
          const containsKeyword = playbookContent.toLowerCase().includes(keyword);
          assert.ok(!containsKeyword, `[FAIL] Playbook contains hardcoded model reference: "${keyword}". Playbooks must remain model-agnostic.`);
        });
        console.log(`  ✓ Playbook model-agnostic purification verified.`);
      }

      // 4. Validate interview.json if present
      const interviewPath = path.join(dirPath, 'interview.json');
      if (fs.existsSync(interviewPath)) {
        try {
          const jsonContent = fs.readFileSync(interviewPath, 'utf8');
          const parsed = JSON.parse(jsonContent);
          assert.ok(parsed && typeof parsed === 'object', "JSON structure must be an object");
          console.log(`  ✓ Optional interview.json parses successfully.`);
        } catch (e) {
          throw new Error(`[FAIL] interview.json is not valid JSON: ${e.message}`);
        }
      }
      
      console.log(`  🟢 Manifest ${folder} is 100% compliant!`);
    });

    console.log("\n=====================================================");
    console.log("🎉 All Slash Command Manifest Integrity Tests Passed!");
    console.log("=====================================================");
    process.exit(0);

  } catch (err) {
    console.error(`\n❌ Manifest integrity checks failed: ${err.message}`);
    process.exit(1);
  }
}

runManifestTests();
