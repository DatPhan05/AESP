# 📋 SPRINT 3 - TEST EXECUTION & EVIDENCE REPORT

> **Dự án:** AESP (Academic English Speaking Practice)  
> **Giai đoạn:** Sprint 3 - AI & Core Services  
> **Thời gian thực hiện kiểm thử:** 26/10/2026  
> **Môi trường:** Local Dev (`http://localhost:5173`, API Gateway `http://localhost:4000`, AI Service `http://localhost:4010`, Learner Service `http://localhost:4007`, Package Service `http://localhost:4003`, Purchase Service `http://localhost:4004`, PostgreSQL Docker port `5433`)

---

## 🎯 1. Danh sách tính năng kiểm thử (Sprint 3 Scope)

| Mã Task | Tên tính năng / User Story | Phân loại | Phương thức kiểm thử | Trạng thái |
|---|---|---|---|---|
| **AESP-40** | Khởi tạo AI Service project & Health check (port 4010) | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-41** | Tích hợp WhisperX STT: API nhận file audio → trả transcript | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-42** | Cấu hình OpenRouter / OpenAI GPT request wrapper | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-43** | API sinh đề bài/câu hỏi luyện nói theo chuẩn CEFR (A1–C2) | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-44** | API chấm điểm bài nói đa tiêu chí (phát âm, ngữ pháp, từ vựng, độ trôi chảy) | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-45** | Admin tạo, cập nhật, xóa gói học (`/api/packages`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-46** | Học viên xem danh sách gói học công khai (`GET /api/packages/public`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-47** | Học viên mua một gói học mới (`POST /api/purchases`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-48** | Học viên gia hạn hoặc đổi gói học (`PATCH /api/purchases/:id/renew`, `POST /api/purchases/change-package`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-49** | Layout Dashboard Học Viên (Sidebar, Header, Responsive container) | `Learner Features` | Component & E2E Route | ✅ PASSED |
| **AESP-50** | Dashboard Học Viên (Tiến trình điểm, Streak ngày, Gợi ý bài học) | `Learner Features` | Automated API & UI State | ✅ PASSED |
| **AESP-51** | Giao diện & luồng luyện nói 10 vòng (Practice Session luồng tuần tự) | `Learner Features` | Automated API & Component Flow | ✅ PASSED |
| **AESP-52** | Component ghi âm giọng nói (MediaRecorder, audio submit & waveform) | `Learner Features` | Audio Mock & API Submit | ✅ PASSED |

---

## 📊 2. Kết quả kiểm thử tự động (Automated Test Suite)

### 2.1. Lệnh thực thi riêng Sprint 3:
```bash
npm run test:sprint3
# hoặc trực tiếp:
node backend/scripts/test-sprint3.js
```

### 2.2. Lệnh thực thi toàn bộ Sprints (Sprint 1, 2, 3):
```bash
npm run test:all-sprints
```

### 2.3. Output kiểm thử thực tế:
```text
==================================================================
🚀 SPRINT 3 AUTOMATED TEST SUITE: AI & CORE SERVICES
📡 Target Gateway: http://localhost:4000
🤖 Target AI Service: http://localhost:4010
==================================================================

⏳ Setup Test Auth Tokens (Admin & Learner)... ✅ PASS
⏳ 1. [AESP-40] Khởi tạo AI Service project & Health Check... ✅ PASS
⏳ 2. [AESP-41] Tích hợp WhisperX STT: API nhận audio → transcript... ✅ PASS
⏳ 3. [AESP-42] Cấu hình OpenRouter + AI Assistant wrapper... ✅ PASS
⏳ 4. [AESP-43] API sinh đề bài/câu hỏi theo cấp độ A1–C2... ✅ PASS
⏳ 5. [AESP-44] API chấm điểm đa tiêu chí (phát âm, ngữ pháp, độ trôi chảy)... ✅ PASS
⏳ 6. [AESP-46] Là học viên, tôi muốn xem danh sách gói học công khai... ✅ PASS
⏳ 7. [AESP-45] Là admin, tôi muốn tạo/sửa/xóa gói học... ✅ PASS
⏳ 8. [AESP-47] Là học viên, tôi muốn mua một gói học... ✅ PASS
⏳ 9. [AESP-48] Là học viên, tôi muốn gia hạn hoặc đổi gói... ✅ PASS
⏳ 10. [AESP-49 & AESP-50] Dashboard Học Viên (Tiến trình, Streak, Gợi ý)... ✅ PASS
⏳ 11. [AESP-51] Khởi tạo phiên luyện nói (Practice Session)... ✅ PASS
⏳ 12. [AESP-52] Mô phỏng ghi âm & nộp vòng nói... ✅ PASS

==================================================================
📊 SPRINT 3 TEST SUMMARY: 13/13 TESTS PASSED (100%)
==================================================================

==================================================================
🏁 SPRINT TEST RUNNER SUMMARY REPORT
==================================================================
   Sprint 1: ✅ PASSED (exit code: 0)
   Sprint 2: ✅ PASSED (exit code: 0)
   Sprint 3: ✅ PASSED (exit code: 0)
==================================================================
```

---

## 🛠️ 3. Chi tiết kiến trúc & Các điều chỉnh kỹ thuật

1. **AI Service (`backend/services/ai-service`)**:
   - Khởi chạy tại cổng **4010** và tích hợp thông suốt qua API Gateway (`/api/ai/*`).
   - Bổ sung các routes chuẩn:
     - `POST /api/ai/generate-question`: Sinh chủ đề câu hỏi CEFR từ A1 đến C2 dựa theo trình độ và chủ đề học viên lựa chọn.
     - `POST /api/ai/evaluate-speech`: Đánh giá phát âm, ngữ pháp, từ vựng và độ trôi chảy (Fluency) với thang điểm 0–100 kèm phản hồi gợi ý chỉnh sửa cụ thể.
     - `POST /api/ai/transcribe`: Chuyển đổi audio recording thành văn bản phục vụ phân tích.
   - Gateway bypass/whitelist cấu hình trong `jwtMiddleware.js` đảm bảo cho phép gọi sinh đề bài và nộp audio.

2. **Package & Purchase Service (`backend/services/package-service`, `backend/services/purchase-service`)**:
   - Đồng bộ hóa cấu trúc bảng PostgreSQL `packages` (`name`, `code`, `description`, `price`, `duration_days`, `features`, `is_active`).
   - Chuẩn hóa luồng thanh toán và gia hạn trong bảng `purchases` (`learner_id`, `package_id`, `amount`, `payment_method`, `payment_status`, `start_date`, `end_date`).
   - Khắc phục lỗi `pathRewrite` trên API Gateway cho endpoint `/api/purchases`.

3. **Learner Service & Database Tables (`backend/services/learner-service`)**:
   - Khởi tạo 4 bảng dữ liệu cốt lõi trong PostgreSQL `aesp`:
     - `speaking_practice_sessions`
     - `speaking_practice_rounds`
     - `ai_learning_context`
     - `practice_history`
   - Điều chỉnh service `progressAnalyticsService.js` xử lý truy vấn an toàn, tương thích các bảng dữ liệu thực tế và thống kê streak, tiến độ học tập.

4. **Frontend Learner Experience (`frontend/src/components/learner`)**:
   - `LearnerLayout.jsx`: Cấu trúc Layout gồm Sidebar, Header, thanh điều hướng linh hoạt cho Học Viên.
   - `LearnerDashboard.jsx`: Hiển thị tiến trình, điểm số trung bình, chuỗi ngày học liên tục (streak) và danh mục bài luyện tập được đề xuất.
   - `SpeakingPractice.jsx` & `SpeakingRound.jsx`: Luồng luyện nói 10 vòng kết nối trực tiếp với mic thu âm (`MediaRecorder API`), gửi âm thanh và hiển thị phân tích AI tức thời.
