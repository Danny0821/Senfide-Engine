/**
 * index_manager.js
 * 
 * Central registry database coordinator for Senfide skills.
 * Manages ~/.gemini/config/senfide-engine/senfide_index.json.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Get the isolated global configuration directory path.
 * @returns {string} Absolute path to config directory.
 */
export function getRegistryDir() {
  if (process.env.SENFIDE_TEST_DIR) {
    return path.resolve(process.env.SENFIDE_TEST_DIR);
  }
  return path.join(os.homedir(), '.gemini', 'config', 'senfide-engine');
}

/**
 * Get the registry JSON index file path.
 * @returns {string} Absolute path to registry index file.
 */
export function getRegistryPath() {
  return path.join(getRegistryDir(), 'senfide_index.json');
}

/**
 * Safely load the registry index from the filesystem.
 * Handles missing directory creation and corrupt index recovery.
 * @returns {Object} Loaded registry database object.
 */
export function loadIndex() {
  const dir = getRegistryDir();
  const filePath = getRegistryPath();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    return { version: '1.0.0', skills: [] };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`⚠️ Warning: Registry index is corrupted. Backing up and starting fresh. Error: ${err.message}`);
    try {
      fs.renameSync(filePath, `${filePath}.corrupt-${Date.now()}`);
    } catch (renameErr) {
      console.error(`🔴 Critical: Failed to rename corrupt index: ${renameErr.message}`);
    }
    return { version: '1.0.0', skills: [] };
  }
}

/**
 * Safely write index database atomically using temp file write + rename.
 * @param {Object} indexData - Registry index database.
 */
export function saveIndex(indexData) {
  const dir = getRegistryDir();
  const filePath = getRegistryPath();
  const tempPath = `${filePath}.tmp`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(tempPath, JSON.stringify(indexData, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`🔴 Critical: Failed to save registry index atomically: ${err.message}`);
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkErr) {
        // Suppress unlink error
      }
    }
    throw err;
  }
}

/**
 * Normalize local path delimiters to forward slashes for cross-platform index consistency.
 * @param {string} rawPath - Absolute or relative path.
 * @returns {string} Normalized path.
 */
export function normalizePath(rawPath) {
  return path.resolve(rawPath).replace(/\\/g, '/');
}

/**
 * Register or update a local skill inside the global registry.
 * @param {Object} metadata - Skill metadata (name, description, version, triggers, tags).
 * @param {string} skillPath - Absolute directory path to the skill.
 */
export function registerSkill(metadata, skillPath) {
  if (!metadata || !metadata.name) {
    throw new Error('Skill name is mandatory for registration.');
  }

  const index = loadIndex();
  const normalizedPath = normalizePath(skillPath);
  const now = new Date().toISOString();

  const existingIndex = index.skills.findIndex(s => s.name === metadata.name);

  const skillEntry = {
    name: metadata.name,
    description: metadata.description || '',
    version: metadata.version || '0.1.0',
    path: normalizedPath,
    triggers: Array.isArray(metadata.triggers) ? metadata.triggers : [],
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    registeredAt: now,
    lastScannedAt: now
  };

  if (existingIndex !== -1) {
    // Retain original registration timestamp
    skillEntry.registeredAt = index.skills[existingIndex].registeredAt;
    index.skills[existingIndex] = skillEntry;
  } else {
    index.skills.push(skillEntry);
  }

  saveIndex(index);
  return skillEntry;
}

/**
 * Search the global database index.
 * Matches keywords against name, description, tags, and triggers.
 * @param {string} query - Keyword query term.
 * @returns {Array<Object>} List of matched skills.
 */
export function searchSkills(query) {
  if (!query) {
    const index = loadIndex();
    return index.skills;
  }

  const index = loadIndex();
  const cleanQuery = query.toLowerCase().trim();

  return index.skills.filter(skill => {
    const nameMatch = skill.name.toLowerCase().includes(cleanQuery);
    const descMatch = skill.description.toLowerCase().includes(cleanQuery);
    const tagMatch = skill.tags.some(tag => tag.toLowerCase().includes(cleanQuery));
    const triggerMatch = skill.triggers.some(trigger => trigger.toLowerCase().includes(cleanQuery));
    return nameMatch || descMatch || tagMatch || triggerMatch;
  });
}

/**
 * Robust zero-dependency parser for SKILL.md frontmatter blocks.
 * @param {string} content - Markdown file content.
 * @returns {Object|null} Extracted frontmatter object, or null.
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  const lines = yaml.split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // List item parsing (- "val")
    if (trimmed.startsWith('-')) {
      if (currentKey && Array.isArray(result[currentKey])) {
        let val = trimmed.substring(1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[currentKey].push(val);
      }
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.substring(0, colon).trim();
    let value = line.substring(colon + 1).trim();

    if (value === '') {
      result[key] = [];
      currentKey = key;
    } else {
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
      currentKey = null;
    }
  }

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

/**
 * Recursively crawl directories to discover and index existing skills.
 * Looks for SKILL.md files.
 * @param {string} dirPath - Absolute directory path to search.
 * @returns {Array<Object>} List of registered skills during scan.
 */
export function scanWorkspace(dirPath) {
  const registered = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      return; // Skip folders that fail to read (permissions, etc.)
    }

    // Check for local SKILL.md in the current directory
    const skillFile = entries.find(e => e.isFile() && e.name.toLowerCase() === 'skill.md');
    if (skillFile) {
      try {
        const fullPath = path.join(currentDir, skillFile.name);
        const content = fs.readFileSync(fullPath, 'utf8');
        const meta = parseFrontmatter(content);
        if (meta && meta.name) {
          const entry = registerSkill(meta, currentDir);
          registered.push(entry);
          return; // Skip traversing deeper into this skill's folder to avoid duplicate scan
        }
      } catch (err) {
        // Suppress parsing/reading errors for individual corrupted files
      }
    }

    // Recursively scan subfolders, skipping heavy or temporary directories to save tokens
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const name = entry.name;
        const skippedDirs = ['node_modules', '.git', 'output_test', 'dist', 'build', 'skillsets', 'output', 'coverage', '.gemini', 'tool_tests'];
        if (!skippedDirs.includes(name)) {
          traverse(path.join(currentDir, name));
        }
      }
    }
  }

  traverse(path.resolve(dirPath));
  return registered;
}

/**
 * Unregister a skill from the global index.
 * Optionally deletes physical files if it resides within the global configuration workspace.
 * @param {string} name - Name of the skill to unregister.
 * @param {boolean} deleteFiles - If true, recursively deletes physical directory from disk.
 * @returns {Object} Unregistered skill data.
 */
export function unregisterSkill(name, deleteFiles = false) {
  const index = loadIndex();
  const targetIdx = index.skills.findIndex(s => s.name === name);
  if (targetIdx === -1) {
    throw new Error(`Skill "${name}" is not registered in the index.`);
  }

  const skill = index.skills[targetIdx];

  if (deleteFiles) {
    const globalBase = getRegistryDir();
    // Safely delete only if it is within global configuration workspace directory
    const normalizedGlobal = normalizePath(globalBase);
    const normalizedSkillPath = normalizePath(skill.path);

    if (normalizedSkillPath.startsWith(normalizedGlobal) && fs.existsSync(skill.path)) {
      try {
        fs.rmSync(skill.path, { recursive: true, force: true });
      } catch (err) {
        console.warn(`⚠️ Warning: Failed to physically delete skill folder: ${err.message}`);
      }
    }
  }

  index.skills.splice(targetIdx, 1);
  saveIndex(index);
  return skill;
}

