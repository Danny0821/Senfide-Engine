#!/usr/bin/env node

/**
 * Senfide Engine CLI Binary Entry Point
 * 
 * Invokes the modular generator logic from scripts/generate.js
 * or delegates to scripts/index_manager.js for index lookups.
 * 
 * Strict Philosophy:
 * - High-quality, robust, fully-commented code logic (Code quality firewall).
 * - Zero external dependencies.
 */

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { loadIndex, searchSkills, scanWorkspace, unregisterSkill } from '../tool_scripts/index_manager.js';
import { generateMapReport } from '../tool_scripts/project_mapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sleeps for a specified number of milliseconds.
 * @param {number} ms Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Active lock registry to track locks held by this process.
 */
const activeLocks = new Set();

// Register process exit hook to cleanly release all locks sync on termination
process.on('exit', () => {
  for (const lock of activeLocks) {
    try {
      if (fs.existsSync(lock)) {
        fs.unlinkSync(lock);
      }
    } catch (e) {
      // Best-effort cleanup during exit
    }
  }
});

/**
 * Atomically acquires a file lock using Node's O_CREAT | O_EXCL ('wx') flag.
 * Implements exponential backoff retries to queue concurrent processes.
 * @param {string} lockPath - Path to the lock file.
 * @param {number} maxRetries - Maximum number of retries before timeout.
 * @returns {Promise<boolean>} Resolves to true when lock is acquired.
 */
