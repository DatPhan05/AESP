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
| **AESP-43** | API sinh đề bài/câu hỏi luyện nói theo chuẩn CEFR (A1–C2) | `AI Service & Speech` | Automated API & Live UI | ✅ PASSED |
| **AESP-44** | API chấm điểm bài nói đa tiêu chí (phát âm, ngữ pháp, từ vựng, độ trôi chảy) | `AI Service & Speech` | Automated API Test | ✅ PASSED |
| **AESP-45** | Admin tạo, cập nhật, xóa gói học (`/api/packages`) | `Package & Subscription` | Automated API & Chrome UI | ✅ PASSED |
| **AESP-46** | Học viên xem danh sách gói học công khai (`GET /api/packages/public`) | `Package & Subscription` | Automated API & Chrome UI | ✅ PASSED |
| **AESP-47** | Học viên mua một gói học mới (`POST /api/purchases`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-48** | Học viên gia hạn hoặc đổi gói học (`PATCH /api/purchases/:id/renew`, `POST /api/purchases/change-package`) | `Package & Subscription` | Automated API Test | ✅ PASSED |
| **AESP-49** | Layout Dashboard Học Viên (Sidebar, Header, Responsive container) | `Learner Features` | Chrome Live E2E | ✅ PASSED |
| **AESP-50** | Dashboard Học Viên (Tiến trình điểm, Streak ngày, Gợi ý bài học) | `Learner Features` | Chrome Live E2E | ✅ PASSED |
| **AESP-51** | Giao diện & luồng luyện nói 10 vòng (Practice Session luồng tuần tự) | `Learner Features` | Chrome Live E2E | ✅ PASSED |
| **AESP-52** | Component ghi âm giọng nói (MediaRecorder, audio submit & waveform) | `Learner Features` | Chrome Live E2E | ✅ PASSED |

---

## 📸 2. Minh chứng kiểm thử thực tế trên Chrome (Live Screenshots)

### 2.1. Dashboard Học Viên & Phân tích tiến độ (AESP-49 & AESP-50)
- **Tập tin:** `01_learner_dashboard.png`
- **Mô tả:** Màn hình Dashboard phân quyền của Học viên (`/learn/dashboard`). Gồm Sidebar điều hướng chuyên biệt, Header chào mừng học viên, các thẻ thống kê tổng quan (Điểm tổng thể, Tổng số lần luyện tập, Lần luyện nói), biểu đồ tiến trình và khu vực nhận xét đánh giá & gợi ý cải thiện từ AI.

![01_learner_dashboard](01_learner_dashboard.png)

---

### 2.2. Giao diện Luyện nói 10 vòng & Component Microphone thu âm (AESP-51 & AESP-52)
- **Tập tin:** `03_speaking_practice.png`
- **Mô tả:** Màn hình luyện nói vòng 1/10 (`/learn/practice`). AI sinh đề bài tự động theo CEFR (*"Đọc đoạn văn sau: I like weather. It is fun."*), hiển thị bộ đếm ngược thời gian (10s), component nút Microphone ghi âm phát sáng đỏ viền sóng âm thanh (Audio Waveform) kèm trạng thái *"Đang ghi âm..."*.

![03_speaking_practice](03_speaking_practice.png)

---

### 2.3. Danh sách Quản lý Gói học dành cho Admin (AESP-45)
- **Tập tin:** `04_admin_packages.png`
- **Mô tả:** Màn hình Quản lý Gói học của Quản trị viên (`/admin/packages`). Hiển thị danh sách các gói học (Gói Tiêu Chuẩn 199.000đ/30 ngày, Gói Chuyên Sâu 399.000đ/90 ngày), nút `+ Thêm gói học` và các nút thao tác Sửa / Xóa gói học.

![04_admin_packages](04_admin_packages.png)

---

### 2.4. Kho tài liệu & Danh mục học tập Học viên (AESP-46)
- **Tập tin:** `02_packages_catalog.png`
- **Mô tả:** Màn hình Kho học liệu và tài nguyên học tập công khai dành cho học viên (`/learn/catalog`).

![02_packages_catalog](02_packages_catalog.png)

---

## 📊 3. Kết quả kiểm thử tự động (Automated Test Suite)

### 3.1. Lệnh thực thi:
```bash
# Chạy riêng kiểm thử Sprint 3:
npm run test:sprint3

# Chạy kiểm thử toàn bộ các Sprints:
npm run test:all-sprints
```

### 3.2. Output kết quả kiểm thử (13/13 tests Passed - 100%):
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
```
