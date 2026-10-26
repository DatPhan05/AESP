/**
 * Session Service
 * Quản lý user sessions để đảm bảo 1 tài khoản chỉ hoạt động trên 1 thiết bị
 */
import crypto from "crypto";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Tạo session mới cho user và invalidate tất cả sessions cũ
 */
export async function createSession(userId, deviceInfo = null, ipAddress = null, userAgent = null) {
  try {
    // Invalidate tất cả sessions cũ của user này
    await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE 
       WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    // Tạo JWT token
    const user = await pool.query("SELECT id, email, phone, role, name FROM users WHERE id = $1", [userId]);
    if (user.rows.length === 0) {
      throw new Error("User not found");
    }

    const userData = user.rows[0];
    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        phone: userData.phone, 
        role: userData.role, 
        name: userData.name,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Tính expires_at từ JWT_EXPIRES
    const expiresInMs = parseJWTExpires(JWT_EXPIRES);
    const expiresAt = new Date(Date.now() + expiresInMs);
    const tokenHash = hashToken(token);

    // Tạo session mới lưu vào database
    const result = await pool.query(
      `INSERT INTO user_sessions 
       (user_id, token_hash, ip_address, user_agent, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [userId, tokenHash, ipAddress, userAgent, expiresAt]
    );

    return {
      session: result.rows[0],
      token: token
    };
  } catch (err) {
    console.error("❌ Error creating session:", err);
    throw err;
  }
}

/**
 * Kiểm tra session có hợp lệ không
 */
export async function validateSession(token) {
  try {
    // Kiểm tra JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return { valid: false, reason: "Invalid token" };
    }

    // Kiểm tra session trong database
    const tokenHash = hashToken(token);
    const result = await pool.query(
      `SELECT * FROM user_sessions 
       WHERE token_hash = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: "Session not found or expired" };
    }

    return { 
      valid: true, 
      session: result.rows[0],
      userId: decoded.id 
    };
  } catch (err) {
    console.error("❌ Error validating session:", err);
    return { valid: false, reason: "Server error" };
  }
}

/**
 * Xóa session (logout)
 */
export async function deleteSession(token) {
  try {
    const tokenHash = hashToken(token);
    await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE 
       WHERE token_hash = $1`,
      [tokenHash]
    );
    return true;
  } catch (err) {
    console.error("❌ Error deleting session:", err);
    return false;
  }
}

/**
 * Xóa tất cả sessions của user
 */
export async function deleteAllUserSessions(userId) {
  try {
    await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE 
       WHERE user_id = $1`,
      [userId]
    );
    return true;
  } catch (err) {
    console.error("❌ Error deleting all user sessions:", err);
    return false;
  }
}

/**
 * Parse JWT_EXPIRES string thành milliseconds
 */
function parseJWTExpires(expires) {
  const match = String(expires).match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 1 day

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions() {
  try {
    const result = await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE 
       WHERE expires_at < NOW() AND is_active = TRUE`
    );
    return result.rowCount;
  } catch (err) {
    console.error("❌ Error cleaning up expired sessions:", err);
    return 0;
  }
}
