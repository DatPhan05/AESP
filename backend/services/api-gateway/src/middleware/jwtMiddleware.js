import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Paths that bypass JWT verification on the gateway
const PUBLIC_PREFIXES = [
  "/health",
  "/uploads",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-security-answer",
  "/api/auth/reset-password",
  "/api/auth/security-questions",
  "/api/packages/active"
];

export function verifyGatewayJwt(req, res, next) {
  // Allow preflight OPTIONS
  if (req.method === "OPTIONS") {
    return next();
  }

  const path = req.path || req.url;

  // Check if public path
  const isPublic = PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix));
  if (isPublic) {
    return next();
  }

  // Extract Bearer token
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Vui lòng cung cấp Bearer token hợp lệ để truy cập"
    });
  }

  const token = authHeader.substring(7).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Inject downstream identity headers
    if (decoded.id || decoded.userId) {
      req.headers["x-user-id"] = String(decoded.id || decoded.userId);
    }
    if (decoded.role) {
      req.headers["x-user-role"] = String(decoded.role);
    }
    if (decoded.email) {
      req.headers["x-user-email"] = String(decoded.email);
    }
    
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token đã hết hạn, vui lòng đăng nhập lại",
        code: "TOKEN_EXPIRED"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token không hợp lệ",
      code: "INVALID_TOKEN"
    });
  }
}
