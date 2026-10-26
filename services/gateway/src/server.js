import express from "express";

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// JWT Verification Middleware for protected API endpoints
const PUBLIC_API_PATHS = [
  "/health",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-security-answer",
  "/api/auth/reset-password",
  "/api/auth/security-questions",
  "/api/packages/active"
];

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  const isPublic = PUBLIC_API_PATHS.some(p => req.path.startsWith(p));
  if (isPublic) return next();

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Vui lòng cung cấp Bearer token hợp lệ để truy cập",
      path: req.path
    });
  }
  next();
});

// Placeholder route dispatchers
app.use("/api/auth", (req, res) => {
  res.json({ message: "Auth route placeholder", method: req.method, path: req.path });
});

app.use("/api/users", (req, res) => {
  res.json({ message: "Users route placeholder", method: req.method, path: req.path });
});

app.use("/api/notifications", (req, res) => {
  res.json({ message: "Notifications route placeholder", method: req.method, path: req.path });
});

app.use("/api/community", (req, res) => {
  res.json({ message: "Community route placeholder", method: req.method, path: req.path });
});

app.use("/api/packages", (req, res) => {
  res.json({ message: "Packages route placeholder", method: req.method, path: req.path });
});

app.use("/api/purchases", (req, res) => {
  res.json({ message: "Purchases route placeholder", method: req.method, path: req.path });
});

app.use("/api/learners", (req, res) => {
  res.json({ message: "Learners route placeholder", method: req.method, path: req.path });
});

app.use("/api/mentors", (req, res) => {
  res.json({ message: "Mentors route placeholder", method: req.method, path: req.path });
});

app.use("/api/admin", (req, res) => {
  res.json({ message: "Admin route placeholder", method: req.method, path: req.path });
});

app.use("/api/ai", (req, res) => {
  res.json({ message: "AI route placeholder", method: req.method, path: req.path });
});

// Central 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found on API Gateway", path: req.path });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
