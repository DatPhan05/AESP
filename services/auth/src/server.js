import express from "express";

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) =>
  res.json({ ok: true, service: "auth" })
);

// Standard auth routes placeholder / fallback
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
  }
  return res.json({
    message: "Đăng nhập thành công",
    token: "mock-jwt-token",
    user: { id: 1, email: identifier, role: "learner", name: "Demo User" }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu" });
  }
  return res.status(201).json({
    message: "Đăng ký thành công",
    user: { id: 2, name: name || "Learner", email, role: "learner" }
  });
});

app.post("/api/auth/logout", (req, res) => {
  return res.json({ message: "Đăng xuất thành công" });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ message: "Vui lòng nhập email hoặc số điện thoại" });
  return res.json({
    message: "Vui lòng trả lời câu hỏi bảo mật",
    security_question: "Tên trường tiểu học đầu tiên của bạn là gì?",
    userId: 1
  });
});

app.post("/api/auth/verify-security-answer", (req, res) => {
  const { identifier, security_answer } = req.body;
  if (!identifier || !security_answer) {
    return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
  }
  return res.json({
    message: "Xác thực thành công",
    resetToken: "mock-reset-token-15m"
  });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token và mật khẩu mới không được để trống" });
  }
  return res.json({ message: "Đặt lại mật khẩu thành công" });
});

app.get("/", (req, res) =>
  res.json({ message: "AESP Auth Service API running" })
);

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`);
});
