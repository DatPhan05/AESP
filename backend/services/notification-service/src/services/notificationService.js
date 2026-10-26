import pool from "../config/db.js";

export async function createNotification({
  userId,
  type = "system",
  title,
  message,
  linkUrl = null
}) {
  const sql = `
    INSERT INTO notifications (user_id, type, title, message, link_url, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;
  const result = await pool.query(sql, [
    userId,
    type,
    title,
    message,
    linkUrl
  ]);
  return result.rows[0];
}

export async function createNotificationsForUsers({
  userIds,
  type = "system",
  title,
  message,
  linkUrl = null
}) {
  if (!userIds || userIds.length === 0) return [];

  const values = userIds.map((_, index) => {
    const baseIndex = index * 5;
    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, NOW())`;
  }).join(', ');

  const params = [];
  userIds.forEach(userId => {
    params.push(userId, type, title, message, linkUrl);
  });

  const sql = `
    INSERT INTO notifications (user_id, type, title, message, link_url, created_at)
    VALUES ${values}
    RETURNING *
  `;
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function getAllUserIds(excludeUserId = null) {
  let sql = `
    SELECT DISTINCT u.id
    FROM users u
  `;
  const params = [];
  if (excludeUserId) {
    params.push(excludeUserId);
    sql += ` WHERE u.id != $1`;
  }
  const result = await pool.query(sql, params);
  return result.rows.map(row => row.id);
}

export async function getNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const params = [userId];
  let sql = `
    SELECT 
      n.*
    FROM notifications n
    WHERE n.user_id = $1
  `;

  if (unreadOnly) {
    sql += ` AND n.is_read = false`;
  }

  sql += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit), offset);

  const result = await pool.query(sql, params);
  return result.rows;
}

export async function getUnreadCount(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND is_read = false
  `;
  const result = await pool.query(sql, [userId]);
  return parseInt(result.rows[0]?.count || 0, 10);
}

export async function markAsRead(notificationId, userId) {
  const sql = `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await pool.query(sql, [notificationId, userId]);
  return result.rows[0];
}

export async function markAllAsRead(userId) {
  const sql = `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1 AND is_read = false
    RETURNING *
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
}

export async function findNotificationById(id, userId) {
  const sql = `
    SELECT n.*
    FROM notifications n
    WHERE n.id = $1 AND ($2::int IS NULL OR n.user_id = $2)
  `;
  const result = await pool.query(sql, [id, userId || null]);
  return result.rows[0];
}

export async function deleteNotification(id, userId) {
  const sql = `
    DELETE FROM notifications
    WHERE id = $1 AND ($2::int IS NULL OR user_id = $2)
    RETURNING id
  `;
  const result = await pool.query(sql, [id, userId || null]);
  return result.rowCount > 0;
}
