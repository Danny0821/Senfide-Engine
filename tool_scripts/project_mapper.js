/**
 * project_mapper.js
 * 
 * Programmatic codebase static stack analyzer and blueprint synthesizer.
 * Crawls directories to identify languages, databases, testing suites, and infra,
 * and proposes optimized SFE dev team configurations.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic (Code quality firewall).
 * - Zero external dependencies.
 */

import fs from 'fs';
import path from 'path';

/**
 * Recursively crawls directories to fetch a flat list of files.
 * Skips heavy or temporary folders to prevent context bloating.
 * @param {string} dirPath - Absolute folder path to scan.
 * @returns {Array<string>} List of absolute file paths.
 */
export function scanFiles(dirPath) {
  const fileList = [];
  const skippedDirs = ['node_modules', '.git', 'output_test', 'dist', 'build', 'skillsets', 'output', 'coverage', '.gemini', 'tool_tests', 'scratch', 'local-workspace'];

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      return; // Skip folders that fail to read (permissions, locks, etc.)
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!skippedDirs.includes(entry.name)) {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        fileList.push(fullPath);
      }
    }
  }

  traverse(path.resolve(dirPath));
  return fileList;
}

/**
 * Analyzes a list of files to detect programming languages, configurations,
 * databases, test suites, and infra setups.
 * @param {Array<string>} fileList - List of file paths.
 * @returns {Object} Target stack detection details.
 */
export function detectProjectStack(fileList) {
  let isCoding = false;
  const languages = new Set();
  const testFrameworks = new Set();
  const databases = new Set();
  let hasDocker = false;
  let hasCi = false;

  for (const file of fileList) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file).toLowerCase();

    // 1. Scan for code configs or programming extensions
    const isCodeConfig = ['package.json', 'cargo.toml', 'go.mod', 'pyproject.toml', 'requirements.txt', 'gemfile', 'pom.xml', 'build.gradle'].includes(base);
    const isCodeExt = ['.csproj', '.sln', '.java', '.cpp', '.c', '.h', '.cc', '.go', '.rs', '.py', '.js', '.ts', '.swift', '.kt', '.rb', '.php', '.sql', '.html', '.css', '.sh', '.bat', '.ps1'].includes(ext);

    if (isCodeConfig || isCodeExt) {
      // Exclude build tools/scripts or HTML/CSS/Shell files from flagging it as coding if they are just basic helper files
      // BUT if we have SQL, Shell, or HTML/CSS files, they are coding tasks. Let's treat any code configuration or source files as coding.
      isCoding = true;

      // Classify language mappings
      if (['package.json', '.js', '.ts'].includes(base) || ['.js', '.ts'].includes(ext)) {
        languages.add('javascript');
      } else if (['requirements.txt', 'pyproject.toml', '.py'].includes(base) || ext === '.py') {
        languages.add('python');
      } else if (ext === '.csproj' || ext === '.sln') {
        languages.add('csharp');
      } else if (base === 'cargo.toml' || ext === '.rs') {
        languages.add('rust');
      } else if (base === 'go.mod' || ext === '.go') {
        languages.add('go');
      } else if (ext === '.java' || base === 'pom.xml' || base === 'build.gradle') {
        languages.add('java');
      } else if (ext === '.rb' || base === 'gemfile') {
        languages.add('ruby');
      } else if (ext === '.php') {
        languages.add('php');
      } else if (ext === '.cpp' || ext === '.c' || ext === '.cc' || ext === '.h') {
        languages.add('cpp');
      } else if (ext === '.swift') {
        languages.add('swift');
      } else if (ext === '.kt') {
        languages.add('kotlin');
      }
    }

    // 2. Scan package.json for dependencies if found
    if (base === 'package.json') {
      try {
        const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        // Detect JS Test Frameworks
        if (deps.jest) testFrameworks.add('jest');
        if (deps.mocha) testFrameworks.add('mocha');
        if (deps.vitest) testFrameworks.add('vitest');
        if (deps.playwright) testFrameworks.add('playwright');
        if (deps.cypress) testFrameworks.add('cypress');

        // Detect JS Database libraries/ORMs
        if (deps.pg || deps['@prisma/client']) databases.add('postgres');
        if (deps.mysql || deps.mysql2) databases.add('mysql');
        if (deps.sqlite3 || deps.sqlite) databases.add('sqlite');
      } catch (err) {
        // Suppress package JSON parse error
      }
    }

    // 3. Scan requirements.txt / pyproject.toml for Python libraries if found
    if (base === 'requirements.txt') {
      try {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        for (const line of lines) {
          const cleanLine = line.toLowerCase().trim();
          if (cleanLine.includes('pytest')) testFrameworks.add('pytest');
          if (cleanLine.includes('psycopg2') || cleanLine.includes('postgres')) databases.add('postgres');
          if (cleanLine.includes('mysql')) databases.add('mysql');
          if (cleanLine.includes('sqlalchemy') || cleanLine.includes('django')) databases.add('sqlite');
        }
      } catch (err) {
        // Suppress read error
      }
    }

    // 4. Scan for infra configurations
    if (['dockerfile', 'docker-compose.yml'].includes(base)) {
      hasDocker = true;
    }
    if (file.toLowerCase().includes('.github/workflows')) {
      hasCi = true;
    }
  }

  // 5. Fallback to Non-Coding/Prose: Zero programming signatures detected
  if (!isCoding) {
    return {
      stack: 'default',
      isCoding: false,
      hasDocker: false,
      hasCi: false,
      languages: [],
      testFrameworks: [],
      databases: [],
      archetypes: {
        pm: { name: 'Editorial/Backlog Planner', toolGroups: ['read_file', 'write_file'] },
        architect: { name: 'Design/Information Architect', toolGroups: ['read_file', 'write_file', 'web'] },
        developer: { name: 'Writer/Content Creator', toolGroups: ['read_file', 'write_file'] },
        qa: { name: 'Proofreader/Style Reviewer', toolGroups: ['read_file', 'write_file'] }
      }
    };
  }

  // Determine primary language and stack template
  let primaryLang = 'default';
  if (languages.has('javascript')) {
    primaryLang = 'js';
  } else if (languages.has('python')) {
    primaryLang = 'py';
  }

  const result = {
    stack: primaryLang,
    isCoding: true,
    hasDocker,
    hasCi,
    languages: Array.from(languages),
    testFrameworks: Array.from(testFrameworks),
    databases: Array.from(databases),
    archetypes: {
      pm: { name: 'Product Manager', toolGroups: ['read_file', 'write_file'] },
      architect: { name: 'Designer/Architect', toolGroups: ['read_file', 'write_file', 'web'] },
      developer: { name: `Developer (${primaryLang})`, toolGroups: ['read_file', 'write_file', 'command', 'web'] },
      qa: { name: 'QA/Test Engineer', toolGroups: ['read_file', 'write_file', 'command', 'web'] }
    }
  };

  // Add devops if docker or CI configurations exist
  if (hasDocker || hasCi) {
    result.archetypes.devops = { name: 'DevOps/Infrastructure', toolGroups: ['read_file', 'write_file', 'command', 'web'] };
  }

  // Add auditor if security files or databases exist (requiring threat model checks)
  if (databases.size > 0 || hasDocker) {
    result.archetypes.auditor = { name: 'Security Auditor', toolGroups: ['read_file', 'write_file', 'command', 'web'] };
  }

  return result;
}

