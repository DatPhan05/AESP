// [AESP-41] Tích hợp WhisperX / STT: API nhận file audio -> trả transcript text
/**
 * Utility to find Python executable for WhisperX STT runner
 */
import { execSync } from "child_process";

export function findPythonExecutable() {
  const candidates = ["python3", "python", "py -3", "py"];
  
  for (const cmd of candidates) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: "utf-8", stdio: "pipe" });
      if (version.includes("Python 3")) {
        return cmd;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }
  
  return "python"; // Fallback
}

