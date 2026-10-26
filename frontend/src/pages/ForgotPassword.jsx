import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { Button, Input, Alert } from "../components/common";
import "../styles/login.css";

import logo from "../assets/images/logo.png";
import bg from "../assets/images/background.png";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [identifier, setIdentifier] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Password rules
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    match: Boolean(newPassword) && newPassword === confirmPassword
  };

  const isPasswordValid =
    rules.length && rules.uppercase && rules.lowercase && rules.number && rules.special;

  // Step 1: Request security question
  async function handleStep1(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!identifier.trim()) {
      return setError("Vui lòng nhập email hoặc số điện thoại của tài khoản.");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        identifier: identifier.trim()
      });
      setSecurityQuestion(res.data.security_question);
      setMessage("Tìm thấy tài khoản! Vui lòng trả lời câu hỏi bảo mật bên dưới.");
      setStep(2);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Không tìm thấy tài khoản hoặc tài khoản chưa thiết lập câu hỏi bảo mật."
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify security answer
  async function handleStep2(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!securityAnswer.trim()) {
      return setError("Vui lòng nhập câu trả lời bảo mật.");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-security-answer", {
        identifier: identifier.trim(),
        security_answer: securityAnswer.trim()
      });
      setResetToken(res.data.resetToken);
      setMessage("Xác thực câu trả lời thành công! Hãy đặt mật khẩu mới.");
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || "Câu trả lời bảo mật không chính xác.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset password
  async function handleStep3(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isPasswordValid) {
      return setError("Mật khẩu mới chưa đáp ứng đủ các tiêu chuẩn bảo mật.");
    }

    if (!rules.match) {
      return setError("Mật khẩu xác nhận không khớp.");
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword: newPassword.trim()
      });
      setMessage("🎉 Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      {/* Background */}
      <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} />

      {/* Logo */}
      <div
        className="brand cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="AESP Logo" className="brand-logo" />
      </div>

      {/* Card */}
      <div className="login-card" style={{ maxWidth: 480, margin: "20px auto" }}>
        {/* Visual Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #e2e8f0"
          }}
        >
          {[
            { num: 1, label: "Tài khoản" },
            { num: 2, label: "Xác thực" },
            { num: 3, label: "Mật khẩu" }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    background:
                      step === s.num
                        ? "var(--color-primary-600, #4f46e5)"
                        : step > s.num
                        ? "#10b981"
                        : "#e2e8f0",
                    color: step >= s.num ? "#ffffff" : "#64748b"
                  }}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: step === s.num ? 600 : 500,
                    color: step === s.num ? "var(--color-primary-700)" : "#64748b"
                  }}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: step > idx + 1 ? "#10b981" : "#e2e8f0",
                    margin: "0 8px"
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </div>
        )}

        {message && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="success" onClose={() => setMessage("")}>
              {message}
            </Alert>
          </div>
        )}

        {/* STEP 1: Enter email / phone */}
        {step === 1 && (
          <>
            <h1 className="card-title">Quên mật khẩu</h1>
            <p className="card-subtitle">
              Nhập email hoặc số điện thoại để tìm câu hỏi bảo mật đã đăng ký.
            </p>

            <form className="form" onSubmit={handleStep1} noValidate>
              <Input
                label="Email hoặc Số điện thoại"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com hoặc 0987654321"
                autoComplete="username"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                style={{ marginTop: 12 }}
              >
                {loading ? "Đang tìm kiếm..." : "Tiếp theo →"}
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: Answer security question */}
        {step === 2 && (
          <>
            <h1 className="card-title">Câu hỏi bảo mật</h1>
            <p className="card-subtitle">
              Vui lòng trả lời chính xác câu hỏi bảo mật để xác minh danh tính.
            </p>

            <form className="form" onSubmit={handleStep2} noValidate>
              <div className="aesp-input-group">
                <label className="aesp-input-label">
                  <span>Câu hỏi của bạn:</span>
                </label>
                <div
                  style={{
                    background: "var(--color-primary-50, #eef2ff)",
                    border: "1px solid var(--color-primary-200, #c7d2fe)",
                    padding: "12px 14px",
                    borderRadius: 8,
                    fontWeight: 600,
                    color: "var(--color-primary-800, #3730a3)",
                    fontSize: 14
                  }}
                >
                  {securityQuestion}
                </div>
              </div>

              <Input
                label="Câu trả lời bảo mật"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Nhập câu trả lời của bạn"
                autoComplete="off"
              />

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  ← Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={{ flex: 2 }}
                >
                  {loading ? "Đang xác thực..." : "Xác nhận →"}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: Enter new password */}
        {step === 3 && (
          <>
            <h1 className="card-title">Đặt mật khẩu mới</h1>
            <p className="card-subtitle">
              Thiết lập mật khẩu an toàn mới cho tài khoản của bạn.
            </p>

            <form className="form" onSubmit={handleStep3} noValidate>
              <Input
                label="Mật khẩu mới"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
              />

              {/* Password Strength Checklist */}
              {newPassword && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 12px"
                  }}
                >
                  <span style={{ color: rules.length ? "#10b981" : "#94a3b8" }}>
                    {rules.length ? "✓" : "○"} Tối thiểu 8 ký tự
                  </span>
                  <span style={{ color: rules.uppercase ? "#10b981" : "#94a3b8" }}>
                    {rules.uppercase ? "✓" : "○"} Có chữ hoa (A-Z)
                  </span>
                  <span style={{ color: rules.lowercase ? "#10b981" : "#94a3b8" }}>
                    {rules.lowercase ? "✓" : "○"} Có chữ thường (a-z)
                  </span>
                  <span style={{ color: rules.number ? "#10b981" : "#94a3b8" }}>
                    {rules.number ? "✓" : "○"} Có chữ số (0-9)
                  </span>
                  <span style={{ color: rules.special ? "#10b981" : "#94a3b8", gridColumn: "span 2" }}>
                    {rules.special ? "✓" : "○"} Có ký tự đặc biệt (!@#$%...)
                  </span>
                </div>
              )}

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                error={confirmPassword && !rules.match ? "Mật khẩu xác nhận không khớp" : ""}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                style={{ marginTop: 12 }}
              >
                {loading ? "Đang cập nhật..." : "Hoàn tất đặt lại mật khẩu"}
              </Button>
            </form>
          </>
        )}

        {/* Back to login link */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
          Nhớ mật khẩu rồi?{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
