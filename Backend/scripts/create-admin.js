import bcrypt from 'bcrypt';
import 'dotenv/config';
import { pool } from '../config/database.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in Backend/.env.');
  process.exitCode = 1;
} else {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.execute(
    `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = 'admin'`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
  );
  console.log(`Administrator account ready for ${ADMIN_EMAIL}`);
  await pool.end();
}
