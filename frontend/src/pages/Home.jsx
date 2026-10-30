// [AESP-46] Là học viên, tôi muốn xem danh sách gói học công khai: Giao diện Landing Page chuẩn The Forum (MauVideo)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/home.css";
import mentorImage from "../assets/images/mentor-intro.png";
import viettelLogo from "../assets/partners/viettel.png";
import vibLogo from "../assets/partners/VIB.jpg";
import oxfordLogo from "../assets/partners/oxford.jpg";
import ieltsLogo from "../assets/partners/ielts.png";
import vnairlineLogo from "../assets/partners/vnairline.png";
import api from "../api";

// ===== Partners =====
const samplePartners = [
  { id: 1, name: "Tập đoàn Viettel", logo: viettelLogo },
  { id: 2, name: "Ngân Hàng Quốc Tế VIB", logo: vibLogo },
  { id: 3, name: "Oxford University", logo: oxfordLogo },
  { id: 4, name: "IELTS Official", logo: ieltsLogo },
  { id: 5, name: "Vietnam Airlines", logo: vnairlineLogo },
];

// ===== Gói học mẫu mặc định =====
const defaultPackages = [
  {
    id: 1,
    name: "Gói Khởi Động (30 Ngày)",
    price: 299000,
    original_price: 499000,
    duration_days: 30,
    desc: "Xây dựng phản xạ nói căn bản, chỉnh phát âm IPA từng âm tiết chuẩn xác.",
    features: [
      "Luyện nói không giới hạn cùng Trợ lý AI",
      "Chấm điểm & sửa phát âm tức thì",
      "Bộ 100+ tình huống hội thoại thông dụng",
      "Báo cáo phân tích tiến độ hàng tuần",
    ],
  },
  {
    id: 2,
    name: "Gói Bứt Phá (90 Ngày)",
    price: 799000,
    original_price: 1299000,
    duration_days: 90,
    desc: "Lộ trình chuyên sâu giúp giao tiếp trôi chảy trong công việc và thi chứng chỉ.",
    featured: true,
    features: [
      "Tất cả quyền lợi của Gói Khởi Động",
      "Luyện nói nâng cao: phản biện & thuyết trình",
      "Giảng viên cố vấn 1-1 định kỳ hàng tháng",
      "Chứng chỉ hoàn thành khóa học AESP",
    ],
  },
  {
    id: 3,
    name: "Gói Toàn Diện VIP (365 Ngày)",
    price: 1999000,
    original_price: 3499000,
    duration_days: 365,
    desc: "Đặc quyền thành viên VIP 1 năm trọn gói mọi tính năng và nội dung học thuật.",
    features: [
      "Toàn bộ khoá học & tài liệu độc quyền",
      "Ưu tiên hỗ trợ kỹ thuật và sư phạm 24/7",
      "Cố vấn chuyên môn sửa bài nói trực tiếp",
      "Cam kết cải thiện phát âm & tự tin nói",
    ],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(defaultPackages);
  const [activeMentorIndex, setActiveMentorIndex] = useState(0);

  // Form state (fill-in-the-blank)
  const [formData, setFormData] = useState({
    name: "",
    course: "Gói Bứt Phá (90 Ngày)",
    phone: "",
    email: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");

  // Mentors list
  const mentors = [
    {
      name: "Thầy Hoàng Huy",
      badge: "8.5 IELTS",
      title: "Cố vấn học thuật AESP",
      sub: "Thạc sĩ Ngôn ngữ - Chuyên gia phản xạ tiếng Anh",
    },
    {
      name: "Cô Minh Diệp",
      badge: "8.0 IELTS",
      title: "Chuyên gia phát âm chuẩn IPA",
      sub: "Cử nhân Đại học Ngoại Thương - 5+ năm giảng dạy",
    },
    {
      name: "Thầy Vũ Đình Nam",
      badge: "SAT 1500",
      title: "Chuyên gia luyện thi & Tư duy phản biện",
      sub: "Cử nhân Đại học Việt Đức - Huấn luyện viên AESP",
    },
  ];

  // Lấy packages từ API nếu có
  useEffect(() => {
    api
      .get("/packages/public")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.packages || [];
        if (list.length > 0) {
          const sorted = list.sort((a, b) => (a.price || 0) - (b.price || 0));
          setPackages(sorted);
        }
      })
      .catch((err) => {
        console.warn("⚠️ API offline, dùng gói mẫu:", err.message);
      });
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setSubmitMessage("✅ Cảm ơn bạn! AESP đã nhận thông tin và sẽ liên hệ tư vấn trong 15 phút.");
    setTimeout(() => setSubmitMessage(""), 5000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-wrap">
      {/* FLOATING ADVISE TAB */}
      <div className="floating_advise">
        <a onClick={() => scrollToSection("register")}>
          <span>Đăng ký tư vấn 💬</span>
        </a>
      </div>

      {/* HEADER SITE */}
      <header className="header_site">
        <div className="logo_site" onClick={() => navigate("/")}>
          <img src={logo} alt="AESP" style={{ height: "42px" }} />
          <span className="brand_name">
            AESP<span className="dot">.</span>
          </span>
          <span className="brand_badge">AI SPEAKING</span>
        </div>

        <nav>
          <ul className="menu_site">
            <li>
              <a href="#hero" className="active">
                Trang chủ
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>
                Về AESP
              </a>
            </li>
            <li>
              <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection("stats"); }}>
                Chất lượng
              </a>
            </li>
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>
                Điểm khác biệt
              </a>
            </li>
            <li>
              <a href="#packages" onClick={(e) => { e.preventDefault(); scrollToSection("packages"); }}>
                Khoá học
              </a>
            </li>
            <li>
              <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection("testimonials"); }}>
                Học viên
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>
                Liên hệ
              </a>
            </li>
          </ul>
        </nav>

        <ul className="menu_user">
          <li>
            <button className="btn-link-dark" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          </li>
          <li>
            <button className="btn-red" onClick={() => scrollToSection("register")}>
              Đăng ký
            </button>
          </li>
        </ul>
      </header>

      {/* BANNER SITE (HERO SECTION) */}
      <section className="banner_site" id="hero">
        <div className="banner_container">
          {/* Left Column */}
          <div className="banner_left">
            <div className="title_animate text-start">
              {/* Ribbon Stroke SVG */}
              <svg width="431" height="119" viewBox="0 0 431 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M26.4 50.2C143.3 11.3 368 19 427 30.7C334 35.2 60.1 98.4 60.1 98.4C60.1 98.4 220.7 52.5 320.8 91.4"
                  stroke="#B8D3D9"
                  strokeWidth="36"
                  strokeLinecap="round"
                />
              </svg>
              <h1 className="fs-48 ff-title cl-green">
                Nền tảng Anh ngữ AI<br />
                THE AESP PLATFORM
              </h1>
              <div className="title_icon">
                <svg viewBox="0 0 24 24" fill="#ED3838" width="28" height="28">
                  <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                </svg>
              </div>
            </div>

            <div className="desc">
              <ul>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Mô hình luyện nói phản xạ 1-1</strong> cùng trợ lý AI thời gian thực
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Phản hồi phát âm & ngữ điệu</strong> chuẩn IPA và khung tham chiếu quốc tế
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Lộ trình học tập cá nhân hóa</strong> phù hợp từ người mới đến nâng cao
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <strong>Đội ngũ Giảng viên & Cố vấn</strong> học thuật theo sát và đồng hành
                </li>
              </ul>
            </div>

            <div>
              <button className="btn-red" onClick={() => scrollToSection("register")}>
                Đăng ký ngay →
              </button>
            </div>

            <div className="banner_line"></div>

            <div className="partner_head">Hợp tác với các tổ chức giáo dục hàng đầu.</div>
            <div className="partner_logos">
              {samplePartners.map((p) => (
                <img key={p.id} src={p.logo} alt={p.name} title={p.name} />
              ))}
            </div>
          </div>

          {/* Right Column: Featured Teacher & Badge */}
          <div className="banner_right">
            <div className="featured_card">
              {/* Scalloped Red Badge */}
              <div className="score_badge">
                <span className="score_num">{mentors[activeMentorIndex].badge.split(" ")[0]}</span>
                <span className="score_label">{mentors[activeMentorIndex].badge.split(" ")[1] || "AI TECH"}</span>
              </div>

              <img src={mentorImage} alt="Giảng viên AESP" className="mentor_photo" />
            </div>

            {/* Slider Dots */}
            <div className="slider_dots">
              {mentors.map((_, idx) => (
                <span
                  key={idx}
                  className={activeMentorIndex === idx ? "active" : ""}
                  onClick={() => setActiveMentorIndex(idx)}
                />
              ))}
            </div>

            {/* Teacher Caption */}
            <div className="mentor_caption">
              <h4>{mentors[activeMentorIndex].name}</h4>
              <p>{mentors[activeMentorIndex].sub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRAINING COUNTER SECTION */}
      <section className="training_section" id="stats">
        <div className="title_animate">
          <svg width="567" height="115" viewBox="0 0 567 115" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M60.2 42.6C210.2 9.4 399.1 21.2 474.8 31.2C355.4 35 3.9 88.9 3.9 88.9C3.9 88.9 341.2 27.3 540.7 88.9"
              stroke="#B8D3D9"
              strokeWidth="36"
              strokeLinecap="round"
            />
          </svg>
          <h3 className="fs-48 ff-title cl-green">
            Chương trình đào tạo<br />chất lượng cao
          </h3>
          <div className="title_icon">
            <svg viewBox="0 0 24 24" fill="#27C4B5" width="28" height="28">
              <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
            </svg>
          </div>
        </div>

        <div className="training_grid">
          <div className="training_item">
            <div className="num">8<span className="plus">+</span></div>
            <div className="label">Năm phát triển<br />công nghệ AI hội thoại</div>
          </div>
          <div className="training_item">
            <div className="num">10<span className="plus">+</span></div>
            <div className="label">Đối tác & trường<br />đại học uy tín</div>
          </div>
          <div className="training_item">
            <div className="num">200<span className="plus">+</span></div>
            <div className="label">Học viên xuất sắc<br />đạt chứng chỉ quốc tế</div>
          </div>
          <div className="training_item">
            <div className="num">100<span className="plus">%</span></div>
            <div className="label">Giáo viên chuyên môn<br />& trợ lý AI chuẩn giọng</div>
          </div>
          <div className="training_item">
            <div className="num">5,000<span className="plus">+</span></div>
            <div className="label">Học viên tự tin<br />giao tiếp tiếng Anh</div>
          </div>
          <div className="training_item">
            <div className="num">Top 10</div>
            <div className="label">Nền tảng EdTech<br />luyện nói tiêu biểu</div>
          </div>
        </div>
      </section>

      {/* DIFFERENT SECTION (SIGNATURE DARK GREEN) */}
      <section className="different_section" id="features">
        <div style={{ textAlign: "center" }}>
          <div className="title_animate">
            <svg width="453" height="119" viewBox="0 0 453 119" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M26 50.2C149.4 11.3 386.7 19 449 30.7C350.7 35.2 61.6 98.4 61.6 98.4C61.6 98.4 231.1 52.5 336.8 91.4"
                stroke="#27C4B5"
                strokeWidth="36"
                strokeLinecap="round"
              />
            </svg>
            <h3 className="fs-48 ff-title">
              Điều gì làm cho<br />AESP khác biệt
            </h3>
          </div>
        </div>

        <p className="diff_intro">
          AESP là nền tảng luyện nói tiếng Anh kết hợp công nghệ Trí tuệ nhân tạo tương tác thời gian thực
          cùng phương pháp sư phạm hiện đại. Chúng tôi tạo ra môi trường luyện nói an toàn, tự tin, không sợ phán xét.
        </p>

        <div className="diff_list">
          {/* Item 1 */}
          <div className="diff_item">
            <div className="diff_card_image">
              <img src={mentorImage} alt="Mô hình AI độc quyền" />
            </div>
            <div className="diff_text">
              <h4>Mô hình luyện nói tương tác độc quyền cùng AI Voice</h4>
              <ul>
                <li>
                  <span className="check">✔</span>
                  Luyện tập phản xạ giao tiếp tự nhiên với AI đối thoại đa kịch bản.
                </li>
                <li>
                  <span className="check">✔</span>
                  Hơn 150+ chủ đề từ công việc, du lịch đến học thuật và đời sống.
                </li>
                <li>
                  <span className="check">✔</span>
                  Không còn rào cản ngại ngùng hay sợ phát âm sai khi nói chuyện.
                </li>
                <li>
                  <span className="check">✔</span>
                  Truy cập rèn luyện 24/7 mọi lúc mọi nơi trên cả máy tính & điện thoại.
                </li>
              </ul>
            </div>
          </div>

          {/* Item 2 (Reverse) */}
          <div className="diff_item reverse">
            <div className="diff_card_image">
              <img src={mentorImage} alt="Khóa học trực tuyến bổ trợ" />
            </div>
            <div className="diff_text">
              <h4>Chấm điểm phát âm & phản hồi tức thì chuẩn IPA</h4>
              <ul>
                <li>
                  <span className="check">✔</span>
                  Phân tích chi tiết từng âm tiết, ngữ điệu (intonation) và trọng âm (stress).
                </li>
                <li>
                  <span className="check">✔</span>
                  Gợi ý cách đặt khẩu hình miệng và sửa lỗi phát âm cụ thể ngay sau mỗi câu nói.
                </li>
                <li>
                  <span className="check">✔</span>
                  Người mới bắt đầu nhận gợi ý câu hoàn chỉnh; người giỏi nhận cụm từ nâng cao.
                </li>
              </ul>
            </div>
          </div>

          {/* Item 3 */}
          <div className="diff_item">
            <div className="diff_card_image">
              <img src={mentorImage} alt="Giáo trình chuyên sâu" />
            </div>
            <div className="diff_text">
              <h4>Lộ trình thích ứng cá nhân hóa & Giảng viên đồng hành</h4>
              <ul>
                <li>
                  <span className="check">✔</span>
                  Đánh giá năng lực đầu vào bằng bài test nói thông minh tự động.
                </li>
                <li>
                  <span className="check">✔</span>
                  Lộ trình học tự điều chỉnh linh hoạt theo tốc độ tiến bộ của từng học viên.
                </li>
                <li>
                  <span className="check">✔</span>
                  Đội ngũ giáo viên chuyên môn giải đáp thắc mắc và kiểm duyệt chất lượng.
                </li>
                <li>
                  <span className="check">✔</span>
                  Cấp chứng chỉ xác nhận năng lực giao tiếp sau khi hoàn thành các mốc học.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES / COURSES SECTION */}
      <section className="course_section" id="packages">
        <div className="title_animate">
          <svg width="567" height="115" viewBox="0 0 567 115" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M60.2 42.6C210.2 9.4 399.1 21.2 474.8 31.2C355.4 35 3.9 88.9 3.9 88.9C3.9 88.9 341.2 27.3 540.7 88.9"
              stroke="#B8D3D9"
              strokeWidth="36"
              strokeLinecap="round"
            />
          </svg>
          <h3 className="fs-48 ff-title cl-green">
            Các gói học<br />phù hợp với bạn
          </h3>
          <div className="title_icon">
            <svg viewBox="0 0 24 24" fill="#ED3838" width="28" height="28">
              <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </svg>
          </div>
        </div>

        <div className="course_grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`course_card ${pkg.featured ? "featured" : ""}`}>
              <div>
                <h4>{pkg.name}</h4>
                <div className="desc">{pkg.desc || "Khóa học luyện nói tiếng Anh toàn diện cùng trợ lý AI."}</div>
                <div className="course_pricing">
                  {pkg.original_price && (
                    <div className="original_price">{pkg.original_price.toLocaleString()} đ</div>
                  )}
                  <div className="current_price">{pkg.price?.toLocaleString()} đ</div>
                  <div className="duration">Thời hạn: {pkg.duration_days || 30} ngày học</div>
                </div>

                <ul className="course_features">
                  {(pkg.features || [
                    "Luyện nói tương tác cùng AI không giới hạn",
                    "Phân tích phát âm chuẩn quốc tế",
                    "Bài tập cá nhân hóa mỗi ngày",
                    "Chứng chỉ hoàn thành lộ trình",
                  ]).map((feat, fIdx) => (
                    <li key={fIdx}>
                      <span className="check">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  className="btn-red"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, course: pkg.name }));
                    scrollToSection("register");
                  }}
                >
                  Đăng ký ngay để nhận ưu đãi →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonial_section" id="testimonials">
        <div className="title_animate">
          <svg width="567" height="115" viewBox="0 0 567 115" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M60.2 42.6C210.2 9.4 399.1 21.2 474.8 31.2C355.4 35 3.9 88.9 3.9 88.9C3.9 88.9 341.2 27.3 540.7 88.9"
              stroke="#B8D3D9"
              strokeWidth="36"
              strokeLinecap="round"
            />
          </svg>
          <h3 className="fs-48 ff-title cl-green">
            Được đánh giá cao<br />bởi hàng ngàn sinh viên
          </h3>
          <div className="title_icon">
            <svg viewBox="0 0 24 24" fill="#27C4B5" width="28" height="28">
              <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
            </svg>
          </div>
        </div>

        <div className="testimonial_wrapper">
          <div className="testimonial_photo">
            <img src={mentorImage} alt="Học viên Như Ý" />
            <div className="teach_badge">
              <span className="score">8.0</span>
              <span className="tag">IELTS</span>
            </div>
          </div>

          <div className="testimonial_content">
            <h4>Như Ý</h4>
            <blockquote>
              "Trước đây mình rất ngại giao tiếp bằng tiếng Anh vì sợ sai phát âm. Nhờ AESP, mình được luyện nói
              thoải mái mỗi ngày với AI, nhận được phản hồi chi tiết đến từng âm cuối. Sau 3 tháng rèn luyện, mình
              đã tự tin tham gia phỏng vấn và đạt kết quả ngoài mong đợi!"
            </blockquote>
            <div className="testimonial_author">
              Học viên khóa Bứt Phá
              <span>Đạt IELTS Speaking 8.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONVERSATIONAL REGISTRATION FORM (THE FORUM MAD LIBS FORM) */}
      <section className="register_site" id="register">
        <div className="register_container">
          <div className="title_animate text-start">
            <svg width="574" height="97" viewBox="0 0 574 97" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24.6 72.3C177.9 35.7 472.7 43 550 54"
                stroke="#27C4B5"
                strokeWidth="36"
                strokeLinecap="round"
              />
            </svg>
            <h4 className="fs-48 ff-title">Đăng kí tư vấn miễn phí</h4>
          </div>

          <div className="register_desc">
            Xây dựng lộ trình học TOÀN DIỆN, bằng cách điền thông tin qua form bên dưới. Đội ngũ cố vấn AESP sẽ liên hệ
            hỗ trợ và gửi tài liệu học thử ngay cho bạn.
          </div>

          {submitMessage && (
            <div
              style={{
                background: "rgba(39, 196, 181, 0.2)",
                border: "1.5px solid #27C4B5",
                color: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontWeight: "600",
              }}
            >
              {submitMessage}
            </div>
          )}

          {/* MAD LIBS SENTENCE FORM */}
          <form onSubmit={handleRegister} className="mad_libs_form">
            <div className="mad_libs_row">
              <span>Xin chào! Mình là</span>
              <input
                type="text"
                className="mad_input"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <span>,</span>
            </div>

            <div className="mad_libs_row">
              <span>quan tâm đến khoá học</span>
              <select
                className="mad_select"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.name}>
                    {pkg.name}
                  </option>
                ))}
              </select>
              <span>!</span>
            </div>

            <div className="mad_libs_row">
              <span>Liên hệ với mình qua</span>
              <input
                type="tel"
                className="mad_input"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <span>, Hoặc</span>
              <input
                type="email"
                className="mad_input"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <span>&lt;3.</span>
            </div>

            <div className="form_submit_row">
              <button type="submit" className="btn-red">
                Đăng ký tư vấn →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER SITE */}
      <footer className="footer_site" id="contact">
        <div className="footer_grid">
          <div className="footer_col">
            <div className="logo_site" style={{ marginBottom: "16px" }}>
              <img src={logo} alt="AESP" style={{ height: "38px" }} />
              <span className="brand_name">
                AESP<span className="dot">.</span>
              </span>
            </div>
            <p className="footer_about_text">
              Nền tảng công nghệ Anh ngữ hàng đầu chuyên đào tạo phản xạ giao tiếp và luyện phát âm cùng Trí tuệ Nhân
              tạo cho mọi cấp độ học viên.
            </p>
            <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.8" }}>
              📍 <strong>Trụ sở chính:</strong> 02 Võ Oanh, Phường 25, Bình Thạnh, TP. Hồ Chí Minh<br />
              📞 <strong>Hotline:</strong> 1900 886640<br />
              ✉️ <strong>Email:</strong> support@aesp.edu.vn
            </div>
          </div>

          <div className="footer_col">
            <h4>AESP PLATFORM</h4>
            <ul>
              <li><a href="#hero">Trang chủ</a></li>
              <li><a href="#about">Về chúng tôi</a></li>
              <li><a href="#stats">Chất lượng đào tạo</a></li>
              <li><a href="#features">Công nghệ AI</a></li>
              <li><a href="#testimonials">Cảm nhận học viên</a></li>
            </ul>
          </div>

          <div className="footer_col">
            <h4>KHÓA HỌC & GÓI</h4>
            <ul>
              {packages.map((p) => (
                <li key={p.id}>
                  <a href="#packages">{p.name}</a>
                </li>
              ))}
              <li><a href="#register">Luyện thi chứng chỉ</a></li>
            </ul>
          </div>

          <div className="footer_col">
            <h4>CHÍNH SÁCH</h4>
            <ul>
              <li><a href="#">Chính sách bảo mật thông tin</a></li>
              <li><a href="#">Điều khoản sử dụng dịch vụ</a></li>
              <li><a href="#">Chính sách hoàn tiền học phí</a></li>
              <li><a href="#">Hướng dẫn thanh toán an toàn</a></li>
            </ul>
          </div>
        </div>

        <div className="copyright_row">
          <div>© 2026 AESP Education Platform. All rights reserved.</div>
          <div>Make with ❤️ for English Learners</div>
        </div>
      </footer>
    </div>
  );
}