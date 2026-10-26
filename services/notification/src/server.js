import express from "express";

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "notification" });
});

// Notifications routes
app.get("/api/notifications", (req, res) => {
  res.json({
    notifications: [
      {
        id: 1,
        title: "Chào mừng đến với AESP!",
        message: "Hãy bắt đầu buổi luyện nói tiếng Anh đầu tiên ngay hôm nay.",
        type: "system",
        is_read: false,
        created_at: new Date().toISOString()
      }
    ]
  });
});

app.get("/api/notifications/unread-count", (req, res) => {
  res.json({ count: 1 });
});

app.post("/api/notifications", (req, res) => {
  const { title, message, type } = req.body;
  res.status(201).json({
    notification: {
      id: Date.now(),
      title: title || "Thông báo mới",
      message: message || "",
      type: type || "system",
      is_read: false,
      created_at: new Date().toISOString()
    }
  });
});

app.patch("/api/notifications/:id/read", (req, res) => {
  res.json({ success: true, message: "Marked as read" });
});

app.patch("/api/notifications/mark-all-read", (req, res) => {
  res.json({ success: true, message: "All marked as read" });
});

app.delete("/api/notifications/:id", (req, res) => {
  res.json({ success: true, message: "Notification deleted" });
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});
