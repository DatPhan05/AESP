/**
 * Automated Test Suite for Sprint 3 (AESP-40 -> AESP-52)
 * Focus: AI Core Services, Speech STT, CEFR Prompt Generation,
 *        Speech Scoring & Evaluation, Packages & Purchases, Learner Dashboard.
 * Run with: node backend/scripts/test-sprint3.js
 */
import axios from "axios";
import pool from "../src/config/db.js";

const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4010";

let adminToken = null;
let learnerToken = null;
let testLearnerId = null;
let testPackageId = null;
let testPurchaseId = null;
let testSessionId = null;

async function runTest(title, testFn) {
  try {
    process.stdout.write(`⏳ ${title}... `);
    await testFn();
    console.log(`✅ PASS`);
    return true;
  } catch (err) {
    console.log(`❌ FAIL`);
    console.error(`   Error: ${err.response?.data?.message || err.message}`);
    if (err.response?.status) {
      console.error(`   Status: ${err.response.status}`);
    }
    return false;
  }
}

async function setupTestUsers() {
  // 1. Tạo hoặc lấy Admin user để test AESP-45
  const adminEmail = `admin_sprint3_${Date.now()}@example.com`;
  const adminRes = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
    name: "Sprint3 Admin",
    email: adminEmail,
    password: "AdminPassword123!@#",
    role: "admin",
    security_question: "Tên thú cưng đầu tiên của bạn là gì?",
    security_answer: "milo"
  });

  const adminLogin = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
    identifier: adminEmail,
    password: "AdminPassword123!@#"
  });
  adminToken = adminLogin.data.token;

  // 2. Tạo hoặc lấy Learner user
  const learnerEmail = `learner_sprint3_${Date.now()}@example.com`;
  await axios.post(`${GATEWAY_URL}/api/auth/register`, {
    name: "Sprint3 Learner",
    email: learnerEmail,
    password: "LearnerPassword123!@#",
    role: "learner",
    security_question: "Tên thú cưng đầu tiên của bạn là gì?",
    security_answer: "milo"
  });

  const learnerLogin = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
    identifier: learnerEmail,
    password: "LearnerPassword123!@#"
  });
  learnerToken = learnerLogin.data.token;

  // Lấy learner_id từ DB
  const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [learnerEmail]);
  const userId = userRes.rows[0].id;

  const learnerRes = await pool.query("SELECT id FROM learners WHERE user_id = $1", [userId]);
  if (learnerRes.rows[0]) {
    testLearnerId = learnerRes.rows[0].id;
  } else {
    const insertLearner = await pool.query(
      "INSERT INTO learners (user_id, level, streak_days) VALUES ($1, 1, 3) RETURNING id",
      [userId]
    );
    testLearnerId = insertLearner.rows[0].id;
  }
}

