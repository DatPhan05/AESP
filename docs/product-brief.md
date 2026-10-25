# AESP (Adaptive English Speaking Platform) - Product Brief

## 1. Tầm Nhìn Sản Phẩm (Vision)
AESP là nền tảng luyện nói tiếng Anh tương tác thích ứng, ứng dụng công nghệ trí tuệ nhân tạo (AI Speech Recognition & Alignment - WhisperX, LLM Evaluation). Nền tảng giúp người học vượt qua rào cản sợ nói, sửa lỗi phát âm theo thời gian thực và đo lường chính xác các tiêu chí phát âm (Pronunciation), lưu loát (Fluency), và độ hoàn thiện (Completeness).

---

## 2. Các Nhóm Đối Tượng Người Dùng (Target Personas)
1. **Học viên (Learner)**:
   - Mục tiêu: Cải thiện phát âm, tăng phản xạ giao tiếp, theo dõi lộ trình và streak hàng ngày.
   - Tính năng chính: Luyện nói 10 vòng với AI, thử thách phát âm, nhận dạng lỗi sai từng từ, cộng đồng Cư Dân AESP.
2. **Người hướng dẫn (Mentor)**:
   - Mục tiêu: Quản lý học viên, giao đề luyện tập thực tế và hỗ trợ sửa bài.
   - Tính năng chính: Tạo thử thách, quản lý học viên, chấm điểm bài nói, tổ chức lịch hướng dẫn.
3. **Quản trị viên (Admin)**:
   - Mục tiêu: Giám sát vận hành hệ thống, tài chính và trải nghiệm người dùng.
   - Tính năng chính: Bảng điều khiển KPI, quản lý tài khoản, cấu hình gói học, thống kê doanh thu và xử lý báo cáo vi phạm.

---

## 3. Kiến Trúc Kỹ Thuật (Technology Stack)
- **Frontend**: React 18, Vite, React Router v6, TanStack Query, CSS Design System Tokens.
- **Backend**: Microservices kiến trúc Node.js / Express.js, API Gateway.
- **AI Engine**: Python 3.10, WhisperX (Phoneme & Word Alignment), PyTorch, CUDA.
- **Database**: PostgreSQL 15/16.
- **DevOps**: Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD.