/**
 * Scans the workspace directory, generates a Markdown analysis report, and compiles
 * a suggested blueprint.json object payload.
 * @param {string} targetDir - Path to target project folder.
 * @returns {Object} Report details containing markdown text and blueprint payload.
 */
export function generateMapReport(targetDir) {
  const absDir = path.resolve(targetDir);
  const files = scanFiles(absDir);
  const info = detectProjectStack(files);

  // Compile suggested SFE blueprint JSON
  const blueprint = {
    projectName: path.basename(absDir),
    coordinationRules: `Verify gating states inside local-workspace/approval.json. Ensure safe sequential executions.`,
    skills: []
  };

  // Build blueprint skills based on suggested archetypes
  for (const [key, value] of Object.entries(info.archetypes)) {
    const skillName = `${blueprint.projectName}-${key}`;
    const tags = [key];
    if (info.stack !== 'default') tags.push(info.stack);

    const skillEntry = {
      name: skillName,
      description: `${value.name} skill for ${blueprint.projectName}.`,
      tags: tags.join(', '),
      archetype: key,
      language: info.stack === 'default' ? 'default' : info.stack,
      triggers: [`/sfe-${key}`],
      customTasks: []
    };

    // Synthesize stack specific tasks
    if (key === 'developer') {
      if (info.stack === 'js') {
        skillEntry.customTasks.push("Setup Node.js TDD test runners and compile packages.");
      } else if (info.stack === 'py') {
        skillEntry.customTasks.push("Setup pytest test environments and verify schemas.");
      } else {
        skillEntry.customTasks.push("Scaffold coding file structures, build components, and verify execution.");
      }
    } else if (key === 'qa') {
      if (info.testFrameworks.length > 0) {
        skillEntry.customTasks.push(`Configure test suites for: ${info.testFrameworks.join(', ')}.`);
      } else {
        skillEntry.customTasks.push("Setup mock E2E integration test frameworks.");
      }
    } else if (key === 'architect' && info.databases.length > 0) {
      skillEntry.customTasks.push(`Model database table structures for: ${info.databases.join(', ')}.`);
    }

    blueprint.skills.push(skillEntry);
  }

  // Format the visual report
  let reportText = `\n======================================================
🔎 SFE Project Mapping Analysis Report
   Directory: ${absDir}
======================================================

### 1. Detected Project Stack
*   **Mode**: ${info.isCoding ? '💻 Coding Workspace' : '📝 Non-Coding / Prose Workspace'}
*   **Primary Stack Template**: \x1b[36m${info.stack}\x1b[0m
*   **Languages Found**: ${info.languages.length > 0 ? info.languages.join(', ') : 'None'}
*   **Databases Found**: ${info.databases.length > 0 ? info.databases.join(', ') : 'None'}
*   **Testing Frameworks**: ${info.testFrameworks.length > 0 ? info.testFrameworks.join(', ') : 'None'}
*   **Docker Configured**: ${info.hasDocker ? 'Yes (Dockerfile / Compose)' : 'No'}
*   **CI Pipelines**: ${info.hasCi ? 'Yes (GitHub Actions Workflows)' : 'No'}
*   **Scanned Files**: ${files.length} file(s) indexed

### 2. Suggested SFE DevTeam Archetypes
`;

  for (const [key, value] of Object.entries(info.archetypes)) {
    reportText += `*   **${key.toUpperCase()}** — \x1b[32m${value.name}\x1b[0m (Permissions: [${value.toolGroups.join(', ')}])\n`;
  }

  reportText += `
### 3. Suggested Action Plan
1. Overwrite or output the custom blueprint mapping payload to \`scratch/blueprint.json\`.
2. Review the list of customized tasks mapped to your testing suites and frameworks.
3. Run \`sfe --blueprint scratch/blueprint.json\` to scaffold the multi-agent workspace gates.
`;

  return {
    reportText,
    blueprint,
    info
  };
}
