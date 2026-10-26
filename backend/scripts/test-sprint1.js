/**
 * Automated Test Suite for Sprint 1
 * Focus: Foundation, Docker, PostgreSQL, API Gateway, Service Discovery & Seed Data
 * Run with: node backend/scripts/test-sprint1.js
 */
import axios from "axios";
import pool from "../src/config/db.js";

const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
  console.log("🚀 SPRINT 1 AUTOMATED TEST SUITE: FOUNDATION, INFRA & GATEWAY");
  console.log(`📡 Target Gateway: ${GATEWAY_URL}`);
  console.log(`🌐 Target Frontend: ${FRONTEND_URL}`);
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  // 1. PostgreSQL Connection
  total++;
  if (await runTest("1. [Infra] PostgreSQL Database Connectivity", async () => {
    const res = await pool.query("SELECT 1 + 1 AS sum, current_database() AS db_name;");
    if (!res.rows || res.rows[0].sum !== 2) throw new Error("Database query failed");
  })) passed++;

  // 2. Database Schema Tables
  total++;
  if (await runTest("2. [DB] Verify Core Database Tables Exist (20 tables)", async () => {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = res.rows.map(r => r.table_name);
    const required = ["users", "user_sessions", "packages", "notifications", "learners", "mentors", "admins"];
    const missing = required.filter(t => !tables.includes(t));
    if (missing.length > 0) throw new Error(`Missing required tables: ${missing.join(", ")}`);
  })) passed++;

  // 3. Database Seed Data
  total++;
  if (await runTest("3. [DB] Verify Default Package Seed Data", async () => {
    const res = await pool.query("SELECT code, name, price FROM packages WHERE code IN ('PKG-STANDARD', 'PKG-PRO');");
    if (res.rows.length < 2) throw new Error("Initial packages PKG-STANDARD and PKG-PRO not found in database");
  })) passed++;

  // 4. API Gateway Health
  total++;
  if (await runTest("4. [Gateway] API Gateway Health Check (GET /health)", async () => {
    const res = await axios.get(`${GATEWAY_URL}/health`, { timeout: 5000 });
    if (res.status !== 200 || res.data?.status !== "ok") throw new Error("Gateway health check failed");
  })) passed++;

  // 5. User Service Discovery via Gateway
  total++;
  if (await runTest("5. [Services] User Service Route Accessible via Gateway", async () => {
    // Calling an auth endpoint that exists and returns JSON
    const res = await axios.get(`${GATEWAY_URL}/api/auth/security-questions/predefined`, { timeout: 5000 });
    if (res.status !== 200) throw new Error(`User service returned status ${res.status}`);
  })) passed++;

  // 6. Notification Service Route Accessible via Gateway
  total++;
  if (await runTest("6. [Services] Notification Service Route Accessible via Gateway", async () => {
    try {
      await axios.get(`${GATEWAY_URL}/api/notifications`, { timeout: 5000 });
    } catch (err) {
      // Expect 401 Unauthorized because notification requires JWT, proving route reached service/gateway guard
      if (err.response?.status !== 401) {
        throw new Error(`Expected 401 Unauthorized, got: ${err.response?.status || err.message}`);
      }
    }
  })) passed++;

  // 7. CORS Configuration
  total++;
  if (await runTest("7. [Gateway] CORS Headers for Frontend Origin", async () => {
    const res = await axios.options(`${GATEWAY_URL}/health`, {
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
      }
    });
    const allowOrigin = res.headers["access-control-allow-origin"];
    if (allowOrigin !== "http://localhost:5173" && allowOrigin !== "*") {
      throw new Error(`Invalid CORS header: ${allowOrigin}`);
    }
  })) passed++;

  // 8. Frontend Dev Server Check
  total++;
  if (await runTest("8. [Frontend] Vite Dev Server Health", async () => {
    const res = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (res.status !== 200) throw new Error(`Frontend returned status ${res.status}`);
  })) passed++;

  console.log("\n==================================================================");
  console.log(`📊 SPRINT 1 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================================\n");

  await pool.end();
  process.exit(passed === total ? 0 : 1);
}

main().catch(async (err) => {
  console.error("Sprint 1 test suite fatal error:", err);
  await pool.end();
  process.exit(1);
});
