# HƯỚNG DẪN THIẾT LẬP DỰ ÁN MỚI – KẾ THỪA SOURCE CODE AESP
## Chuẩn Hóa Quy Trình Quản Lý Git, Tích Hợp Jira, CI/CD, Checklist & Goals

---

## 1. TỔNG QUAN CHIẾN LƯỢC KHỞI TẠO (CLEAN ARCHITECTURE & TRACEABILITY)

Khi bắt đầu với một repository mới đã liên kết Jira, mục tiêu tối thượng là:
1. **Lịch sử Git minh bạch 100%**: Mỗi commit, branch, Pull Request đều tự động gắn kết vào Jira Issue tương ứng mà không cần cập nhật thủ công.
2. **Chất lượng code được bảo vệ tự động (CI/CD)**: Không thể merge code lỗi vào nhánh chính nhờ hệ thống tự động chạy lint, build và test (bao gồm cả Python AI và Node.js).
3. **Kiểm soát tiến độ song song qua Checklist**: Áp dụng **Definition of Done (DoD)** và **Pull Request Checklist** để đảm bảo task hoàn thành thực chất.
4. **Mục tiêu rõ ràng (Goals) & Đánh giá định kỳ**: Mỗi Sprint gắn liền với 1 Goal cụ thể, đo lường bằng số liệu thực nghiệm.

---

## 2. BƯỚC 1: KHỞI TẠO LOCAL & KẾ THỪA SOURCE CODE SẠCH SẼ

### 2.1. Clone Repo Mới Về Máy
Giả sử repo mới của bạn có link `https://github.com/your-username/aesp-core.git`:
```powershell
# Di chuyển tới thư mục học tập
cd "d:\Users\ptdat\OneDrive - ut.edu.vn\TAILIEUHOCTAP\14_DACNPM"

# Clone repo mới (đang trống)
git clone https://github.com/your-username/aesp-core.git
cd aesp-core
```

### 2.2. Lựa Chọn Chiến Lược Đưa Source Code Sang Repo Mới

Có **2 chiến lược** để bạn chọn tùy theo mục đích trình bày trên Jira:

#### 🟢 Chiến Lược A: Khởi Tạo Nền Tảng (Clean Initial Commit) + Phát Triển Theo Jira (Khuyên Dùng)
- Đưa toàn bộ source gốc hiện tại vào repo mới dưới dạng **Initial Commit (v1.0.0-foundation)**.
- Từ commit này, toàn bộ các tính năng nâng cấp AI, scoring, giao diện, tối ưu hóa... sẽ được triển khai thông qua các nhánh tính năng gắn mã Jira (`AESP-xxx`).
- **Ưu điểm**: Nhanh, an toàn, không làm hỏng cấu trúc hiện tại, lịch sử Git sạch đẹp, tập trung thể hiện các cải tiến AI mới trên Jira.

#### 🟡 Chiến Lược B: Di Chuyển Theo Từng Module (Incremental Migration)
- Không copy toàn bộ ngay từ đầu.
- Đi theo từng Jira Ticket: Ticket làm module nào (Auth, AI Service, Frontend...) thì commit module đó kèm mã ticket.
- **Ưu điểm**: Jira ghi nhận lịch sử commit cho từng ticket ngay từ đầu.
- **Nhược điểm**: Mất nhiều thời gian thiết lập ban đầu, dễ phát sinh lỗi thiếu file phụ thuộc.

---

### 2.3. Cấu Hình `.gitignore` Chuẩn Xác (Rất Quan Trọng Đối Với AI)
Trong dự án AI và Microservices, tuyệt đối không commit file rác, dữ liệu âm thanh tạm, file `.env` chứa API key hay model AI nặng hàng trăm MB.
Tạo file `.gitignore` ở thư mục gốc của repo mới:

```gitignore
# Dependencies
node_modules/
*/node_modules/
__pycache__/
*.pyc
*.pyo
venv/
.venv/
env/

# Environment Variables & Secrets (Bảo mật tuyệt đối)
.env
.env.local
.env.*.local
*.env

# Audio Uploads & Outputs (Không đẩy audio người dùng lên Git)
backend/uploads/*
!backend/uploads/.gitkeep
backend/outputs/*
!backend/outputs/.gitkeep
uploads/
outputs/
*.webm
*.wav
*.mp3

# AI Model weights & Caches
*.pt
*.pth
*.bin
*.onnx
.cache/
whisper/

# Build outputs
frontend/dist/
frontend/build/
*.log

# OS & IDE
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

## 3. BƯỚC 2: QUY ƯỚC QUẢN LÝ NHÁNH & SMART COMMITS LIÊN KẾT JIRA

Để mọi hoạt động trên Git tự động hiển thị trong bảng Jira (ở mục Development bên phải mỗi ticket), hãy tuân thủ nghiêm ngặt 2 quy ước:

### 3.1. Quy Ước Đặt Tên Nhánh (Branch Naming Convention)
Format: `<type>/<JIRA-KEY>-<mo-ta-ngan-gon>`

| Loại nhánh | Ví dụ đặt tên | Ý nghĩa |
|---|---|---|
| `feature/` | `feature/AESP-031-whisperx-alignment` | Phát triển tính năng mới |
| `improvement/` | `improvement/AESP-032-ai-scoring-algorithm` | Nâng cấp, cải tiến giải thuật AI |
| `bugfix/` | `bugfix/AESP-045-fix-torchvision-error` | Sửa lỗi hệ thống |
| `test/` | `test/AESP-071-ai-benchmarking-wer` | Viết test case, đo đạc dữ liệu |

Lệnh tạo nhánh và checkout:
```bash
git checkout -b feature/AESP-031-whisperx-alignment
```

### 3.2. Quy Ước Commit (Conventional Commits + Jira Smart Commits)
Format chuẩn:
```
<type>(<scope>): [<JIRA-KEY>] <Mô tả hành động>
```

**Ví dụ thực tế:**
- `feat(ai): [AESP-031] implement word-level confidence extraction in whisperx`
- `fix(learner): [AESP-042] resolve audio recording timeout on chrome`
- `refactor(scoring): [AESP-033] upgrade pronunciation formula to multi-criteria`
- `test(ai): [AESP-072] add unit tests for WPM fluency calculation`

#### ⚡ Tính Năng Jira Smart Commits (Tự Cập Nhật Trực Tiếp Jira Bằng Commit)
Khi push commit lên Git, Jira tự động đọc các cú pháp sau:
- **Tự động thêm comment**: `[AESP-031] #comment Hoan thanh module trich xuat confidence tu WhisperX`
- **Tự động ghi nhận thời gian làm việc (Log Work)**: `[AESP-031] #time 3h 30m`
- **Tự động chuyển trạng thái task (Transition)**: `[AESP-031] #transition In Review`

---

## 4. BƯỚC 3: THIẾT LẬP CI/CD TỰ ĐỘNG TEST CODE (GITHUB ACTIONS)

Tạo file `.github/workflows/ci.yml` trong repo mới. File này sẽ tự động chạy kiểm tra mỗi khi có ai **push** hoặc tạo **Pull Request** vào nhánh `main` hoặc `develop`.

```yaml
name: AESP CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  # 1. Kiểm tra Code Backend & Frontend
  lint-and-test-web:
    name: Lint & Test Web Services
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Frontend (Kiểm tra lỗi biên dịch React)
        working-directory: ./frontend
        run: npm run build

  # 2. Kiểm tra Môi trường & Script AI (Python)
  test-ai-services:
    name: Test AI Pipeline & Scripts
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
          cache: 'pip'

      - name: Install Python AI Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install flake8 pytest

      - name: Lint Python Code (Check Clean Code)
        run: |
          # Dừng build nếu có lỗi syntax hoặc undefined names
          flake8 backend/ai_models --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Validate AI Data JSON Schemas
        run: |
          # Kiểm tra tính toàn vẹn của các file dữ liệu AI
          python -c "import json; json.load(open('backend/ai_models/promptSamples.json', encoding='utf-8')); print('✅ promptSamples.json is valid JSON')"
          python -c "import json; json.load(open('backend/ai_models/sampleTranscripts.json', encoding='utf-8')); print('✅ sampleTranscripts.json is valid JSON')"
```

---

## 5. BƯỚC 4: BỘ CHECKLIST KIỂM TRA TASK SONG SONG VỚI JIRA

Để đảm bảo bạn và thành viên trong nhóm không đánh dấu "Done" bừa bãi khi task chưa hoàn thiện, áp dụng 2 bộ checklist sau:

### 5.1. Pull Request Checklist Template (`.github/pull_request_template.md`)
Tạo file `.github/pull_request_template.md` trong repo. Mỗi khi tạo PR, GitHub sẽ tự động hiển thị mẫu này:

```markdown
### 📌 Jira Ticket
- Liên kết Jira Issue: [AESP-XXX](https://your-domain.atlassian.net/browse/AESP-XXX)
- Loại task: [Feature / Bugfix / AI Improvement / Refactor]

### 📝 Tóm Tắt Thay Đổi
- Đã làm gì trong PR này?

### ✅ Task Checklist (Definition of Done)
- [ ] Code tuân thủ tiêu chuẩn Clean Code, không có biến thừa hoặc `console.log` debug rác.
- [ ] Đã kiểm tra trực tiếp trên môi trường local, không phát sinh lỗi ngoại lệ.
- [ ] Không commit file `.env`, file âm thanh tạm hay secret keys.
- [ ] Đã viết hoặc cập nhật unit test (nếu liên quan tới thuật toán AI).
- [ ] Đã kiểm tra tương thích ngược với database schema hiện tại.
- [ ] Đã cập nhật trạng thái trên Jira (`In Review` hoặc `Done`).

### 🧪 Bằng Chứng Kiểm Thử (Screenshots / Log Output)
- [Dán ảnh chụp màn hình UI hoạt động hoặc log terminal test thành công vào đây]
```

