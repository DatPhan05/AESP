# 📋 DANH SÁCH BACKLOG CÁC TASK THEO SPRINT (AESP PROJECT)

> **Dự án:** Development of an AI Education Support Platform (AESP)  
> **Jira Workspace:** `https://datphan.atlassian.net/jira/software/projects/AESP/boards/37/backlog`  
> **Cập nhật ngày:** 26/10/2026  

---

## 🏗️ SPRINT 1 – FOUNDATION, INFRASTRUCTURE & ARCHITECTURE
* **Thời gian hoàn thành:** 18 Oct – 26 Oct (13 work items)
* **Mục tiêu:** Thiết lập nền tảng dự án Monorepo, kiến trúc Microservices, cơ sở dữ liệu PostgreSQL, Docker hóa môi trường dev, API Gateway, và nền móng Frontend React + Vite.
* **Trạng thái thực tế:** Đã hoàn thành 100% (13/13 tasks `Done`, 8/8 automated tests `PASS`).

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-13** | Khởi tạo GitHub monorepo, cấu trúc thư mục dự án | `DevOps & Infra` | `Done` |
| **AESP-14** | Thiết kế kiến trúc microservices – phân chia services & ports | `Architecture` | `Done` |
| **AESP-15** | Thiết kế ERD đầy đủ (tất cả entities & relationships) | `Database` | `Done` |
| **AESP-16** | Viết schema SQL & migration scripts (PostgreSQL) | `Database` | `Done` |
| **AESP-17** | Cấu hình Docker & Docker Compose (tất cả services & DB) | `DevOps & Infra` | `Done` |
| **AESP-18** | Cấu hình Nginx reverse proxy (API + Frontend routing) | `DevOps & Infra` | `Done` |
| **AESP-19** | Khởi tạo & cấu hình API Gateway (Express.js, proxy, CORS) | `API Gateway` | `Done` |
| **AESP-20** | Khởi tạo project Vite + React 18, ESLint, Prettier | `Frontend Base` | `Done` |
| **AESP-21** | Thiết lập Design System (màu sắc, typography, components base) | `UI/UX & Design` | `Done` |
| **AESP-22** | Cấu hình React Router v6 (tất cả routes + Protected Routes) | `Frontend Base` | `Done` |
| **AESP-23** | Thiết lập AuthContext (user state, login/logout, token storage) | `Frontend Base` | `Done` |
| **AESP-24** | Cấu hình Axios instance (base URL, interceptors, error handling) | `Frontend Base` | `Done` |
| **AESP-25** | Wireframe tất cả màn hình (Auth, Learner, Mentor, Admin) | `UI/UX & Design` | `Done` |


---

## 📦 SPRINT 2 – AUTHENTICATION, AUTHORIZATION & USER FOUNDATION
* **Mục tiêu:** Hoàn thiện hạ tầng xác thực (Auth), quản lý phiên làm việc JWT, câu hỏi bảo mật, quản lý hồ sơ người dùng và hệ thống thông báo nền tảng.
* **Trạng thái thực tế:** Đã hoàn thành 100% (14/14 test cases pass, E2E Chrome verified).

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-26** | Đăng ký tài khoản người dùng với email & mật khẩu (Password Strength Validation) | `Auth & User Service` | `Done` |
| **AESP-27** | Đăng nhập hệ thống, cấp phát JWT Token & điều hướng phân quyền (Role Redirect) | `Auth & User Service` | `Done` |
| **AESP-28** | Thiết lập & xác thực câu hỏi bảo mật (Predefined Security Questions) | `Auth & User Service` | `Done` |
| **AESP-29** | Quy trình 3 bước khôi phục mật khẩu qua câu hỏi bảo mật | `Auth & User Service` | `Done` |
| **AESP-30** | Xem và cập nhật thông tin hồ sơ cá nhân (`GET / PUT /api/users/me`) | `User Profile` | `Done` |
| **AESP-31** | Upload và cập nhật ảnh đại diện người dùng (Avatar upload) | `User Profile` | `Done` |
| **AESP-32** | Đổi mật khẩu với xác thực mật khẩu cũ | `User Security` | `Done` |
| **AESP-33** | API Gateway JWT Middleware (Bảo vệ private routes, chặn 401 khi thiếu token) | `API Gateway & Security` | `Done` |
| **AESP-34** | Hệ thống thông báo nền tảng (Tạo, lấy danh sách, đếm chưa đọc, đánh dấu đã đọc) | `Notification System` | `Done` |
| **AESP-35** -> **AESP-39** | Tối ưu hóa UI/UX Auth, session handling và các cải tiến bảo mật liên quan | `Auth & Foundation` | `Done` |

