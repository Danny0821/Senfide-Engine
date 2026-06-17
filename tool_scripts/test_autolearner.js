/**
 * Automated Test Suite for Autolearner Protocol
 * 
 * Verifies that the self-improving lessons index and playbook coordinate-linkage loop
 * works flawlessly, dynamically records issues, and enforces the Caveman style constraint.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic (Code quality firewall).
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target test workspace
const TEST_WORKSPACE = path.resolve(__dirname, '../output_test/autolearner-test-workspace');
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

/**
 * Simulates a programmatic Autolearner recorder.
 * Appends a new coordinate bullet to index and detailed post-mortem to playbook.
 * 
 * @param {string} workspace Path to the skill workspace.
 * @param {Object} lesson Lesson details to append.
 */
function recordNewLesson(workspace, lesson) {
  const { tag, title, issue, cause, fix, code } = lesson;
  const indexPath = path.join(workspace, 'lessons_index.md');
  const playbookPath = path.join(workspace, 'references/playbook.md');

  if (!fs.existsSync(indexPath) || !fs.existsSync(playbookPath)) {
    throw new Error("Autolearner files not scaffolded in target workspace.");
  }

  // 1. Read existing playbook to find where to append and calculate line numbers
  const playbookContent = fs.readFileSync(playbookPath, 'utf-8');
  const playbookLines = playbookContent.split('\n');
  const startLine = playbookLines.length + 3; // buffer for spacing and headers

  // 2. Draft the hyper-dense Caveman Playbook block
  const playbookAppend = `
---

## [${tag}] ${title}
- **Issue**: ${issue}
- **Cause**: ${cause}
- **Fix**: ${fix}
- **Code Workaround**:
  \`\`\`javascript
${code}
  \`\`\`
`;
  const endLine = startLine + playbookAppend.split('\n').length - 1;

  // 3. Append to playbook.md
  fs.appendFileSync(playbookPath, playbookAppend, 'utf-8');
  console.log(`  🟢 Appended detailed post-mortem to playbook.md (Lines L${startLine}-L${endLine})`);

  // 4. Draft and append the coordinate bullet to lessons_index.md
  const indexBullet = `- \`[${tag}]\` ${title}. Ref: references/playbook.md#L${startLine}-L${endLine}\n`;
  fs.appendFileSync(indexPath, indexBullet, 'utf-8');
  console.log(`  🟢 Appended coordinate bullet to lessons_index.md: ${indexBullet.trim()}`);
}

/**
 * Scaffolds the initial Autolearner files in the test directory using templates.
 */
function setupTestWorkspace() {
  if (fs.existsSync(TEST_WORKSPACE)) {
    try {
      fs.rmSync(TEST_WORKSPACE, { recursive: true, force: true });
    } catch (e) {
      console.warn("⚠️ Warning: Failed to fully delete old test workspace:", e.message);
    }
  }
  if (!fs.existsSync(TEST_WORKSPACE)) {
    fs.mkdirSync(TEST_WORKSPACE, { recursive: true });
  }

  const indexTmpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'lessons/developer_js_lessons.md'), 'utf-8');
  const playbookTmpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'playbooks/developer_js_playbook.md'), 'utf-8');

  // Hydrate templates with mock system name
  const replacements = { NAME: 'AutolearnerTestSystem' };
  
  // Custom template hydration
  let hydratedIndex = indexTmpl;
  let hydratedPlaybook = playbookTmpl;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    hydratedIndex = hydratedIndex.replace(regex, value);
    hydratedPlaybook = hydratedPlaybook.replace(regex, value);
  }

  fs.writeFileSync(path.join(TEST_WORKSPACE, 'lessons_index.md'), hydratedIndex, 'utf-8');
  if (!fs.existsSync(path.join(TEST_WORKSPACE, 'references'))) {
    fs.mkdirSync(path.join(TEST_WORKSPACE, 'references'), { recursive: true });
  }
  fs.writeFileSync(path.join(TEST_WORKSPACE, 'references/playbook.md'), hydratedPlaybook, 'utf-8');
  console.log("🧹 Initialized mock Autolearner workspace with clean templates.");
}

