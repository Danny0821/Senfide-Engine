/**
 * TDD Unit Verification Suite for Senfide Blueprint Validation Engine
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateBlueprint, compilePhasePlan } from './generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assertThrows(fn, expectedMsg) {
  try {
    fn();
    throw new Error("Expected function to throw an error, but it returned successfully.");
  } catch (err) {
    if (!err.message.includes(expectedMsg)) {
      throw new Error(`Assertion failed: Expected error containing "${expectedMsg}", but got: "${err.message}"`);
    }
    console.log(`  ✓ Successfully caught expected validation error: "${expectedMsg}"`);
  }
}

function runTests() {
  console.log("=====================================================");
  console.log("   Running Blueprint Validation Engine Unit Tests    ");
  console.log("=====================================================\n");

  try {
    // 1. Valid Minimal Blueprint
    console.log("🧪 Test Case 1: Parsing a valid minimal blueprint...");
    const validMinimal = {
      projectName: "web-portal",
      skills: [
        {
          name: "web-pm",
          archetype: "pm",
          description: "Scrum PM"
        }
      ]
    };
    const parsed = validateBlueprint(validMinimal);
    if (parsed.projectName !== "web-portal") throw new Error("Parsed projectName mismatch");
    if (parsed.skills[0].language !== "default") throw new Error("Expected default language cascade fallback");
    console.log("  🟢 Test Case 1 passed successfully!\n");

    // 2. Reject Missing Mandatory Fields
    console.log("🧪 Test Case 2: Rejecting blueprints missing mandatory fields...");
    assertThrows(() => validateBlueprint({}), "Mandatory field 'projectName' is missing");
    assertThrows(() => validateBlueprint({ projectName: "web-portal" }), "Mandatory field 'skills' is missing or not an array");
    console.log("  🟢 Test Case 2 passed successfully!\n");

    // 3. Reject Invalid Skill Details
    console.log("🧪 Test Case 3: Rejecting invalid skill specifications...");
    assertThrows(() => validateBlueprint({
      projectName: "web-portal",
      skills: [
        { name: "web-pm" } // Missing archetype & description
      ]
    }), "Skill at index 0 requires 'name', 'archetype', and 'description'");
    
    assertThrows(() => validateBlueprint({
      projectName: "web-portal",
      skills: [
        { name: "web-pm", archetype: "designer", description: "Design" } // Invalid archetype
      ]
    }), "Skill 'web-pm' has invalid archetype 'designer'");
    console.log("  🟢 Test Case 3 passed successfully!\n");

    // 4. Default Assignments & Normalizations
    console.log("🧪 Test Case 4: Verifying default assignments & normalizations...");
    const rawBlueprint = {
      projectName: "portal-app",
      coordinationRules: "Standard coordinated flow",
      skills: [
        {
          name: "auditor-skill",
          archetype: "auditor",
          description: "Security",
          language: "py",
          tags: ["security", "audit"]
        }
      ]
    };
    const norm = validateBlueprint(rawBlueprint);
    if (!Array.isArray(norm.skills[0].triggers)) throw new Error("Expected triggers to be normalized to empty array");
    if (norm.skills[0].language !== "py") throw new Error("Expected language setting preservation");
    console.log("  🟢 Test Case 4 passed successfully!\n");

    // 5. Compact Agent Schema Verification
    console.log("🧪 Test Case 5: Verifying Compact Agent blueprint validations...");
    const compactBlueprint = {
      projectName: "compact-app",
      skills: [
        { name: "python-ui", archetype: "developer", description: "UI" },
        { name: "python-ai", archetype: "developer", description: "AI" }
      ],
      agents: [
        {
          name: "python-expert",
          role: "Principal developer",
          description: "All-in-one",
          allowedSkills: ["python-ui", "python-ai"]
        }
      ]
    };
    const compNorm = validateBlueprint(compactBlueprint);
    if (!compNorm.agents || compNorm.agents.length !== 1) throw new Error("Expected 1 normalized compact agent");
    if (compNorm.agents[0].name !== "python-expert") throw new Error("Parsed compact agent name mismatch");
    if (compNorm.agents[0].allowedSkills.length !== 2) throw new Error("Expected 2 whitelisted allowed skills in compact agent");

    assertThrows(() => validateBlueprint({
      projectName: "compact-app",
      skills: [{ name: "python-ui", archetype: "developer", description: "UI" }],
      agents: [{ name: "python-expert", role: "Dev" }] // Missing description and allowedSkills
    }), "requires 'name', 'role', 'description', and 'allowedSkills'");

    console.log("  🟢 Test Case 5 passed successfully!\n");

    // 6. UPA compilePhasePlan & Context Density Firewall
    console.log("🧪 Test Case 6: Verifying compilePhasePlan and Context Density Firewall...");
    const workspacePath = path.resolve(__dirname, '..');
    const validPlan = {
      goal: "Test goals",
      files: ["package.json"],
      tasks: [
        { title: "Task 1", description: "Desc 1", criteria: "Crit 1" },
        { title: "Task 2", description: "Desc 2", criteria: "Crit 2" }
      ],
      verificationCommand: "npm run test && npm run lint"
    };

    const compiled = compilePhasePlan(validPlan, workspacePath);
    if (!compiled.includes("file:///{{WORKSPACE_ROOT}}/package.json")) {
      throw new Error("Expected path virtualization token: {{WORKSPACE_ROOT}}");
    }
    if (!compiled.includes("npm run test; npm run lint")) {
      throw new Error("Expected PowerShell command joining via semicolon");
    }

    // Too many tasks assertion
    const invalidPlanTasks = {
      ...validPlan,
      tasks: Array(6).fill({ title: "Task", description: "Desc", criteria: "Crit" })
    };
    assertThrows(() => compilePhasePlan(invalidPlanTasks, workspacePath), "limit is 5 tasks per phase");

    // Context density firewall violation
    const tempLargeFile = path.resolve(workspacePath, 'scratch', 'temp_large_file.txt');
    const largeContent = Array(2100).fill("const x = 1;").join("\n");
    fs.writeFileSync(tempLargeFile, largeContent, 'utf-8');

    const planWithLargeFile = {
      ...validPlan,
      files: ["scratch/temp_large_file.txt"]
    };
    assertThrows(() => compilePhasePlan(planWithLargeFile, workspacePath), "Context Density Firewall Violation");

    // Cleanup
    if (fs.existsSync(tempLargeFile)) {
      fs.unlinkSync(tempLargeFile);
    }
    console.log("  🟢 Test Case 6 passed successfully!\n");


    console.log("=====================================================");
    console.log("🎉 All Blueprint Validation Unit Tests passed successfully!");
    console.log("=====================================================");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Unit tests failed: ${err.message}`);
    process.exit(1);
  }
}

runTests();