---

## 🧠 SPRINT 3 – AI & CORE SERVICES
* **Thời gian:** 2 Nov – 9 Nov (13 work items)
* **Mục tiêu:** AI pipeline hoạt động, gói học & mua gói sẵn sàng, Dashboard học viên.

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-40** | Khởi tạo AI Service project (Node/Express, port 4010, dependencies, health check) | `AI Service & Speech` | `Done` |
| **AESP-41** | Tích hợp WhisperX / STT: API nhận file audio → trả transcript text | `AI Service & Speech` | `Done` |
| **AESP-42** | Cấu hình OpenRouter + OpenAI GPT (API key, request wrapper) | `AI Service & Speech` | `Done` |
| **AESP-43** | Là hệ thống, tôi cần API sinh đề bài/câu hỏi theo cấp độ A1–C2 | `AI Service & Speech` | `Done` |
| **AESP-44** | Là hệ thống, tôi cần API chấm điểm (phát âm, ngữ pháp, nội dung, fluency) | `AI Service & Speech` | `Done` |
| **AESP-45** | Là admin, tôi muốn tạo/sửa/xóa gói học | `Package & Subscription` | `Done` |
| **AESP-46** | Là học viên, tôi muốn xem danh sách gói học công khai | `Package & Subscription` | `Done` |
| **AESP-47** | Là học viên, tôi muốn mua một gói học | `Package & Subscription` | `Done` |
| **AESP-48** | Là học viên, tôi muốn gia hạn hoặc đổi gói | `Package & Subscription` | `Done` |
| **AESP-49** | Xây dựng layout Dashboard Học Viên (Sidebar, Header, responsive) | `Learner Features` | `Done` |
| **AESP-50** | Là học viên, tôi muốn thấy màn hình chủ với điểm, streak, gợi ý hôm nay | `Learner Features` | `Done` |
| **AESP-51** | Xây dựng giao diện luyện nói 10 vòng (layout, navigation giữa vòng) | `Learner Features` | `Done` |
| **AESP-52** | Component ghi âm (MediaRecorder API, waveform, start/stop/replay) | `Learner Features` | `Done` |

---

## 🎙️ SPRINT 4 – CORE FEATURE COMPLETE
* **Thời gian:** 9 Nov – 16 Nov (13 work items)
* **Mục tiêu:** Tính năng luyện nói hoàn chỉnh end-to-end – milestone quan trọng nhất (Học viên có thể đăng nhập → chọn gói → luyện nói với AI → nhận kết quả → xem lịch sử).

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-53** | Khởi tạo Learner Service (model PracticeSession, CRUD) | `Learner Features` | `To Do` |
| **AESP-54** | Là hệ thống, tôi cần lưu kết quả từng phiên luyện (điểm, transcript, audio) | `Learner Features` | `To Do` |
| **AESP-55** | Là học viên, tôi muốn xem lịch sử các phiên luyện tập | `Learner Features` | `To Do` |
| **AESP-56** | Là học viên, tôi muốn xem biểu đồ tiến trình điểm theo thời gian | `Learner Features` | `To Do` |
| **AESP-57** | Là học viên, tôi muốn xem thử thách hàng ngày và nộp bài | `Learner Features` | `To Do` |
| **AESP-58** | Là học viên, tôi muốn xem bảng xếp hạng và huy hiệu của mình | `Learner Features` | `To Do` |
| **AESP-59** | Xử lý upload & lưu trữ file audio (Multer, đường dẫn trả về) | `Learner Features` | `To Do` |
| **AESP-60** | Là học viên, tôi muốn nhận đề bài từ AI và bắt đầu ghi âm | `AI Service & Speech` | `To Do` |
| **AESP-61** | Tích hợp STT: gửi audio → nhận transcript → hiển thị | `AI Service & Speech` | `To Do` |
| **AESP-62** | Là học viên, tôi muốn thấy điểm và nhận xét chi tiết từ AI sau mỗi vòng | `AI Service & Speech` | `To Do` |
| **AESP-63** | Là học viên, tôi muốn thấy tổng kết điểm sau 10 vòng | `AI Service & Speech` | `To Do` |
| **AESP-64** | Là học viên, tôi muốn xem trang lịch sử với danh sách sessions | `Learner Features` | `To Do` |
| **AESP-65** | Là học viên, tôi muốn xem gói học, so sánh và mua gói | `Learner Features` | `To Do` |

