import pool from "../src/config/db.js";

async function checkDb() {
  try {
    console.log("🔍 Checking PostgreSQL database connection...");
    const res = await pool.query("SELECT current_database(), current_user, version();");
    const row = res.rows[0];
    console.log(`✅ PostgreSQL is Healthy!`);
    console.log(`   - Database: ${row.current_database}`);
    console.log(`   - User: ${row.current_user}`);

    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`📊 Found ${tablesRes.rows.length} tables in database:`);
    if (tablesRes.rows.length > 0) {
      console.log(`   Tables: ${tablesRes.rows.map(r => r.table_name).join(", ")}`);
    } else {
      console.log("   ⚠️  No tables found. You may need to run: npm run init:db");
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database connection failed!");
    console.error(`   Error: ${err.message}`);
    console.error("💡 Tips:");
    console.error("   1. Check if PostgreSQL / Docker container is running.");
    console.error("   2. Run `docker compose up -d db` (from inside the AESP directory).");
    console.error("   3. Verify credentials in backend/.env.local (default: user=postgres, password=1234, port=5432).");
    process.exit(1);
  }
}

checkDb();
