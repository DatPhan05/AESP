import * as notificationService from "../services/notificationService.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const notifications = await notificationService.getNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({ notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getNotificationById(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;
    const notification = await notificationService.findNotificationById(id, userId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (err) {
    console.error("getNotificationById error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createNotification(req, res) {
  try {
    const currentUserId = req.user.id || req.user.userId;
    const { userId, type, title, message, linkUrl, relatedPostId, relatedCommentId, relatedUserId } = req.body;

    const targetUserId = userId || currentUserId;
    if (!targetUserId || !title || !message) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin thông báo (title, message)" });
    }

    const created = await notificationService.createNotification({
      userId: targetUserId,
      type: type || "system",
      title,
      message,
      linkUrl,
      relatedPostId,
      relatedCommentId,
      relatedUserId
    });

    res.status(201).json({ success: true, notification: created });
  } catch (err) {
    console.error("createNotification error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;
    const deleted = await notificationService.deleteNotification(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