---

## 👨‍🏫 SPRINT 5 – MENTOR SYSTEM
* **Thời gian:** 16 Nov – 23 Nov (14 work items)
* **Mục tiêu:** Hệ thống Mentor hoàn chỉnh, thông báo tự động.

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-66** | Khởi tạo Mentor Service (models: Challenge, MentorResource, Schedule) | `Mentor Features` | `To Do` |
| **AESP-67** | Là mentor, tôi muốn xem danh sách học viên được phân công | `Mentor Features` | `To Do` |
| **AESP-68** | Là mentor, tôi muốn xem chi tiết tiến trình của từng học viên | `Mentor Features` | `To Do` |
| **AESP-69** | Là mentor, tôi muốn tạo, chỉnh sửa, xóa thử thách | `Mentor Features` | `To Do` |
| **AESP-70** | Là mentor, tôi muốn giao thử thách cho học viên | `Mentor Features` | `To Do` |
| **AESP-71** | Là mentor, tôi muốn xem bài nộp (audio + transcript) và chấm điểm | `Mentor Features` | `To Do` |
| **AESP-72** | Là mentor, tôi muốn upload tài nguyên học tập cho học viên | `Mentor Features` | `To Do` |
| **AESP-73** | Tự động tạo thông báo khi có bài nộp mới / thử thách mới | `Notification System` | `To Do` |
| **AESP-74** | Xây dựng layout Dashboard Mentor (Sidebar, Header riêng) | `Mentor Features` | `To Do` |
| **AESP-75** | Là mentor, tôi muốn thấy bảng danh sách học viên với điểm & cảnh báo | `Mentor Features` | `To Do` |
| **AESP-76** | Là mentor, tôi muốn thấy trang chi tiết học viên (lịch sử, biểu đồ, lỗi) | `Mentor Features` | `To Do` |
| **AESP-77** | Là mentor, tôi muốn tạo và quản lý thử thách trên giao diện | `Mentor Features` | `To Do` |
| **AESP-78** | Là mentor, tôi muốn nghe audio và nhập điểm/nhận xét bài nộp | `Mentor Features` | `To Do` |
| **AESP-79** | Component Notification Bell (icon, badge count, dropdown list) | `Mentor Features` | `To Do` |

---

