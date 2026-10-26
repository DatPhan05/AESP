import pool from "../config/db.js";

function mapUserRow(row) {
  if (!row) return null;
  return {
    ...row,
    password: row.password_hash || row.password,
    status: row.banned ? "banned" : "active"
  };
}

export async function getAllUsers() {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return rows.map(mapUserRow);
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return mapUserRow(rows[0]);
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return mapUserRow(rows[0]);
}

export async function findUserByPhone(phone) {
  const { rows } = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
  return mapUserRow(rows[0]);
}

export async function findUserByIdentifier(identifier) {
  if (!identifier) return null;

  if (typeof identifier === "string" && /\S+@\S+\.\S+/.test(identifier)) {
    return await findUserByEmail(identifier.toLowerCase());
  }

  if (typeof identifier === "string" && /^0\d{9}$/.test(identifier)) {
    return await findUserByPhone(identifier);
  }

  const idNum = Number(identifier);
  if (!Number.isNaN(idNum)) {
    return await findUserById(idNum);
  }

  return null;
}

export async function createUserInDb(user) {
  const userRole = (user.role || 'learner').toLowerCase();
  const passwordHash = user.password || user.password_hash;
  const isBanned = user.status === 'banned' || Boolean(user.banned);

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, role, password_hash, security_question, security_answer, banned)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      user.name,
      user.email,
      user.phone,
      userRole,
      passwordHash,
      user.security_question || null,
      user.security_answer || null,
      isBanned
    ]
  );
  const created = mapUserRow(result.rows[0]);

  if (['learner', 'user'].includes(userRole)) {
    try {
      await pool.query(
        `INSERT INTO learners (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [created.id]
      );
    } catch (e) {
      // Non-fatal if learners table doesn't have unique constraint
    }
  }

  return created;
}

export async function updateUserInDb(id, updates) {
  const allowedFields = ["name", "email", "phone", "role", "avatar_url", "security_question", "security_answer"];
  const dbUpdates = {};

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      dbUpdates[key] = updates[key];
    } else if (key === "password" || key === "password_hash") {
      dbUpdates["password_hash"] = updates[key];
    } else if (key === "status" || key === "banned") {
      dbUpdates["banned"] = updates[key] === "banned" || Boolean(updates[key]);
    }
  }

  const fields = Object.keys(dbUpdates);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = [id, ...fields.map(f => dbUpdates[f])];

  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    values
  );
  return mapUserRow(rows[0]);
}

export async function deleteUserInDb(id) {
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}

export async function toggleUserStatusInDb(id) {
  const { rows } = await pool.query(
    `UPDATE users
     SET banned = NOT COALESCE(banned, false),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return mapUserRow(rows[0]);
}

export async function updateUserPasswordByEmail(email, hashedPassword) {
  const { rows } = await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING *",
    [hashedPassword, email]
  );
  return mapUserRow(rows[0]);
}

export async function updateUserPasswordById(id, hashedPassword) {
  const { rows } = await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [hashedPassword, id]
  );
  return mapUserRow(rows[0]);
}
