# AESP Microservices API Specification

## 1. Base URL & Protocol
- **Môi trường cục bộ (Local)**: `http://localhost:4000/api`
- **Môi trường Docker/Nginx**: `http://localhost/api`
- **Giao thức**: RESTful JSON qua HTTP/HTTPS
- **Xác thực**: JWT Bearer Token trong header `Authorization: Bearer <token>`

---

## 2. Danh Mục Endpoints Chi Tiết

### 2.1. Auth & User Service (Port 4005 / `/api/auth` & `/api/users`)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký tài khoản học viên mới |
| `POST` | `/auth/login` | Public | Đăng nhập và nhận JWT access token |
| `POST` | `/auth/forgot-password` | Public | Yêu cầu gửi mã hoặc câu hỏi bảo mật đặt lại mật khẩu |
| `POST` | `/auth/reset-password` | Public | Đặt lại mật khẩu mới |
| `GET` | `/auth/profile` | Authenticated | Lấy thông tin cá nhân của người dùng hiện tại |
| `PUT` | `/auth/profile` | Authenticated | Cập nhật tên, ảnh đại diện, số điện thoại |
| `GET` | `/users/me` | Authenticated | Kiểm tra hiệu lực session đăng nhập |

### 2.2. Package & Purchase Service (Port 4003 & 4004 / `/api/packages` & `/api/purchases`)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/packages/public` | Public | Xem danh sách các gói học có sẵn |
| `POST` | `/packages` | Admin | Tạo gói học mới |
| `GET` | `/purchases/my-packages` | Learner | Danh sách gói học học viên đã mua |
| `POST` | `/purchases/checkout` | Learner | Tạo đơn thanh toán gói học |
| `GET` | `/purchases` | Admin | Danh sách tất cả giao dịch thanh toán |

### 2.3. Learner & AI Practice Service (Port 4007 & 4010 / `/api/learners` & `/api/ai`)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/learners/dashboard` | Learner | Số liệu tổng quan: thời gian học, streak, điểm trung bình |
| `GET` | `/learners/challenges` | Learner | Danh sách thử thách luyện nói theo level |
| `POST` | `/learners/practice/submit` | Learner | Tải lên file ghi âm bài nói |
| `POST` | `/ai/transcribe-evaluate` | Internal/Learner | WhisperX STT & AI scoring (Pronunciation, Fluency) |
| `GET` | `/ai/feedback/:submissionId`| Learner | Nhận xét chi tiết theo từng từ và âm tiết |

### 2.4. Mentor Service (Port 4006 / `/api/mentors`)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/mentors/learners` | Mentor | Danh sách học viên thuộc phụ trách |
| `POST` | `/mentors/challenges` | Mentor | Tạo thử thách phát âm tùy chỉnh |
| `POST` | `/mentors/assessments` | Mentor | Gửi điểm và nhận xét cho bài nộp của học viên |
| `GET` | `/mentors/schedules` | Mentor | Danh sách các buổi hẹn trực tiếp |

### 2.5. Community & Notification Service (Port 4001 & 4002 / `/api/community` & `/api/notifications`)
| Method | Endpoint | Quyền hạn | Mô tả |
|---|---|---|---|
| `GET` | `/community/posts` | Authenticated | Lấy bảng tin Cư Dân AESP |
| `POST` | `/community/posts` | Authenticated | Đăng bài viết chia sẻ âm thanh / hình ảnh |
| `POST` | `/community/posts/:id/comments` | Authenticated | Bình luận vào bài viết |
| `POST` | `/community/posts/:id/like` | Authenticated | Thả tim / Bỏ thả tim bài viết |
| `GET` | `/notifications` | Authenticated | Danh sách thông báo của người dùng |
| `PATCH`| `/notifications/:id/read` | Authenticated | Đánh dấu thông báo đã đọc |