## 🛡️ SPRINT 6 – ADMIN & SOCIAL FEAT
* **Thời gian:** 23 Nov – 30 Nov (16 work items)
* **Mục tiêu:** Admin dashboard, Community, bảo mật, CI/CD.

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-80** | Khởi tạo Admin Service (dashboard stats, content management) | `Admin Features` | `To Do` |
| **AESP-81** | Là admin, tôi muốn thấy thống kê tổng quan (users, sessions, revenue) | `Admin Features` | `To Do` |
| **AESP-82** | Là admin, tôi muốn quản lý chủ đề và tình huống luyện tập | `Admin Features` | `To Do` |
| **AESP-83** | Khởi tạo Community Service (models: Post, Comment, Like) | `Community & Social` | `To Do` |
| **AESP-84** | Là người dùng, tôi muốn đăng bài với text và media | `Community & Social` | `To Do` |
| **AESP-85** | Là người dùng, tôi muốn bình luận và like bài đăng | `Community & Social` | `To Do` |
| **AESP-86** | Bảo mật toàn hệ thống (rate limiting, input sanitization, CORS) | `DevOps & Infrastructure` | `To Do` |
| **AESP-87** | Thiết lập CI/CD GitHub Actions (build, lint, test tự động) | `DevOps & Infrastructure` | `To Do` |
| **AESP-88** | Viết tài liệu Swagger/OpenAPI cho tất cả services | `DevOps & Infrastructure` | `To Do` |
| **AESP-89** | Layout Dashboard Admin (Sidebar với full quyền Admin) | `Admin Features` | `To Do` |
| **AESP-90** | Là admin, tôi muốn thấy dashboard với thống kê và biểu đồ | `Admin Features` | `To Do` |
| **AESP-91** | Là admin, tôi muốn quản lý người dùng (CRUD, phân quyền, khóa TK) | `Admin Features` | `To Do` |
| **AESP-92** | Là admin, tôi muốn quản lý gói học trên giao diện | `Admin Features` | `To Do` |
| **AESP-93** | Là người dùng, tôi muốn xem, đăng bài, bình luận trong Community | `Community & Social` | `To Do` |
| **AESP-94** | Là học viên, tôi muốn xem bảng xếp hạng toàn hệ thống | `Community & Social` | `To Do` |
| **AESP-95** | Responsive design & UI polish toàn bộ ứng dụng | `Community & Social` | `To Do` |

---

## 🚀 SPRINT 7 – TESTING & LAUNCH
* **Thời gian:** 30 Nov – 7 Dec (17 work items)
* **Mục tiêu:** Kiểm thử toàn diện, fix bugs, deploy production, bàn giao.

| Mã Task | Tên công việc / User Story | Phân loại (Tag) | Trạng thái |
|:---:|---|---|:---:|
| **AESP-96** | Kiểm thử API toàn diện (Postman – tất cả endpoints, edge cases) | `Testing & QA` | `To Do` |
| **AESP-97** | Kiểm thử tích hợp AI pipeline (nhiều loại giọng, chất lượng audio) | `Testing & QA` | `To Do` |
| **AESP-98** | Kiểm thử bảo mật (auth bypass, SQL injection, CORS violation) | `Testing & QA` | `To Do` |
| **AESP-99** | Kiểm thử UI – luồng Học Viên (đăng ký → luyện nói → kết quả) | `Testing & QA` | `To Do` |
| **AESP-100** | Kiểm thử UI – luồng Mentor (login → xem học viên → chấm bài) | `Testing & QA` | `To Do` |
| **AESP-101** | Kiểm thử UI – luồng Admin (login → thống kê → quản lý users) | `Testing & QA` | `To Do` |
| **AESP-102** | Kiểm thử responsive (Desktop 1920px, Laptop 1366px, Tablet 768px) | `Testing & QA` | `To Do` |
| **AESP-103** | Cấu hình môi trường production (Docker Compose prod, env vars) | `DevOps & Infrastructure` | `To Do` |
| **AESP-104** | Deploy toàn bộ hệ thống lên server / staging | `DevOps & Infrastructure` | `To Do` |
| **AESP-105** | Smoke test trên môi trường staging | `DevOps & Infrastructure` | `To Do` |
| **AESP-106** | Seed dữ liệu demo thực tế cho buổi thuyết trình | `DevOps & Infrastructure` | `To Do` |
| **AESP-107** | Fix bugs P1 (blockers trước demo) | `DevOps & Infrastructure` | `To Do` |
| **AESP-108** | Viết hướng dẫn cài đặt & vận hành (README chi tiết) | `Documentation` | `To Do` |
| **AESP-109** | Viết User Manual (hướng dẫn sử dụng từng role) | `Documentation` | `To Do` |
| **AESP-110** | Chuẩn bị slide & kịch bản demo ấn tượng | `Presentation & Demo` | `To Do` |
| **AESP-111** | Go-live – deploy production chính thức | `Deployment` | `To Do` |
| **AESP-112** | Giám sát hệ thống 24h sau go-live | `Operations & Monitoring` | `To Do` |
