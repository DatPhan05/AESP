/**
 * Automated Test Suite for Sprint 2 (AESP-26 -> AESP-39)
 * Tests end-to-end Authentication, Security Question, Profile, Gateway JWT and Notifications
 * Run with: node backend/scripts/test-sprint2.js
 */
import axios from "axios";

const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:4000";

const testUser = {
  name: "Sprint2 Test User",
  email: `test_sprint2_${Date.now()}@example.com`,
  phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
  password: "Password123!@#",
  newPassword: "NewPassword456!@#",
  security_question: "Tên thú cưng đầu tiên của bạn là gì?",
  security_answer: "milo"
};

let authToken = null;
let resetToken = null;
let createdNotificationId = null;

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

async function main() {
  console.log("\n==================================================================");
  console.log("🚀 SPRINT 2 AUTOMATED TEST SUITE: AUTHENTICATION & FOUNDATION");
  console.log(`📡 Target Gateway: ${GATEWAY_URL}`);
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  // 1. Health check
  total++;
  if (await runTest("1. API Gateway Health Check", async () => {
    const res = await axios.get(`${GATEWAY_URL}/health`);
    if (res.status !== 200 || res.data.status !== "ok") throw new Error("Gateway health not ok");
  })) passed++;

  // 2. [AESP-33] Gateway JWT Middleware: Rejects unauthorized request
  total++;
  if (await runTest("2. [AESP-33] Gateway JWT Middleware (Blocks request without token with 401)", async () => {
    try {
      await axios.get(`${GATEWAY_URL}/api/users/me`);
      throw new Error("Expected 401 Unauthorized but request succeeded");
    } catch (err) {
      if (err.response?.status === 401) return;
      throw err;
    }
  })) passed++;

  // 3. [AESP-28] Get predefined security questions
  total++;
  if (await runTest("3. [AESP-28] Fetch Predefined Security Questions", async () => {
    const res = await axios.get(`${GATEWAY_URL}/api/auth/security-questions/predefined`);
    if (!Array.isArray(res.data?.questions) || res.data.questions.length === 0) {
      throw new Error("Did not return questions list");
    }
  })) passed++;

  // 4. [AESP-26 & AESP-28] User Registration
  total++;
  if (await runTest("4. [AESP-26 & AESP-28] User Registration with Email, Password & Security Question", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      password: testUser.password,
      role: "learner",
      security_question: testUser.security_question,
      security_answer: testUser.security_answer
    });
    if (res.status !== 201) throw new Error("Status is not 201 Created");
  })) passed++;

  // 5. [AESP-27] User Login & JWT Issuance
  total++;
  if (await runTest("5. [AESP-27] User Login & JWT Token Issuance", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      identifier: testUser.email,
      password: testUser.password
    });
    if (!res.data.token) throw new Error("No token returned in login response");
    authToken = res.data.token;
  })) passed++;

  // 6. [AESP-30] View Current Profile (Authenticated via Gateway)
  total++;
  if (await runTest("6. [AESP-30] Get Current User Profile (GET /api/users/me)", async () => {
    const res = await axios.get(`${GATEWAY_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.data.user || res.data.user.email !== testUser.email) {
      throw new Error("Profile email mismatch");
    }
  })) passed++;

  // 7. [AESP-30] Edit Profile
  total++;
  if (await runTest("7. [AESP-30] Update User Profile (PUT /api/users/me)", async () => {
    const res = await axios.put(
      `${GATEWAY_URL}/api/users/me`,
      { name: "Updated Sprint2 Name", phone: "0911223344" },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data.success) throw new Error("Update profile did not return success");
  })) passed++;

  // 8. [AESP-32] Change Password
  total++;
  if (await runTest("8. [AESP-32] Change Password with Old Password Verification", async () => {
    const res = await axios.post(
      `${GATEWAY_URL}/api/auth/change-password`,
      {
        oldPassword: testUser.password,
        newPassword: testUser.newPassword
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (res.status !== 200) throw new Error("Password change failed");
  })) passed++;

  // 9. [AESP-29] Forgot Password Step 1: Request Security Question
  total++;
  if (await runTest("9. [AESP-29] Forgot Password Step 1 (Request Security Question)", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/forgot-password`, {
      identifier: testUser.email
    });
    if (!res.data.security_question) throw new Error("Security question not returned");
  })) passed++;

  // 10. [AESP-29] Forgot Password Step 2: Verify Security Answer
  total++;
  if (await runTest("10. [AESP-29] Forgot Password Step 2 (Verify Answer & Issue Reset Token)", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/verify-security-answer`, {
      identifier: testUser.email,
      security_answer: testUser.security_answer
    });
    if (!res.data.resetToken) throw new Error("Reset token was not issued");
    resetToken = res.data.resetToken;
  })) passed++;

  // 11. [AESP-29] Forgot Password Step 3: Reset Password
  total++;
  if (await runTest("11. [AESP-29] Forgot Password Step 3 (Reset Password with Token)", async () => {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/reset-password`, {
      token: resetToken,
      newPassword: "FinalPassword789!@#"
    });
    if (res.status !== 200) throw new Error("Reset password failed");
  })) passed++;

  // 12. [AESP-34] Notification Service CRUD: Create Notification
  total++;
  if (await runTest("12. [AESP-34] Create Notification (POST /api/notifications)", async () => {
    const res = await axios.post(
      `${GATEWAY_URL}/api/notifications`,
      {
        title: "Sprint 2 Test Alert",
        message: "Hệ thống xác thực đã sẵn sàng!",
        type: "system"
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!res.data.notification) throw new Error("Notification was not created");
    createdNotificationId = res.data.notification.id;
  })) passed++;

  // 13. [AESP-34] Notification Service CRUD: List & Unread Count
  total++;
  if (await runTest("13. [AESP-34] Get Notifications & Unread Count", async () => {
    const resList = await axios.get(`${GATEWAY_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const resCount = await axios.get(`${GATEWAY_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(resList.data.notifications)) throw new Error("Notifications array missing");
    if (typeof resCount.data.count !== "number") throw new Error("Unread count missing");
  })) passed++;

  // 14. [AESP-34] Notification Service CRUD: Mark as Read & Delete
  total++;
  if (await runTest("14. [AESP-34] Mark Read & Delete Notification", async () => {
    if (createdNotificationId) {
      await axios.patch(
        `${GATEWAY_URL}/api/notifications/${createdNotificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      await axios.delete(
        `${GATEWAY_URL}/api/notifications/${createdNotificationId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    }
  })) passed++;

  console.log("\n==================================================================");
  console.log(`📊 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log("==================================================================\n");
}

main().catch(console.error);
