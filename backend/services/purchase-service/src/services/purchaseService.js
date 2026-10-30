import pool from "../config/db.js";

export async function getAllPurchases(phone = null) {
  if (phone && phone.trim()) {
    const result = await pool.query(
      `SELECT * 
       FROM learner_package_view 
       WHERE phone LIKE $1 
       ORDER BY 
         CASE 
           WHEN phone = $2 THEN 1
           WHEN phone LIKE $3 THEN 2
           ELSE 3
         END,
         created_at DESC`,
      [`%${phone}%`, phone, `${phone}%`]
    );
    return result.rows;
  } else {
    const result = await pool.query(
      `SELECT * 
       FROM learner_package_view 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }
}

export async function listLearnerPurchases(learnerId) {
  const result = await pool.query(
    `SELECT 
      l.id AS learner_id,
      u.name AS learner_name,
      u.email,
      u.phone,
      pkg.id AS package_id,
      pkg.name AS package_name,
      p.id AS purchase_id,
      p.created_at,
      p.status AS purchase_status,
      (
        COALESCE(
          p.expiry_date,
          p.created_at + (COALESCE(pkg.duration_days, 0) * INTERVAL '1 day')
        )
        + (COALESCE(p.extra_days, 0) * INTERVAL '1 day')
      ) AS expiry_date,
      CASE
        WHEN p.id IS NULL THEN NULL
        WHEN (p.status = 'paused'::purchase_status OR u.status = 'banned') THEN NULL
        WHEN (p.status = 'expired'::purchase_status) THEN 0
        WHEN (
          COALESCE(
            p.expiry_date,
            p.created_at + (COALESCE(pkg.duration_days, 0) * INTERVAL '1 day')
          )
          + (COALESCE(p.extra_days, 0) * INTERVAL '1 day')
        ) < NOW() THEN 0
        ELSE GREATEST(
          0, 
          EXTRACT(
            DAY FROM (
              (
                COALESCE(
                  p.expiry_date,
                  p.created_at + (COALESCE(pkg.duration_days, 0) * INTERVAL '1 day')
                )
                + (COALESCE(p.extra_days, 0) * INTERVAL '1 day')
              ) - NOW()
            )
          )
        )
      END AS days_left,
      p.extra_days
    FROM learners l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN purchases p ON l.id = p.learner_id
    LEFT JOIN packages pkg ON p.package_id = pkg.id
    WHERE l.id = $1
    ORDER BY p.created_at DESC`,
    [learnerId]
  );
  return result.rows;
}

// [AESP-47] Là học viên, tôi muốn mua một gói học
export async function createNewPurchase({ learnerId, userId, packageId, amount, status, payment_status }) {
  let targetUserId = userId;
  if (!targetUserId && learnerId) {
    const lRes = await pool.query("SELECT user_id FROM learners WHERE id = $1", [learnerId]);
    targetUserId = lRes.rows[0]?.user_id || learnerId;
  }

  const pkgRes = await pool.query("SELECT price, duration_days FROM packages WHERE id = $1", [packageId]);
  const finalAmount = amount || pkgRes.rows[0]?.price || 199000;
  const durationDays = pkgRes.rows[0]?.duration_days || 30;
  const finalStatus = payment_status || (status === "active" ? "completed" : "completed");

  const sql = `
    INSERT INTO purchases (learner_id, package_id, amount, payment_method, payment_status, start_date, end_date, created_at)
    VALUES ($1, $2, $3, 'vnpay', $4, NOW(), NOW() + ($5 || ' days')::INTERVAL, NOW())
    RETURNING *
  `;
  const result = await pool.query(sql, [targetUserId, packageId, finalAmount, finalStatus, durationDays]);
  return result.rows[0];
}

export async function renewPurchase(purchaseId, extraDays = 30) {
  const result = await pool.query("SELECT * FROM purchases WHERE id = $1", [purchaseId]);
  const purchase = result.rows[0];
  if (!purchase) throw new Error("Purchase not found");

  await pool.query(
    "UPDATE purchases SET payment_status='completed', end_date = COALESCE(end_date, NOW()) + ($1 || ' days')::INTERVAL WHERE id=$2",
    [extraDays, purchaseId]
  );

  return { success: true };
}

export async function changePackage(purchaseId, newPackageId) {
  const result = await pool.query("SELECT * FROM purchases WHERE id = $1", [purchaseId]);
  const purchase = result.rows[0];
  if (!purchase) throw new Error("Purchase not found");

  const pkgRes = await pool.query("SELECT price, duration_days FROM packages WHERE id = $1", [newPackageId]);
  const newAmount = pkgRes.rows[0]?.price || purchase.amount;
  const durationDays = pkgRes.rows[0]?.duration_days || 30;

  await pool.query(
    "UPDATE purchases SET package_id=$1, amount=$2, end_date = NOW() + ($3 || ' days')::INTERVAL WHERE id=$4",
    [newPackageId, newAmount, durationDays, purchaseId]
  );

  return { success: true };
}