/**
 * Asserts the correctness of the Autolearner links and validates Caveman constraints.
 */
function verifyAutolearnerIntegrity(tag) {
  const indexPath = path.join(TEST_WORKSPACE, 'lessons_index.md');
  const playbookPath = path.join(TEST_WORKSPACE, 'references/playbook.md');

  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  const playbookContent = fs.readFileSync(playbookPath, 'utf-8');
  const playbookLines = playbookContent.split('\n');

  // 1. Verify tag is linked in index
  if (!indexContent.includes(`[${tag}]`)) {
    throw new Error(`Integrity Check Failed: Index does not contain tag [${tag}]`);
  }

  // 2. Parse out the line coordinate from the lessons_index.md for this tag
  const regex = new RegExp(`- \\\`\\[${tag}\\]\\\` .*\\. Ref: (?:references/)?playbook\\.md#L(\\d+)-L(\\d+)`);
  const match = indexContent.match(regex);
  if (!match) {
    throw new Error(`Integrity Check Failed: Coordinate link format invalid for tag [${tag}]`);
  }

  const startLine = parseInt(match[1], 10);
  const endLine = parseInt(match[2], 10);
  console.log(`  ✓ Successfully parsed line coordinates: L${startLine}-L${endLine}`);

  // 3. Read exact lines from playbook.md and verify header tag matches
  const targetedPlaybookExcerpt = playbookLines.slice(startLine - 1, endLine).join('\n');
  if (!targetedPlaybookExcerpt.includes(`## [${tag}]`)) {
    throw new Error(`Integrity Check Failed: Excerpt between L${startLine}-L${endLine} does not contain header [${tag}]`);
  }
  console.log(`  ✓ Verified coordinates point exactly to header: ## [${tag}]`);

  // 4. Validate Caveman Style Constraint: check for forbidden wordy filler
  const wordyFillerWords = [
    'please note that',
    'it is highly recommended to',
    'in order to accomplish this',
    'we strongly advise',
    'it is important to remember'
  ];

  for (const filler of wordyFillerWords) {
    if (indexContent.toLowerCase().includes(filler) || playbookContent.toLowerCase().includes(filler)) {
      throw new Error(`Caveman Style Violation: Found wordy filler phrase "${filler}" in learning logs!`);
    }
  }
  console.log("  ✓ Verified Caveman style constraint: Zero verbose filler phrases detected.");
}

async function runAutolearnerTests() {
  console.log("=====================================================");
  console.log("    Running Autolearner Protocol Integration Tests   ");
  console.log("=====================================================\n");

  try {
    // Step 1: Scaffold test files
    setupTestWorkspace();

    // Step 2: Define mock lesson to learn (e.g. Readline stream hang issue)
    const mockLesson = {
      tag: 'CLI_HANG_02',
      title: 'Readline interface hangs async process',
      issue: 'CLI fails to exit when loop completes.',
      cause: 'Active process.stdin stream keeps event loop alive.',
      fix: 'Explicitly invoke rl.close() at termination coordinate.',
      code: '  const rl = readline.createInterface({ input, output });\n  rl.close();'
    };

    // Step 3: Record the lesson programmatically
    console.log("\n🧪 Recording new lesson to simulate self-improvement loop...");
    recordNewLesson(TEST_WORKSPACE, mockLesson);

    // Step 4: Validate coordinate-index matching and Caveman compliance
    console.log("\n🧪 Running integrity checks on coordinate link matching and Caveman style rules...");
    verifyAutolearnerIntegrity('CLI_HANG_02');

    console.log("\n=====================================================");
    console.log("🎉 Autolearner Protocol tests completed and passed successfully!");
    console.log("=====================================================");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Autolearner tests failed: ${err.message}`);
    process.exit(1);
  }
}

runAutolearnerTests();