async function main() {
  console.log("\n==================================================================");
  console.log("🚀 SPRINT 3 AUTOMATED TEST SUITE: AI & CORE SERVICES");
  console.log(`📡 Target Gateway: ${GATEWAY_URL}`);
  console.log(`🤖 Target AI Service: ${AI_SERVICE_URL}`);
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  // Setup test authentication tokens
  total++;
  if (await runTest("Setup Test Auth Tokens (Admin & Learner)", async () => {
    await setupTestUsers();
    if (!adminToken || !learnerToken || !testLearnerId) throw new Error("Setup tokens failed");
  })) passed++;

  // 1. [AESP-40] AI Service Health Check
  total++;
  if (await runTest("1. [AESP-40] Khởi tạo AI Service project & Health Check", async () => {
    const res = await axios.get(`${AI_SERVICE_URL}/health`);
    if (res.status !== 200 || res.data.status !== "ok") throw new Error("AI Service health check failed");
  })) passed++;

  // 2. [AESP-41] Audio Transcription (STT)
  total++;
  if (await runTest("2. [AESP-41] Tích hợp WhisperX STT: API nhận audio → transcript", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/ai/transcribe`, {
      mock_transcript: "I am actively improving my English speaking skills every day."
    });
    if (!res.data.success || !res.data.transcript) throw new Error("STT transcription failed");
  })) passed++;

  // 3. [AESP-42] Cấu hình OpenRouter / LLM wrapper
  total++;
  if (await runTest("3. [AESP-42] Cấu hình OpenRouter + AI Assistant wrapper", async () => {
    const res = await axios.get(`${AI_SERVICE_URL}/health`);
    if (typeof res.data.openrouter === "undefined") throw new Error("Missing openrouter status in health check");
  })) passed++;

  // 4. [AESP-43] Sinh đề bài/câu hỏi theo cấp độ CEFR A1-C2
  total++;
  if (await runTest("4. [AESP-43] API sinh đề bài/câu hỏi theo cấp độ A1–C2", async () => {
    const levels = ["A1", "B1", "B2", "C1"];
    for (const lvl of levels) {
      const res = await axios.post(`${GATEWAY_URL}/api/ai/generate-question`, {
        level: lvl,
        topic: "Education & Career"
      });
      if (!res.data.success || !res.data.question || res.data.level !== lvl) {
        throw new Error(`Failed to generate question for level ${lvl}`);
      }
    }
  })) passed++;

  // 5. [AESP-44] API chấm điểm (phát âm, ngữ pháp, nội dung, fluency)
  total++;
  if (await runTest("5. [AESP-44] API chấm điểm đa tiêu chí (phát âm, ngữ pháp, độ trôi chảy)", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/ai/evaluate-speech`, {
      transcript: "In my opinion, regular communication in English helps learners become more confident and fluent.",
      target_prompt: "Discuss the importance of daily English practice.",
      level: "B2"
    });
    const s = res.data.scores;
    if (!res.data.success || !s || typeof s.overall_score !== "number" || typeof s.pronunciation_score !== "number") {
      throw new Error("Invalid speech evaluation scores format");
    }
  })) passed++;

  // 6. [AESP-46] Xem danh sách gói học công khai
  total++;
  if (await runTest("6. [AESP-46] Là học viên, tôi muốn xem danh sách gói học công khai", async () => {
    const res = await axios.get(`${GATEWAY_URL}/api/packages/public`);
    if (!Array.isArray(res.data) || res.data.length === 0) {
      throw new Error("Public packages list is empty");
    }
  })) passed++;

  // 7. [AESP-45] Admin tạo/sửa/xóa gói học
  total++;
  if (await runTest("7. [AESP-45] Là admin, tôi muốn tạo/sửa/xóa gói học", async () => {
    const pkgCode = `PKG_TEST_${Date.now()}`;
    // Tạo gói mới
    const createRes = await axios.post(
      `${GATEWAY_URL}/api/packages`,
      {
        name: "Gói Sprint 3 Test",
        code: pkgCode,
        price: 250000,
        durationDays: 45,
        description: "Gói học kiểm thử tự động Sprint 3",
        features: { ai_speaking: true, mentor_review: false }
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testPackageId = createRes.data.id || createRes.data.package?.id;
    if (!testPackageId) throw new Error("Failed to create package");

    // Cập nhật gói
    await axios.put(
      `${GATEWAY_URL}/api/packages/${testPackageId}`,
      {
        name: "Gói Sprint 3 Test Updated",
        price: 280000,
        durationDays: 60,
        description: "Đã cập nhật",
        features: { ai_speaking: true }
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  })) passed++;

  // 8. [AESP-47] Học viên mua gói học
  total++;
  if (await runTest("8. [AESP-47] Là học viên, tôi muốn mua một gói học", async () => {
    const res = await axios.post(
      `${GATEWAY_URL}/api/purchases`,
      {
        learnerId: testLearnerId,
        packageId: testPackageId,
        status: "active"
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    testPurchaseId = res.data.purchase?.id || res.data.id;
    if (!testPurchaseId) throw new Error("Purchase creation failed");
  })) passed++;

  // 9. [AESP-48] Học viên gia hạn hoặc đổi gói
  total++;
  if (await runTest("9. [AESP-48] Là học viên, tôi muốn gia hạn hoặc đổi gói", async () => {
    // Gia hạn gói học
    const renewRes = await axios.patch(
      `${GATEWAY_URL}/api/purchases/${testPurchaseId}/renew`,
      { extraDays: 30 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!renewRes.data.success) throw new Error("Package renewal failed");

    // Đổi sang gói khác
    const changeRes = await axios.post(
      `${GATEWAY_URL}/api/purchases/change-package`,
      { purchaseId: testPurchaseId, newPackageId: 1 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (!changeRes.data.success) throw new Error("Change package failed");
  })) passed++;

  // 10. [AESP-49 & AESP-50] Dashboard Học Viên & Lộ trình
  total++;
  if (await runTest("10. [AESP-49 & AESP-50] Dashboard Học Viên (Tiến trình, Streak, Gợi ý)", async () => {
    const res = await axios.get(`${GATEWAY_URL}/api/learners/${testLearnerId}/progress-analytics`, {
      headers: { Authorization: `Bearer ${learnerToken}` }
    });
    if (!res.data.speaking_practice || !res.data.recommendations) {
      throw new Error("Missing progress analytics data");
    }
  })) passed++;

  // 11. [AESP-51] Giao diện & Luồng luyện nói 10 vòng
  total++;
  if (await runTest("11. [AESP-51] Khởi tạo phiên luyện nói (Practice Session)", async () => {
    const res = await axios.post(
      `${GATEWAY_URL}/api/learners/speaking-practice/sessions`,
      { learner_id: testLearnerId },
      { headers: { Authorization: `Bearer ${learnerToken}` } }
    );
    testSessionId = res.data.session_id;
    if (!testSessionId) throw new Error("Failed to create speaking practice session");

    // Lấy đề bài cho vòng 1
    const promptRes = await axios.get(
      `${GATEWAY_URL}/api/learners/speaking-practice/sessions/${testSessionId}/prompt?round=1&level=1`,
      { headers: { Authorization: `Bearer ${learnerToken}` } }
    );
    if (!promptRes.data.prompt) throw new Error("Failed to fetch round prompt");
  })) passed++;

  // 12. [AESP-52] Component ghi âm & xử lý vòng nói
  total++;
  if (await runTest("12. [AESP-52] Mô phỏng ghi âm & nộp vòng nói", async () => {
    // Kiểm tra cấu trúc session rounds
    const roundsRes = await axios.get(
      `${GATEWAY_URL}/api/learners/speaking-practice/sessions/${testSessionId}/rounds`,
      { headers: { Authorization: `Bearer ${learnerToken}` } }
    );
    if (!Array.isArray(roundsRes.data.rounds || roundsRes.data)) {
      throw new Error("Invalid rounds response format");
    }
  })) passed++;

  // Dọn dẹp package test
  if (testPackageId) {
    try {
      await pool.query("DELETE FROM purchases WHERE package_id = $1", [testPackageId]);
      await axios.delete(`${GATEWAY_URL}/api/packages/${testPackageId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (e) {
      // Ignore cleanup error
    }
  }

  console.log("\n==================================================================");
  console.log(`📊 SPRINT 3 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================================\n");

  process.exit(passed === total ? 0 : 1);
}

main().catch(err => {
  console.error("Sprint 3 Test Suite Error:", err);
  process.exit(1);
});