async function acquireFileLock(lockPath, maxRetries = 10) {
  let attempt = 0;
  let delay = 50; // Initial delay in ms

  while (attempt < maxRetries) {
    try {
      // wx flag atomically fails if file exists
      const fd = fs.openSync(lockPath, 'wx');
      fs.closeSync(fd);
      activeLocks.add(lockPath);
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') {
        attempt++;
        // Exponential backoff with jitter
        const jitter = Math.floor(Math.random() * 20);
        const backoff = delay * Math.pow(2, attempt) + jitter;
        console.warn(`⚠️ File locked: ${path.basename(lockPath)}. Retrying in ${backoff}ms (Attempt ${attempt}/${maxRetries})...`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Timeout acquiring lock on: ${lockPath}`);
}

/**
 * Releases the file lock by unlinking the lock file.
 * @param {string} lockPath - Path to the lock file.
 */
function releaseFileLock(lockPath) {
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
    activeLocks.delete(lockPath);
  } catch (err) {
    console.error(`🔴 Failed to release lock on ${lockPath}: ${err.message}`);
  }
}

// Helper to print CLI help menu
function printHelp() {
  console.log(`
==================================================================
             Senfide Engine CLI Tool & Skill Indexer
==================================================================
Usage: sfe [options]

Options:
  -i, --install          Synchronize slash command manifests globally to all Gemini instances
  -l, --list             List all globally registered skills in Senfide index
  -s, --search <term>    Fuzzy search for registered skills by name or tag
  -c, --scan <path>      Scan a directory recursively to discover and register skills
  -m, --map <path>       Scan a directory programmatically to detect stack and suggest blueprints
  -r, --remove <name>    Unregister a skill from global index. Add --purge to delete files.
  -b, --blueprint <path> Scaffold multi-skill systems non-interactively from a JSON blueprint
  -f, --force            Overwrite existing directories during blueprint scaffolding
  -h, --help             Display this help menu

If no options are specified, the welcome instructions will run.
`);
}

// Helper to print a skill entry beautifully in the console
function printSkillEntry(skill, index) {
  console.log(`------------------------------------------------------------------`);
  console.log(`[#${index + 1}] Name:        \x1b[36m${skill.name}\x1b[0m (v${skill.version})`);
  console.log(`     Path:        \x1b[90m${skill.path}\x1b[0m`);
  console.log(`     Description: ${skill.description || 'No description provided.'}`);
  if (skill.triggers && skill.triggers.length > 0) {
    console.log(`     Triggers:    \x1b[33m${skill.triggers.join(', ')}\x1b[0m`);
  }
  if (skill.tags && skill.tags.length > 0) {
    console.log(`     Tags:        \x1b[32m${skill.tags.join(', ')}\x1b[0m`);
  }
}

/**
 * Zero-dependency option parser for command-line arguments.
 * Parses flags and mapped string values.
 * @param {Array<string>} args - Command-line argument array.
 * @returns {Object} Parsed option parameters.
 */
function parseCliArgs(args) {
  const options = {
    install: false,
    list: false,
    search: null,
    scan: null,
    map: null,
    remove: null,
    purge: false,
    help: false,
    blueprint: null,
    force: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--install' || arg === '-i') {
      options.install = true;
    } else if (arg === '--list' || arg === '-l') {
      options.list = true;
    } else if (arg === '--search' || arg === '-s') {
      options.search = args[i + 1] || '';
      i++; // Skip next argument
    } else if (arg === '--scan' || arg === '-c') {
      options.scan = args[i + 1] || '.';
      // Check if next arg is another option or empty
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        i++; // Skip next argument
      }
    } else if (arg === '--map' || arg === '-m') {
      options.map = args[i + 1] || '.';
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        i++; // Skip next argument
      }
    } else if (arg === '--remove' || arg === '-r') {
      options.remove = args[i + 1] || '';
      i++; // Skip next argument
    } else if (arg === '--purge') {
      options.purge = true;
    } else if (arg === '--blueprint' || arg === '-b') {
      options.blueprint = args[i + 1] || '';
      i++; // Skip next argument
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    }
  }

  return options;
}

async function handleCommands() {
  const args = process.argv.slice(2);
  const options = parseCliArgs(args);

  // 1. Help Command
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // 1.2 Install Command
  if (options.install) {
    const installPath = path.resolve(__dirname, '../tool_scripts/install_global.js');
    const installUrl = pathToFileURL(installPath).href;
    try {
      await import(installUrl);
      process.exit(0);
    } catch (err) {
      console.error("🔴 Global installation failed:", err.message);
      process.exit(1);
    }
  }

  // 1.5 Blueprint Command
  if (options.blueprint !== null) {
    const blueprintPath = options.blueprint;
    if (!blueprintPath) {
      console.error("🔴 Error: Please specify a blueprint JSON file path (e.g. sfe --blueprint scratch/blueprint.json).");
      process.exit(1);
    }

    const absolutePath = path.resolve(blueprintPath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`🔴 Error: Blueprint file does not exist at: ${absolutePath}`);
      process.exit(1);
    }

    const lockPath = `${absolutePath}.lock`;
    await acquireFileLock(lockPath);

    // Dynamic import to execute scaffoldFromBlueprint in scripts/generate.js
    const generatePath = path.resolve(__dirname, '../tool_scripts/generate.js');
    const generateUrl = pathToFileURL(generatePath).href;

    try {
      const module = await import(generateUrl);
      if (module.scaffoldFromBlueprint) {
        await module.scaffoldFromBlueprint(absolutePath, options.force);
        releaseFileLock(lockPath);
        process.exit(0);
      } else {
        throw new Error("scaffoldFromBlueprint() not exported in scripts/generate.js.");
      }
    } catch (err) {
      releaseFileLock(lockPath);
      console.error("🔴 Blueprint scaffolding failed:", err.message);
      process.exit(1);
    }
  }

  // 2. List Command
  if (options.list) {
    console.log("\n==================================================================");
    console.log("             Globally Registered Senfide Skills               ");
    console.log("==================================================================");
    
    try {
      const registry = loadIndex();
      if (!registry.skills || registry.skills.length === 0) {
        console.log("\n🔍 No skills registered yet in the Senfide global index.");
        console.log("Run the generator or scan a directory to catalog skills.");
      } else {
        registry.skills.forEach((skill, index) => printSkillEntry(skill, index));
        console.log(`------------------------------------------------------------------`);
        console.log(`Total: ${registry.skills.length} skill(s) registered.`);
      }
    } catch (err) {
      console.error("🔴 Failed to load index:", err.message);
    }
    process.exit(0);
  }

  // 3. Search Command
  if (options.search !== null) {
    const term = options.search;
    if (!term) {
      console.error("🔴 Error: Please specify a search term (e.g., sfe --search branch).");
      process.exit(1);
    }

    console.log(`\n🔍 Searching Senfide index for: "${term}"...`);
    try {
      const matches = searchSkills(term);
      if (matches.length === 0) {
        console.log(`❌ No registered skills found matching query: "${term}"`);
      } else {
        matches.forEach((skill, index) => printSkillEntry(skill, index));
        console.log(`------------------------------------------------------------------`);
        console.log(`Found: ${matches.length} matching skill(s).`);
      }
    } catch (err) {
      console.error("🔴 Search failed:", err.message);
    }
    process.exit(0);
  }

  // 4. Scan Command
  if (options.scan !== null) {
    const scanPath = options.scan;
    const absoluteScanPath = path.resolve(scanPath);
    if (!fs.existsSync(absoluteScanPath)) {
      console.error(`🔴 Error: Target scan folder does not exist at: ${absoluteScanPath}`);
      process.exit(1);
    }

    const lockPath = `${absoluteScanPath}.lock`;
    await acquireFileLock(lockPath);

    console.log(`\n📁 Scanning recursively for SKILL.md files: ${absoluteScanPath}...`);
    try {
      const registered = scanWorkspace(absoluteScanPath);
      console.log(`\n==================================================================`);
      console.log(`🎉 Scan completed successfully!`);
      console.log(`==================================================================`);
      if (registered.length === 0) {
        console.log("No new skills were discovered in the specified path.");
      } else {
        registered.forEach((skill, index) => {
          console.log(`  🟢 Registered: \x1b[36m${skill.name}\x1b[0m inside \x1b[90m${skill.path}\x1b[0m`);
        });
        console.log(`------------------------------------------------------------------`);
        console.log(`Success: Registered ${registered.length} new skill(s) globally.`);
      }
      releaseFileLock(lockPath);
      process.exit(0);
    } catch (err) {
      releaseFileLock(lockPath);
      console.error("🔴 Workspace scan failed:", err.message);
      process.exit(1);
    }
  }

  // 4.1 Map Command
  if (options.map !== null) {
    const mapPath = options.map;
    const absoluteMapPath = path.resolve(mapPath);
    if (!fs.existsSync(absoluteMapPath)) {
      console.error(`🔴 Error: Target map folder does not exist at: ${absoluteMapPath}`);
      process.exit(1);
    }

    console.log(`\n📁 Mapping project stack: ${absoluteMapPath}...`);
    try {
      const { reportText, blueprint } = generateMapReport(absoluteMapPath);
      console.log(reportText);

      const scratchDir = path.join(process.cwd(), 'scratch');
      const blueprintFile = path.join(scratchDir, 'blueprint.json');

      const writeBlueprint = () => {
        if (!fs.existsSync(scratchDir)) {
          fs.mkdirSync(scratchDir, { recursive: true });
        }
        fs.writeFileSync(blueprintFile, JSON.stringify(blueprint, null, 2), 'utf8');
        console.log(`\n🟢 Suggested blueprint successfully written to \x1b[36mscratch/blueprint.json\x1b[0m.`);
        console.log(`👉 Run \x1b[32msfe --blueprint scratch/blueprint.json\x1b[0m to scaffold the multi-agent workspace.`);
      };

      if (process.stdin.isTTY) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('\n❓ Would you like to save this blueprint to scratch/blueprint.json? (Y/n): ', (answer) => {
          rl.close();
          const response = answer.trim().toLowerCase();
          if (response === '' || response === 'y' || response === 'yes') {
            writeBlueprint();
          } else {
            console.log('\n❌ Map report completed. Blueprint was not saved.');
          }
          process.exit(0);
        });
      } else {
        // Non-interactive mode
        writeBlueprint();
        process.exit(0);
      }
    } catch (err) {
      console.error("🔴 Project mapping failed:", err.message);
      process.exit(1);
    }
    return;
  }

  // 4.5 Remove Command
  if (options.remove !== null) {
    const name = options.remove;
    if (!name) {
      console.error("🔴 Error: Please specify a skill name to remove (e.g. sfe --remove go-senior-dev).");
      process.exit(1);
    }
    const purge = options.purge;

    try {
      console.log(`\n🗑️ Unregistering skill "${name}"...`);
      const skill = unregisterSkill(name, purge);
      console.log(`🟢 Successfully unregistered skill "${name}" from Senfide index.`);
      if (purge) {
        console.log(`🧹 Purged skill files from folder: ${skill.path}`);
      }
    } catch (err) {
      console.error("🔴 Failed to remove skill:", err.message);
      process.exit(1);
    }
    process.exit(0);
  }

  // 5. Default Fallback: Print welcome redirection notice and display help menu
  console.log(`
==================================================================
        Senfide Engine CLI Programmatic Scaffolder
==================================================================
👉 NOTE: Conversational-First Onboarding is active!
   To scaffold a new multi-agent team or custom skill:
   1. Open your Gemini chat client.
   2. Type '/sfe-interview' or '/sfe-blueprint' in the chat.
   3. The agent will dynamically interview you and build the workspace.

For programmatic command-line scaffolding, use:
  sfe --blueprint <path-to-blueprint.json>
`);
  printHelp();
  process.exit(0);
}

handleCommands();
