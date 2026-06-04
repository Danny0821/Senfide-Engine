/**
 * Autolearner Telemetry Integrity Verifier
 * 
 * Verifies that lessons_index.md and playbook.md files are correctly synchronized:
 * - Checks that every entry in lessons_index.md has a corresponding section in playbook.md.
 * - Resolves line coordinate references (e.g. Ref: playbook.md#L10-L20) to ensure they point to the correct lines.
 * - Detects and reports token-optimized one-liners (lessons with no detailed report).
 * - Identifies orphaned playbook entries that are not indexed.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic.
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';

/**
 * Validates a single skill directory containing lessons_index.md and playbook.md.
 * @param {string} skillDir - Path to the skill directory.
 * @returns {Object} Report detailing the verification results.
 */
export function verifyDirectory(skillDir) {
  const indexFile = path.join(skillDir, 'lessons_index.md');
  const playbookFile = path.join(skillDir, 'playbook.md');

  const report = {
    valid: true,
    skillName: path.basename(skillDir),
    errors: [],
    warnings: [],
    oneLiners: [],
    indexedCount: 0
  };

  const hasIndex = fs.existsSync(indexFile);
  const hasPlaybook = fs.existsSync(playbookFile);

  if (!hasIndex && !hasPlaybook) {
    return null; // Not an autolearner skill folder
  }

  if (hasIndex && !hasPlaybook) {
    report.errors.push(`Found lessons_index.md but missing playbook.md`);
    report.valid = false;
    return report;
  }

  if (!hasIndex && hasPlaybook) {
    report.errors.push(`Found playbook.md but missing lessons_index.md`);
    report.valid = false;
    return report;
  }

  const indexContent = fs.readFileSync(indexFile, 'utf8');
  const playbookContent = fs.readFileSync(playbookFile, 'utf8');

  const playbookLines = playbookContent.split('\n');
  
  // Find all header tags in playbook.md: e.g. "## [OS_SYNTAX_01]"
  const playbookTags = new Map(); // Tag -> line number (1-based)
  playbookLines.forEach((line, index) => {
    const match = line.match(/^##\s+\[([A-Z0-9_]+)\]/);
    if (match) {
      playbookTags.set(match[1], index + 1);
    }
  });

  const indexLines = indexContent.split('\n');
  const referencedTags = new Set();

  indexLines.forEach((line, lineIdx) => {
    // Look for lines containing tags like "[TAG]"
    const tagMatch = line.match(/-\s+(?:`)?\[([A-Z0-9_]+)\](?:`)?/);
    if (!tagMatch) return;

    const tag = tagMatch[1];
    referencedTags.add(tag);
    report.indexedCount++;

    // Check for Ref coordinate pointer: Ref: playbook.md#L[start]-L[end]
    const refMatch = line.match(/Ref:\s+playbook\.md#L(\d+)(?:-L(\d+))?/i);

    if (!refMatch) {
      // It's a token-optimized one-liner lesson!
      report.oneLiners.push({
        tag,
        line: lineIdx + 1,
        content: line.trim()
      });
      return;
    }

    const startLine = parseInt(refMatch[1], 10);
    const endLine = refMatch[2] ? parseInt(refMatch[2], 10) : startLine;

    // Check line bounds
    if (startLine < 1 || startLine > playbookLines.length) {
      report.errors.push(`lessons_index.md L${lineIdx + 1}: Coordinate start L${startLine} is out of bounds in playbook.md`);
      report.valid = false;
      return;
    }

    if (endLine < startLine || endLine > playbookLines.length) {
      report.errors.push(`lessons_index.md L${lineIdx + 1}: Coordinate end L${endLine} is invalid or out of bounds in playbook.md`);
      report.valid = false;
      return;
    }

    // Read excerpt and confirm it matches the tag header
    const excerpt = playbookLines.slice(startLine - 1, endLine).join('\n');
    if (!excerpt.includes(`[${tag}]`)) {
      report.errors.push(`lessons_index.md L${lineIdx + 1}: Coordinate range L${startLine}-L${endLine} does not contain header [${tag}] in playbook.md`);
      report.valid = false;
    }
  });

  // Verify that all tags declared in playbook.md are referenced in lessons_index.md
  for (const [tag, lineNum] of playbookTags.entries()) {
    if (!referencedTags.has(tag)) {
      report.warnings.push(`Orphan Playbook Entry: "${tag}" at playbook.md L${lineNum} is not indexed in lessons_index.md`);
    }
  }

  return report;
}

/**
 * Recursively scans directories to check autolearner pairs.
 * @param {string} searchPath - Directory path to scan recursively.
 * @returns {Array<Object>} List of verification reports.
 */
export function scanAndVerify(searchPath) {
  const reports = [];

  function traverse(dir) {
    // Skip excluded directories
    const baseName = path.basename(dir);
    if (['node_modules', '.git', '.gemini', 'build', 'dist', 'coverage', 'output_test', 'output', 'local-workspace', 'scratch'].includes(baseName)) {
      return;
    }

    const report = verifyDirectory(dir);
    if (report) {
      reports.push(report);
    }

    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      return; // Ignore unreadable directories
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          traverse(fullPath);
        }
      } catch (e) {
        // Ignore unreadable items
      }
    }
  }

  traverse(searchPath);
  return reports;
}

// If run directly from terminal
if (process.argv[1] && (process.argv[1].endsWith('verify_autolearner_integrity.js') || process.argv[1].endsWith('verify_autolearner_integrity.mjs'))) {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  console.log(`\n======================================================`);
  console.log(`🔎 Verifying Autolearner Telemetry Integrity...`);
  console.log(`   Target Directory: ${targetDir}`);
  console.log(`======================================================\n`);

  const reports = scanAndVerify(targetDir);

  if (reports.length === 0) {
    console.log(`🔍 No Autolearner files (lessons_index.md / playbook.md) found to verify.`);
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  reports.forEach((report) => {
    console.log(`📂 Skill: \x1b[36m${report.skillName}\x1b[0m`);
    console.log(`   Indexed Lessons: ${report.indexedCount}`);

    if (report.oneLiners.length > 0) {
      console.log(`   💡 Token-Optimized Standalone Index Lessons:`);
      report.oneLiners.forEach((ol) => {
        console.log(`     - \x1b[33m${ol.tag}\x1b[0m (One-liner in lessons_index.md L${ol.line})`);
      });
    }

    if (report.warnings.length > 0) {
      console.log(`   ⚠️ Warnings:`);
      report.warnings.forEach((warn) => {
        console.log(`     - \x1b[35m${warn}\x1b[0m`);
        totalWarnings++;
      });
    }

    if (report.errors.length > 0) {
      console.log(`   🔴 Errors:`);
      report.errors.forEach((err) => {
        console.log(`     - \x1b[31m${err}\x1b[0m`);
        totalErrors++;
      });
    }

    if (report.valid && report.errors.length === 0) {
      console.log(`   \x1b[32m✓ Integrity Verified Successfully\x1b[0m`);
    } else {
      console.log(`   \x1b[31m✗ Integrity Check Failed\x1b[0m`);
    }
    console.log(`------------------------------------------------------`);
  });

  console.log(`\n======================================================`);
  console.log(`📊 Summary:`);
  console.log(`   Checked Skills: ${reports.length}`);
  console.log(`   Total Warnings: ${totalWarnings}`);
  console.log(`   Total Errors:   ${totalErrors}`);
  console.log(`======================================================\n`);

  if (totalErrors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
