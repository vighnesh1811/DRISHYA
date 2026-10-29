import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
const activeStatuses = ['requested', 'approved', 'active'];

function rentalDays(startDate, endDate) {
  return Math.ceil((new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / 86400000);
}

async function getAvailability(connection, items, startDate, endDate) {
  const results = [];
  for (const item of items) {
    const [rows] = await connection.execute(
      `SELECT e.id, e.name, e.daily_rate AS dailyRate, e.security_deposit AS securityDeposit,
        e.available_units - COALESCE(SUM(CASE WHEN b.status IN (?, ?, ?) THEN bi.quantity ELSE 0 END), 0) AS availableUnits
       FROM equipment e
       LEFT JOIN booking_items bi ON bi.equipment_id = e.id
       LEFT JOIN bookings b ON b.id = bi.booking_id AND b.start_date <= ? AND b.end_date >= ?
       WHERE e.id = ? AND e.status = 'active'
       GROUP BY e.id`,
      [...activeStatuses, endDate, startDate, item.equipmentId]
    );
    const equipment = rows[0];
    if (!equipment || Number(equipment.availableUnits) < Number(item.quantity)) return { available: false, equipment };
    results.push({ ...equipment, quantity: Number(item.quantity) });
  }
  return { available: true, items: results };
}

router.get('/availability', async (request, response, next) => {
  try {
    const { startDate, endDate, equipmentId, quantity = 1 } = request.query;
    if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) return response.status(422).json({ message: 'A valid pickup and return date are required' });
    const result = await getAvailability(pool, [{ equipmentId, quantity }], startDate, endDate);
    response.json({ ...result, startDate, endDate });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, async (request, response, next) => {
  const connection = await pool.getConnection();
  try {
    const { startDate, endDate, items, termsAccepted } = request.body;
    if (!termsAccepted || !startDate || !endDate || !Array.isArray(items) || !items.length || new Date(startDate) >= new Date(endDate)) return response.status(422).json({ message: 'Valid dates, equipment, and accepted terms are required' });
    const days = rentalDays(startDate, endDate);
    if (days < 1) return response.status(422).json({ message: 'Return date must be after pickup date' });
    await connection.beginTransaction();
    const availability = await getAvailability(connection, items, startDate, endDate);
    if (!availability.available) {
      await connection.rollback();
      return response.status(409).json({ message: `${availability.equipment?.name || 'Selected equipment'} is not available for those dates` });
    }
    const subtotal = availability.items.reduce((sum, item) => sum + Number(item.dailyRate) * item.quantity * days, 0);
    const depositAmount = availability.items.reduce((sum, item) => sum + Number(item.securityDeposit) * item.quantity, 0);
    const [booking] = await connection.execute(
      'INSERT INTO bookings (user_id, status, start_date, end_date, subtotal, deposit_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [request.user.id, 'requested', startDate, endDate, subtotal, depositAmount]
    );
    for (const item of availability.items) {
      await connection.execute('INSERT INTO booking_items (booking_id, equipment_id, quantity, daily_rate) VALUES (?, ?, ?, ?)', [booking.insertId, item.id, item.quantity, item.dailyRate]);
    }
    await connection.commit();
    response.status(201).json({ bookingId: booking.insertId, status: 'requested', subtotal, depositAmount });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally { connection.release(); }
});

router.get('/mine', requireAuth, async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.id, b.status, b.start_date AS startDate, b.end_date AS endDate, b.subtotal, b.deposit_amount AS depositAmount,
        JSON_ARRAYAGG(JSON_OBJECT('name', e.name, 'quantity', bi.quantity)) AS items
       FROM bookings b JOIN booking_items bi ON bi.booking_id = b.id JOIN equipment e ON e.id = bi.equipment_id
       WHERE b.user_id = ? GROUP BY b.id ORDER BY b.created_at DESC`,
      [request.user.id]
    );
    response.json({ bookings: rows });
  } catch (error) { next(error); }
});

export default router;
