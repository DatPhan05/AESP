import pool from "../config/db.js";

export async function getAllPackages() {
  const sql = `SELECT * FROM packages ORDER BY price ASC`;
  const result = await pool.query(sql);
  return result.rows;
}

export async function getPackageById(id) {
  const sql = `SELECT * FROM packages WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

export async function createPackage(data) {
  const { name, code, description, price, duration_days, durationDays, features = {} } = data;
  const days = duration_days || durationDays || 30;
  const pkgCode = code || `PKG_${Date.now()}`;
  const sql = `
    INSERT INTO packages (name, code, description, price, duration_days, features, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
    RETURNING *
  `;
  const result = await pool.query(sql, [name, pkgCode, description, price, days, JSON.stringify(features)]);
  return result.rows[0];
}

export async function updatePackage(id, data) {
  const { name, description, price, duration_days, durationDays } = data;
  const days = duration_days || durationDays;
  const sql = `
    UPDATE packages
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        duration_days = COALESCE($4, duration_days)
    WHERE id = $5
    RETURNING *
  `;
  const result = await pool.query(sql, [name, description, price, days, id]);
  return result.rows[0];
}

export async function deletePackage(id) {
  const sql = `DELETE FROM packages WHERE id = $1 RETURNING *`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

