import bcrypt from 'bcrypt';
import { Router } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { loginRules, registrationRules } from '../validators/auth.js';
import { publicUser, setAuthCookie } from '../utils/auth.js';

const router = Router();

function validate(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ message: 'Please check the submitted fields', errors: errors.array() });
  next();
}

async function login(request, response) {
  const { email, password } = request.body;
  const [rows] = await pool.execute('SELECT id, full_name, email, phone, password_hash, role FROM users WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return response.status(401).json({ message: 'Invalid email or password' });
  setAuthCookie(response, user);
  response.json({ user: publicUser(user) });
}

router.post('/register', registrationRules, validate, async (request, response, next) => {
  try {
    const { fullName, email, phone, password } = request.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) return response.status(409).json({ message: 'An account with this email already exists' });
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, phone || null, passwordHash, 'customer']
    );
    const user = { id: result.insertId, full_name: fullName, email, phone: phone || null, role: 'customer' };
    setAuthCookie(response, user);
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginRules, validate, async (request, response, next) => {
  try { await login(request, response); } catch (error) { next(error); }
});

router.post('/admin/login', loginRules, validate, async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const [rows] = await pool.execute('SELECT id, full_name, email, phone, password_hash, role FROM users WHERE email = ? AND role = ? LIMIT 1', [email, 'admin']);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return response.status(401).json({ message: 'Invalid administrator credentials' });
    setAuthCookie(response, user);
    response.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, full_name, email, phone, role FROM users WHERE id = ? LIMIT 1', [request.user.id]);
    if (!rows.length) return response.status(401).json({ message: 'Account not found' });
    response.json({ user: publicUser(rows[0]) });
  } catch (error) { next(error); }
});

router.post('/logout', (_request, response) => {
  response.clearCookie('drishya_token');
  response.status(204).end();
});

export default router;
