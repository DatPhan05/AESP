# AESP Design System Guidelines

## 1. Triết Lý Thiết Kế (Design Philosophy)
Design System của AESP hướng tới trải nghiệm học tiếng Anh thích ứng, sinh động, chuẩn quốc tế:
- **Tập trung cao độ (High Focus)**: Giao diện học tập tối giản các yếu tố gây xao nhãng, làm nổi bật thanh sóng âm (Audio Waveform) và văn bản cần phát âm.
- **Phản hồi tức thì (Real-time Feedback)**: Sử dụng bảng màu trực quan (Xanh: phát âm chuẩn >= 80%, Vàng: cần cải thiện 50-79%, Đỏ: sai âm < 50%).
- **Đồng bộ đa vai trò (Multi-Role Theming)**: Mỗi nhóm người dùng sở hữu nhận diện màu sắc đặc trưng (Learner: Indigo/Emerald, Mentor: Teal/Cyan, Admin: Slate/Dark Blue).

---

## 2. Bảng Màu Chuẩn (Color Palette)

### 2.1. Brand Colors
- **Primary (Electric Indigo)**:
  - `var(--color-primary-500)`: `#6366f1`
  - `var(--color-primary-600)`: `#4f46e5` (Chính / Buttons / Active Tabs)
  - `var(--color-primary-700)`: `#4338ca` (Hover state)
- **Secondary (Teal)**:
  - `var(--color-secondary-500)`: `#14b8a6` (Thống kê, biểu đồ tiến độ)
- **Accent (Warm Amber)**:
  - `var(--color-accent-500)`: `#f59e0b` (Huy hiệu, chuỗi streak học viên)

### 2.2. Feedback & Trạng Thái Phát Âm
- **Phát âm chuẩn (Excellent)**: `#10b981` (`var(--color-success)`)
- **Cần cải thiện (Fair/Warning)**: `#f59e0b` (`var(--color-warning)`)
- **Chưa chuẩn (Poor/Error)**: `#ef4444` (`var(--color-danger)`)
- **Thông tin gợi ý (Info)**: `#3b82f6` (`var(--color-info)`)

---

## 3. Hệ Thống Typography

- **Phông chữ chủ đạo**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`.
- **Phông chữ phiên âm / Code**: `JetBrains Mono`, `monospace`.

| Tên biến | Kích thước | Line Height | Ứng dụng |
|---|---|---|---|
| `--text-xs` | 12px (0.75rem) | 1.25 | Badge, nhãn phụ, timestamp |
| `--text-sm` | 14px (0.875rem) | 1.5 | Chú thích, form label, table cell |
| `--text-base` | 16px (1.00rem) | 1.5 | Nội dung chính, đoạn văn, input text |
| `--text-lg` | 18px (1.125rem) | 1.5 | Tiêu đề phụ, subheadings, buttons |
| `--text-xl` | 20px (1.25rem) | 1.25 | Tiêu đề card, modal header |
| `--text-2xl` | 24px (1.50rem) | 1.25 | Tiêu đề trang nhỏ, KPI numbers |
| `--text-3xl` | 30px (1.875rem) | 1.25 | Tiêu đề section chính |
| `--text-4xl` | 36px (2.25rem) | 1.25 | Hero heading, điểm số tổng kết |

---

## 4. Spacing & Grid System
Tuân thủ tỷ lệ 4px / 8px:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px (Padding chuẩn cho cards nhỏ, button)
- `--space-6`: 24px (Padding chuẩn cho modal, dashboard card)
- `--space-8`: 32px (Khoảng cách giữa các section)
- `--space-12`: 48px (Khoảng cách khối giao diện lớn)

---

## 5. Components & Elevation Tokens
- **Border Radius**:
  - Nhỏ (Button/Input): `--radius-md` (8px)
  - Card/Bảng: `--radius-lg` (12px)
  - Modal/Hero Banner: `--radius-xl` (16px)
  - Chip/Avatar: `--radius-full` (9999px)
- **Shadows**:
  - Card phẳng: `--shadow-sm`
  - Card nổi bật: `--shadow-md`
  - Floating Modal / Dropdown: `--shadow-xl`
  - Điểm nhấn AI Speaking: `--shadow-glow` (Ánh sáng tím chuyển sắc)