### 5.2. Definition of Done (DoD) Tiêu Chuẩn Cho Từng Ticket Trên Jira
Dán trực tiếp checklist này vào phần mô tả (Description) của mỗi User Story trên Jira:
- `[ ] DoD 1: Code hoàn thành logic theo đúng yêu cầu nghiệp vụ.`
- `[ ] DoD 2: Tự động chạy pass toàn bộ CI/CD Pipeline.`
- `[ ] DoD 3: Được ít nhất 1 thành viên review và approve PR.`
- `[ ] DoD 4: Đã test thử luồng trên trình duyệt / Postman thành công.`
- `[ ] DoD 5: Log work thời gian thực tế đã bỏ ra.`

---

## 6. BƯỚC 5: THIẾT LẬP GOALS & ĐÁNH GIÁ ĐỊNH KỲ

### 6.1. Thiết Lập Goal Cho Từng Sprint (1 - 2 tuần)
Mỗi Sprint bắt buộc có **1 Sprint Goal duy nhất, súc tích, định lượng được**:
- **Sprint 1 Goal**: *"Khởi tạo dự án sạch, thông luồng Docker, xác thực người dùng và dựng khung API Gateway."*
- **Sprint 2 Goal**: *"Tích hợp hoàn chỉnh WhisperX STT với căn chỉnh ngữ âm CTC, độ trễ xử lý file 10s dưới 3 giây."*
- **Sprint 3 Goal**: *"Hoàn thiện động cơ chấm điểm đa tiêu chí (Pronunciation, Fluency, Completeness) và kết nối GPT-4 sinh nhận xét."*
- **Sprint 4 Goal**: *"Hoàn thành giao diện 10 vòng luyện nói với highlight màu từng từ theo điểm số phát âm."*
- **Sprint 5 Goal**: *"Triển khai cơ chế học liên tục (AiESP Continuous Learning) và sinh đề thích ứng (DDA)."*
- **Sprint 6 Goal**: *"Đo lường độ chính xác (WER, Pearson r), tối ưu hiệu năng toàn hệ thống và chuẩn bị báo cáo tốt nghiệp."*

### 6.2. Cơ Chế Đánh Giá Sau Mỗi Sprint (Sprint Review & Retrospective)
Cuối mỗi Sprint, dành 30 phút đánh giá theo 3 câu hỏi cốt lõi:
1. **Goal đạt được bao nhiêu %?** (Dựa trên số Story Points hoàn thành / Tổng Story Points cam kết trên Burndown Chart).
2. **AI Metric có tiến bộ không?** (Độ chính xác nhận diện tăng lên bao nhiêu? Thời gian phản hồi giảm còn bao nhiêu giây?).
3. **Cần cải tiến điều gì ở Sprint sau?** (Quy trình review code, phối hợp frontend-backend hay cách prompt AI?).

---

## 7. BỘ PROMPT CHUYÊN NGHIỆP ĐỂ LÀM VIỆC CÙNG AI TRONG DỰ ÁN

Dưới đây là bộ prompt mẫu được thiết kế riêng để bạn sử dụng trong suốt vòng đời dự án:

### 🎯 Prompt 1: Phân Rã Ticket Jira & Tạo Checklist Chi Tiết
> *"Tôi đang chuẩn bị làm ticket Jira [MÃ_TICKET] với tiêu đề: '[TÊN_TÍNH_NĂNG]'. Hãy phân tích yêu cầu, liệt kê các file cần tạo/chỉnh sửa trong source code AESP, chia nhỏ thành các sub-tasks kỹ thuật cụ thể và viết một bộ Checklist Acceptance Criteria định lượng để tôi điền vào Jira."*

### 🌿 Prompt 2: Hướng Dẫn Tạo Branch & Sinh Commit Chuẩn Smart Commits
> *"Tôi vừa hoàn thành việc chỉnh sửa các file [DANH_SÁCH_FILE] cho ticket [MÃ_TICKET]: [MÔ_TẢ_CÔNG_VIỆC]. Hãy viết cho tôi tên nhánh Git chuẩn convention và chuỗi lệnh Git commit kèm cú pháp Jira Smart Commits (bao gồm mã ticket, log time [SỐ_GIỜ], comment và transition sang In Review)."*

### 🔍 Prompt 3: Review Code & Soát Lỗi Theo Chuẩn Clean Code
> *"Dưới đây là đoạn code tôi vừa viết cho module [TÊN_MODULE]: [DÁN_CODE]. Hãy đóng vai trò Tech Lead review code này theo các tiêu chí: Clean Code, tối ưu hiệu năng, bảo mật, xử lý lỗi ngoại lệ (error handling), và kiểm tra xem có vi phạm tiêu chuẩn nào của dự án AESP không."*

### 🧪 Prompt 4: Viết Unit Test & Kịch Bản Kiểm Thử
> *"Hãy viết bộ test case (Unit Test / Integration Test) cho hàm [TÊN_HÀM] xử lý logic [MÔ_TẢ_LOGIC]. Yêu cầu bao gồm cả trường hợp bình thường (happy path) và các trường hợp biên/ngoại lệ (edge cases: audio rỗng, mất kết nối API, dữ liệu không hợp lệ)."*
