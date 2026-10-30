import axios from "axios";

const GATEWAY_URL = "http://localhost:4000";

async function main() {
  const users = [
    {
      name: "Admin Chrome",
      email: "admin_chrome@aesp.com",
      password: "Password123!@#",
      role: "admin",
      security_question: "Tên thú cưng đầu tiên của bạn là gì?",
      security_answer: "milo"
    },
    {
      name: "Learner Chrome",
      email: "learner_chrome@aesp.com",
      password: "Password123!@#",
      role: "learner",
      security_question: "Tên thú cưng đầu tiên của bạn là gì?",
      security_answer: "milo"
    }
  ];

  for (const u of users) {
    try {
      await axios.post(`${GATEWAY_URL}/api/auth/register`, u);
      console.log(`✅ Registered ${u.role}: ${u.email}`);
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes("tồn tại") || err.response?.data?.message?.includes("already")) {
        console.log(`ℹ️ User ${u.email} already exists.`);
      } else {
        console.error(`❌ Register error for ${u.email}:`, err.response?.data || err.message);
      }
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
