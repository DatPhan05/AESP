import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";
import { Button, Input, Alert } from "../components/common";
import "../styles/login.css";

import logo from "../assets/images/logo.png";
import bg from "../assets/images/background.png";

const DEFAULT_QUESTIONS = [
  "Tên trường tiểu học đầu tiên của bạn là gì?",
  "Tên thú cưng đầu tiên của bạn là gì?",
  "Món ăn yêu thích nhất của bạn là gì?",
  "Thành phố nơi cha mẹ bạn gặp nhau là gì?",
  "Bộ phim yêu thích thời thơ ấu của bạn là gì?"
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(DEFAULT_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [predefinedQuestions, setPredefinedQuestions] = useState(DEFAULT_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Load predefined questions from API if available
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await api.get("/auth/security-questions/predefined");
        if (res.data?.questions?.length > 0) {
          setPredefinedQuestions(res.data.questions);
          setSecurityQuestion(res.data.questions[0]);
        }
      } catch (e) {
        // Fallback to default questions
      }
    }
    loadQuestions();
  }, []);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    match: Boolean(password) && password === confirmPassword
  };

  const isPasswordValid =
    rules.length && rules.uppercase && rules.lowercase && rules.number && rules.special;

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) return setError("Vui lòng nhập họ và tên.");
    if (!email.trim() && !phone.trim()) return setError("Vui lòng nhập email hoặc số điện thoại.");
    
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      return setError("Địa chỉ email không đúng định dạng.");
    }

    if (phone.trim() && !/^0\d{9}$/.test(phone.trim())) {
      return setError("Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 0).");
    }

    if (!isPasswordValid) {
      return setError("Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật.");
    }

    if (!rules.match) {
      return setError("Mật khẩu xác nhận không khớp.");
    }

    const finalQuestion = isCustomQuestion ? customQuestion.trim() : securityQuestion;
    if (!finalQuestion) {
      return setError("Vui lòng chọn hoặc nhập câu hỏi bảo mật.");
    }

    if (!securityAnswer.trim()) {
      return setError("Vui lòng nhập câu trả lời cho câu hỏi bảo mật.");
    }

    if (!agreeTerms) {
      return setError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase() || null,
        phone: phone.trim() || null,
        password,
        role: "learner",
        security_question: finalQuestion,
        security_answer: securityAnswer.trim().toLowerCase()
      });

      setSuccess("🎉 Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
      setError(err?.response?.data?.message || err?.message || "Đăng ký thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      {/* Hero Background */}
      <div className="hero-bg" style={{ backgroundImage: `url(${bg})` }} />

      {/* Brand Header */}
      <div
        className="brand cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="AESP Logo" className="brand-logo" />
      </div>

      {/* Register Card */}
      <div className="login-card" style={{ maxWidth: 520, margin: "20px auto" }}>
        <h1 className="card-title">Tạo tài khoản AESP mới</h1>
        <p className="card-subtitle">
          Bắt đầu hành trình nâng tầm phản xạ tiếng Anh cùng AI English Partner
        </p>

        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="success">{success}</Alert>
          </div>
        )}

        <form className="form" onSubmit={handleRegister} noValidate>
          {/* Full Name */}
          <Input
            label="Họ và tên"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            autoComplete="name"
          />

          {/* Email */}
          <Input
            label="Địa chỉ Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
          />

          {/* Phone */}
          <Input
            label="Số điện thoại"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0987654321 (tùy chọn)"
            autoComplete="tel"
          />

          {/* Password */}
          <Input
            label="Mật khẩu"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
          />

          {/* Real-time Password Strength Checklist */}
          {password && (
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

          {/* Confirm Password */}
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            error={confirmPassword && !rules.match ? "Mật khẩu không khớp" : ""}
          />

          {/* Security Question Section */}
          <div className="aesp-input-group">
            <label className="aesp-input-label">
              <span>
                Câu hỏi bảo mật <span className="aesp-input-required">*</span>
              </span>
            </label>
            <select
              className="aesp-input"
              value={isCustomQuestion ? "custom" : securityQuestion}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setIsCustomQuestion(true);
                } else {
                  setIsCustomQuestion(false);
                  setSecurityQuestion(e.target.value);
                }
              }}
            >
              {predefinedQuestions.map((q, idx) => (
                <option key={idx} value={q}>
                  {q}
                </option>
              ))}
              <option value="custom">-- Tự nhập câu hỏi khác --</option>
            </select>
          </div>

          {isCustomQuestion && (
            <Input
              label="Câu hỏi tự đặt"
              required
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Nhập câu hỏi bảo mật của bạn..."
            />
          )}

          {/* Security Answer */}
          <Input
            label="Câu trả lời bảo mật"
            required
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="Câu trả lời dùng khi khôi phục tài khoản"
            helperText="Câu trả lời không phân biệt chữ hoa chữ thường"
          />

          {/* Terms Agreement Checkbox */}
          <div className="helper-row" style={{ marginTop: 6 }}>
            <label className="checkbox" style={{ alignItems: "flex-start", gap: 8 }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                Tôi đồng ý với <strong>Điều khoản sử dụng</strong> và{" "}
                <strong>Chính sách quyền riêng tư</strong> của AESP.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
