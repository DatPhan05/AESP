# AESP - NỀN TẢNG HỖ TRỢ GIÁO DỤC ỨNG DỤNG TRÍ TUỆ NHÂN TẠO

> **ĐỀ TÀI**: XÂY DỰNG NỀN TẢNG HỖ TRỢ GIÁO DỤC ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AESP)  
> **English Title**: Development of an AI Education Support Platform (AESP)  
> **Repository**: [https://github.com/DatPhan05/AESP.git](https://github.com/DatPhan05/AESP.git)

---

## 📖 Giới Thiệu
Hệ thống học tập và luyện phát âm thông minh đa tiêu chí (Pronunciation, Fluency, Completeness) áp dụng kiến trúc Microservices và pipeline AI tiên tiến (WhisperX, PyTorch, CTC Forced Alignment, Large Language Models).

---

## 🚀 Yêu Cầu Hệ Thống

- **Docker & Docker Compose** (phiên bản mới nhất)
- **Node.js** >= 18 (Khuyên dùng v20 LTS)
- **Python** 3.10+ (cho các service AI và test scripts)
- **Git**

---

## 📦 Cài Đặt & Khởi Chạy

### 1. Clone Repository
```bash
git clone https://github.com/DatPhan05/AESP.git
cd AESP
```

### 2. Khởi Chạy Bằng Docker Compose (Khuyên dùng)
```bash
# Build và chạy tất cả các microservices
docker compose up --build

# Hoặc chạy ở chế độ background
docker compose up --build -d

# Kiểm tra trạng thái containers
docker compose ps

# Xem log theo thời gian thực
docker compose logs -f
```

### 3. Khởi Tạo Cơ Sở Dữ Liệu
```bash
# Chạy script migration & seed dữ liệu ban đầu
docker compose exec app sh init-db.sh
```

---

## 🌐 Cổng & Điểm Truy Cập Dịch Vụ

Sau khi khởi chạy thành công:
- **Frontend App (React + Vite)**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:4000](http://localhost:4000)
- **PostgreSQL Database**: `localhost:5432` (User: `postgres`, Password: `1234`, Database: `aesp`)

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```text
AESP/
├── .github/               # CI/CD Workflows & PR Templates
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── frontend/              # Web Frontend (React, Vite, Tailwind/CSS)
├── backend/               # Backend monolith/services & AI models
│   ├── ai_models/         # AI training, scoring & alignment pipelines
│   ├── services/          # Core backend logic
│   ├── uploads/           # Thư mục tạm lưu audio (được gitignore)
│   └── outputs/           # Thư mục xuất file xử lý (được gitignore)
├── services/              # Các Microservices độc lập (Auth, User, Package,...)
├── docs/                  # Tài liệu đặc tả kiến trúc & API
├── infra/                 # Cấu hình hạ tầng
├── compose.yaml           # Docker Compose cấu hình toàn bộ hệ thống
└── Dockerfile             # Dockerfile build image chính
```

---

## 🔄 Quy Trình Phát Triển (Jira & Git Workflow)

Dự án áp dụng chặt chẽ quy chuẩn **Clean Architecture**, **Conventional Commits** và **Jira Smart Commits**:

1. **Quy ước đặt tên nhánh**:
   - `feature/AESP-xxx-ten-tinh-nang`
   - `improvement/AESP-xxx-nang-cap-ai`
   - `bugfix/AESP-xxx-sua-loi`
2. **Quy ước commit**:
   - `<type>(<scope>): [AESP-xxx] <mô tả>`
3. **CI/CD Pipeline**:
   - Tự động kiểm tra lint, build frontend và validate schemas AI mỗi khi tạo PR hoặc push vào nhánh `main` và `dev`.

---

## 📚 Tài Liệu Tham Khảo

- [API Specification](docs/api-spec.md)
- [Product Brief](docs/product-brief.md)
- [Microservices Architecture](docs/MICROSERVICES_ARCHITECTURE.md)
- [Hướng Dẫn Setup Dự Án & Jira CI/CD](../HUONG_DAN_SETUP_DU_AN_MOI_JIRA_CICD.md)

---

## 📄 Bản Quyền
Dự án được bảo hộ theo giấy phép MIT License.
