# AESP Wireframe & Screen Layout Specifications

## 1. Kiến Trúc Khung Màn Hình (Layout Shells)

Hệ thống AESP được phân bổ thành 4 không gian giao diện riêng biệt:
1. **Public / Authentication Shell**: Giao diện đăng nhập, đăng ký, quên mật khẩu, trang chủ giới thiệu.
2. **Learner Portal Shell**: Thanh điều hướng bên trái (Sidebar), thanh thông báo trên (Topbar), khu vực luyện nói AI trung tâm (Speaking Arena).
3. **Mentor Portal Shell**: Quản lý học viên được phân công, lịch hướng dẫn, tạo thử thách và chấm điểm bài nói.
4. **Admin Portal Shell**: Bảng điều khiển KPI toàn diện, quản lý người dùng, quản trị gói học, đơn mua và kiểm duyệt.

---

## 2. Wireframe Màn Hình Chi Tiết

### 2.1. Không Gian Xác Thực (Auth Screens)

```text
+-------------------------------------------------------------+
|                      AESP - LOGIN                           |
+-------------------------------------------------------------+
|                                                             |
|           +-------------------------------------+           |
|           |              AESP LOGO              |           |
|           |      Nền tảng Luyện nói Tiếng Anh   |           |
|           +-------------------------------------+           |
|                                                             |
|           Email:                                            |
|           [ username@example.com              ]             |
|                                                             |
|           Mật khẩu:                                         |
|           [ ******************                ]             |
|                                                             |
|           [ ] Ghi nhớ đăng nhập   [ Quên mật khẩu? ]        |
|                                                             |
|           +-------------------------------------+           |
|           |          [ ĐĂNG NHẬP ]              |           |
|           +-------------------------------------+           |
|                                                             |
|           Chưa có tài khoản? [ Đăng ký ngay ]               |
|                                                             |
+-------------------------------------------------------------+
```

---

### 2.2. Không Gian Học Viên (Learner Portal)

```text
+-----------------------------------------------------------------------------------+
| AESP LEARNER  | [Search...]             🔔(3) Streak: 🔥7 ngày   [ Avatar - Nam ] |
+---------------+-------------------------------------------------------------------+
|               |                                                                   |
| [📊 Dashboard]|  CHÀO MỪNG TRỞ LẠI, NAM!                                          |
| [🎙️ Luyện Nói]|  Mục tiêu hôm nay: 15/20 phút                                     |
| [🏆 Thử Thách]|  [=======================>        ] 75%                           |
| [📈 Tiến Độ]  |                                                                   |
| [📚 Khóa Học] |  +-------------------------------------------------------------+  |
| [👥 Cư Dân]   |  | AI SPEAKING ARENA - PHÒNG THỰC HÀNH NÓI                     |  |
| [⚙️ Cài Đặt]  |  | Chủ đề: "Job Interview - Tell me about yourself"            |  |
|               |  |                                                             |  |
|               |  | Câu mẫu: "Good morning! My name is Nam and I am excited..." |  |
|               |  |                                                             |  |
|               |  |        [ 〰️〰️ WAVEFORM ÂM THANH REAL-TIME 〰️〰️ ]           |  |
|               |  |                                                             |  |
|               |  |               ( 🎙️ BẤM ĐỂ NÓI )                             |  |
|               |  |                                                             |  |
|               |  | Kết quả chấm điểm AI:                                       |  |
|               |  | Phát âm: [ 88/100 ] | Lưu loát: [ 82/100 ] | Hoàn thành: 95%|  |
|               |  +-------------------------------------------------------------+  |
|               |                                                                   |
+---------------+-------------------------------------------------------------------+
```

---

### 2.3. Không Gian Giảng Viên (Mentor Portal)

```text
+-----------------------------------------------------------------------------------+
| AESP MENTOR   |                                          🔔(5)   [ ThS. Minh Anh ]|
+---------------+-------------------------------------------------------------------+
|               |                                                                   |
| [📊 Tổng Quan]|  DANH SÁCH BÀI THỬ THÁCH CẦN ĐÁNH GIÁ (Pending Reviews: 4)        |
| [👨‍🎓 Học Viên] |  +-------------------------------------------------------------+  |
| [🗓️ Lịch Hẹn] |  | Học viên: Nguyễn Văn A | Bài: Unit 4 - Travel Experience    |  |
| [📝 Đánh Giá] |  | File âm thanh: [ ▶️ Play 0:45 ]  Transcript: "I travelled..."|  |
| [📂 Tài Liệu] |  | WhisperX Confidence: 84.5%                                  |  |
| [⚙️ Cài Đặt]  |  | Điểm Mentor đề xuất: [ 8.5 / 10 ]                           |  |
|               |  | Nhận xét chi tiết: [ Âm /θ/ cần chú ý đặt lưỡi giữa răng...]|  |
|               |  |               [ GỬI ĐÁNH GIÁ CHO HỌC VIÊN ]                 |  |
|               |  +-------------------------------------------------------------+  |
|               |                                                                   |
+---------------+-------------------------------------------------------------------+
```

---

### 2.4. Không Gian Quản Trị Viên (Admin Portal)

```text
+-----------------------------------------------------------------------------------+
| AESP ADMIN    | [Tìm kiếm hệ thống...]                    ⚙️   [ Quản Trị Viên ]  |
+---------------+-------------------------------------------------------------------+
|               |                                                                   |
| [📊 Thống Kê] |  +-----------------+ +-----------------+ +---------------------+  |
| [👥 Người Dùng]|  | Tổng Người Dùng | | Doanh Thu Tháng | | Lượt Luyện Nói AI   |  |
| [📦 Gói Học]  |  |    1,420 users  | |   48,500,000 đ  | |     18,920 lượt     |  |
| [💳 Đơn Mua]  |  +-----------------+ +-----------------+ +---------------------+  |
| [🚩 Báo Cáo]  |                                                                   |
| [💬 Cộng Đồng]|  QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG                                     |
| [🎫 Hỗ Trợ]   |  [+ Thêm người dùng]  [ Lọc theo vai trò: Tất cả v ]              |
|               |  +-----+------------------+----------+---------+---------------+  |
|               |  | ID  | Tên / Email      | Vai Trò  | Trạng Thái| Thao Tác    |  |
|               |  +-----+------------------+----------+---------+---------------+  |
|               |  | 101 | dat@ut.edu.vn    | Learner  | Active  | [Sửa] [Khóa]  |  |
|               |  | 102 | minhanh@aesp.edu | Mentor   | Active  | [Sửa] [Khóa]  |  |
|               |  | 103 | admin@aesp.edu   | Admin    | Active  | [Sửa] [Phân]  |  |
|               |  +-----+------------------+----------+---------+---------------+  |
+---------------+-------------------------------------------------------------------+
```

---

## 3. Phân Rã Thành Phần UI (Atomic UI Hierarchy)
- **Common Atoms**: `Button`, `Input`, `KpiCard`, `Modal`, `AudioPlayer`, `AudioRecorder`, `Notifications`.
- **Layout Molecules**: `AdminHeader`, `AdminSidebar`, `LearnerHeader`, `LearnerSidebar`, `MentorHeader`, `MentorSidebar`.
- **Organisms**: `SpeakingPractice`, `SpeakingRound`, `ChallengeCreator`, `AssessmentPanel`, `AdminDashboard`.
- **Pages**: `Home`, `Login`, `Profile`, `CommunicateCenter`, `NotFound`.
