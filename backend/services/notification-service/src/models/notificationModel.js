import pool from "../config/db.js";

/**
 * Find notification by ID and user
 */
export async function findNotificationById(id, userId) {
  const sql = `
    SELECT n.*, u.name as related_user_name
    FROM notifications n
    LEFT JOIN users u ON n.related_user_id = u.id
    WHERE n.id = $1 AND ($2::int IS NULL OR n.user_id = $2)
  `;
  const result = await pool.query(sql, [id, userId || null]);
  return result.rows[0];
}

/**
 * Create a new notification
 */
export async function createNotificationInDb({
  userId,
  type = "system",
  title,
  message,
  linkUrl = null,
  relatedPostId = null,
  relatedCommentId = null,
  relatedUserId = null
}) {
  const sql = `
    INSERT INTO notifications (
      user_id, type, title, message, link_url, related_post_id, related_comment_id, related_user_id, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `;
  const result = await pool.query(sql, [
    userId,
    type,
    title,
    message,
    linkUrl,
    relatedPostId,
    relatedCommentId,
    relatedUserId
  ]);
  return result.rows[0];
}

/**
 * Query notifications for a user with pagination
 */
export async function getNotificationsFromDb(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const params = [userId];
  let sql = `
    SELECT 
      n.*,
      u.name AS related_user_name,
      p.content AS related_post_content,
      c.content AS related_comment_content
    FROM notifications n
    LEFT JOIN users u ON n.related_user_id = u.id
    LEFT JOIN community_posts p ON n.related_post_id = p.id
    LEFT JOIN post_comments c ON n.related_comment_id = c.id
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

/**
 * Get count of unread notifications for a user
 */
export async function countUnreadFromDb(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND is_read = false
  `;
  const result = await pool.query(sql, [userId]);
  return parseInt(result.rows[0]?.count || 0);
}

/**
 * Mark a single notification as read
 */
export async function markAsReadInDb(notificationId, userId) {
  const sql = `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await pool.query(sql, [notificationId, userId]);
  return result.rows[0];
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllAsReadInDb(userId) {
  const sql = `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1 AND is_read = false
    RETURNING *
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
}

/**
 * Delete a notification
 */
export async function deleteNotificationFromDb(notificationId, userId) {
  const sql = `
    DELETE FROM notifications
    WHERE id = $1 AND ($2::int IS NULL OR user_id = $2)
    RETURNING id
  `;
  const result = await pool.query(sql, [notificationId, userId || null]);
  return result.rowCount > 0;
}
