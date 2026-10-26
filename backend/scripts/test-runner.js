/**
 * Unified Sprint Test Suite Runner
 * Usage:
 *   node backend/scripts/test-runner.js 1      # Run Sprint 1 tests
 *   node backend/scripts/test-runner.js 2      # Run Sprint 2 tests
 *   node backend/scripts/test-runner.js all    # Run all sprint test suites
 */
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetArg = process.argv[2] || "all";

function getAvailableSprints() {
  const files = fs.readdirSync(__dirname);
  const sprintFiles = files
    .filter(f => f.match(/^test-sprint(\d+)\.js$/))
    .map(f => {
      const match = f.match(/^test-sprint(\d+)\.js$/);
      return {
        number: parseInt(match[1], 10),
        file: f,
        fullPath: path.join(__dirname, f)
      };
    })
    .sort((a, b) => a.number - b.number);
  return sprintFiles;
}

function runSprintScript(sprint) {
  return new Promise((resolve) => {
    console.log(`\n======================================================`);
    console.log(`🎯 EXECUTING SPRINT ${sprint.number} TEST SUITE (${sprint.file})`);
    console.log(`======================================================\n`);

    const child = spawn(process.execPath, [sprint.fullPath], {
      stdio: "inherit",
      shell: false,
      cwd: process.cwd(),
      env: process.env
    });

    child.on("close", (code) => {
      resolve({ sprint: sprint.number, success: code === 0, code });
    });
  });
}

async function main() {
  const sprints = getAvailableSprints();

  if (sprints.length === 0) {
    console.error("❌ No sprint test scripts found in backend/scripts/ (expected test-sprint<N>.js)");
    process.exit(1);
  }

  let selectedSprints = [];

  if (targetArg === "all") {
    selectedSprints = sprints;
  } else {
    const num = parseInt(targetArg.replace(/\D/g, ""), 10);
    const found = sprints.find(s => s.number === num);
    if (!found) {
      console.error(`❌ Sprint ${num} test suite not found.`);
      console.log(`📋 Available Sprints: ${sprints.map(s => `Sprint ${s.number}`).join(", ")}`);
      process.exit(1);
    }
    selectedSprints = [found];
  }

  const results = [];
  for (const s of selectedSprints) {
    const result = await runSprintScript(s);
    results.push(result);
  }

  console.log("\n==================================================================");
  console.log("🏁 SPRINT TEST RUNNER SUMMARY REPORT");
  console.log("==================================================================");
  results.forEach(r => {
    console.log(`   Sprint ${r.sprint}: ${r.success ? "✅ PASSED" : "❌ FAILED"} (exit code: ${r.code})`);
  });
  console.log("==================================================================\n");

  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});
