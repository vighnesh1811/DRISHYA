import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth, requireAdmin);
const activeStatuses = ['approved', 'active'];

router.get('/bookings', async (_request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.id, b.status, b.start_date AS startDate, b.end_date AS endDate, b.subtotal, b.deposit_amount AS depositAmount,
        u.full_name AS customerName, u.email AS customerEmail,
        JSON_ARRAYAGG(JSON_OBJECT('id', bi.id, 'name', e.name, 'equipmentId', e.id, 'quantity', bi.quantity)) AS items
       FROM bookings b JOIN users u ON u.id = b.user_id
       JOIN booking_items bi ON bi.booking_id = b.id JOIN equipment e ON e.id = bi.equipment_id
       GROUP BY b.id ORDER BY b.created_at DESC`
    );
    response.json({ bookings: rows });
  } catch (error) { next(error); }
});

router.get('/units', async (_request, response, next) => {
  try {
    const [rows] = await pool.execute('SELECT eu.id, eu.asset_code AS assetCode, eu.status, eu.condition_notes AS conditionNotes, e.id AS equipmentId, e.name FROM equipment_units eu JOIN equipment e ON e.id = eu.equipment_id ORDER BY e.name, eu.asset_code');
    response.json({ units: rows });
  } catch (error) { next(error); }
});

router.post('/units', async (request, response, next) => {
  try {
    const { equipmentId, assetCode, conditionNotes = '' } = request.body;
    if (!equipmentId || !assetCode?.trim()) return response.status(422).json({ message: 'Equipment and asset code are required' });
    const [equipment] = await pool.execute('SELECT id FROM equipment WHERE id = ? LIMIT 1', [equipmentId]);
    if (!equipment.length) return response.status(404).json({ message: `Equipment ID ${equipmentId} was not found` });
    const [result] = await pool.execute('INSERT INTO equipment_units (equipment_id, asset_code, condition_notes) VALUES (?, ?, ?)', [equipmentId, assetCode.trim(), conditionNotes]);
    response.status(201).json({ id: result.insertId });
  } catch (error) { next(error); }
});

router.patch('/units/:id/maintenance', async (request, response, next) => {
  try {
    const { enabled, conditionNotes = '' } = request.body;
    const status = enabled ? 'maintenance' : 'available';
    await pool.execute('UPDATE equipment_units SET status = ?, condition_notes = ? WHERE id = ? AND status != "rented"', [status, conditionNotes, request.params.id]);
    response.json({ message: `Unit marked ${enabled ? 'for maintenance' : 'available'}` });
  } catch (error) { next(error); }
});

router.patch('/bookings/:id/status', async (request, response, next) => {
  const connection = await pool.getConnection();
  try {
    const { status } = request.body;
    if (!['approved', 'cancelled'].includes(status)) return response.status(422).json({ message: 'Only approval or rejection is available at this stage' });
    await connection.beginTransaction();
    const [bookings] = await connection.execute('SELECT id, status, start_date AS startDate, end_date AS endDate FROM bookings WHERE id = ? FOR UPDATE', [request.params.id]);
    if (!bookings.length) { await connection.rollback(); return response.status(404).json({ message: 'Booking not found' }); }
    if (status === 'approved') {
      const [conflicts] = await connection.execute(
        `SELECT bi.equipment_id, SUM(bi.quantity) AS quantity, e.available_units,
          COALESCE((SELECT SUM(bi2.quantity) FROM booking_items bi2 JOIN bookings b2 ON b2.id = bi2.booking_id WHERE bi2.equipment_id = bi.equipment_id AND b2.status IN (?, ?) AND b2.start_date <= ? AND b2.end_date >= ?), 0) AS reserved
         FROM booking_items bi JOIN equipment e ON e.id = bi.equipment_id WHERE bi.booking_id = ? GROUP BY bi.equipment_id`,
        [...activeStatuses, bookings[0].endDate, bookings[0].startDate, request.params.id]
      );
      if (conflicts.some((row) => Number(row.available_units) - Number(row.reserved) < Number(row.quantity))) {
        await connection.rollback();
        return response.status(409).json({ message: 'One or more items are no longer available for these dates' });
      }
    }
    await connection.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, request.params.id]);
    await connection.commit();
    response.json({ message: `Booking ${status}` });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
});

router.post('/bookings/:id/handover', async (request, response, next) => {
  const connection = await pool.getConnection();
  try {
    const { customerVerified, conditionNotes = '', paymentAmount = 0, depositAmount = 0, paymentMethod = 'manual', unitIds = [] } = request.body;
    if (!customerVerified) return response.status(422).json({ message: 'Customer verification is required before handover' });
    await connection.beginTransaction();
    const [booking] = await connection.execute('SELECT id, status FROM bookings WHERE id = ? FOR UPDATE', [request.params.id]);
    if (!booking.length || booking[0].status !== 'approved') { await connection.rollback(); return response.status(409).json({ message: 'Only approved bookings can be handed over' }); }
    for (const unitId of unitIds) {
      const [updated] = await connection.execute("UPDATE equipment_units SET status = 'rented' WHERE id = ? AND status = 'available'", [unitId]);
      if (!updated.affectedRows) { await connection.rollback(); return response.status(409).json({ message: `Unit ${unitId} is not available` }); }
      await connection.execute('INSERT INTO booking_unit_assignments (booking_id, booking_item_id, unit_id) SELECT ?, bi.id, ? FROM booking_items bi WHERE bi.booking_id = ? LIMIT 1', [request.params.id, unitId, request.params.id]);
    }
    await connection.execute('INSERT INTO booking_operations (booking_id, operation, condition_notes, customer_verified) VALUES (?, "handover", ?, ?)', [request.params.id, conditionNotes, true]);
    if (Number(paymentAmount) > 0) await connection.execute('INSERT INTO booking_payments (booking_id, payment_type, amount, method) VALUES (?, "rental", ?, ?)', [request.params.id, paymentAmount, paymentMethod]);
    if (Number(depositAmount) > 0) await connection.execute('INSERT INTO booking_payments (booking_id, payment_type, amount, method) VALUES (?, "deposit", ?, ?)', [request.params.id, depositAmount, paymentMethod]);
    await connection.execute("UPDATE bookings SET status = 'active' WHERE id = ?", [request.params.id]);
    await connection.commit();
    response.json({ message: 'Handover recorded' });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
});

router.post('/bookings/:id/return', async (request, response, next) => {
  const connection = await pool.getConnection();
  try {
    const { conditionNotes = '', missingAccessories = '', damageCharges = 0, depositRefund = 0, unitIds = [] } = request.body;
    await connection.beginTransaction();
    const [booking] = await connection.execute('SELECT id, status FROM bookings WHERE id = ? FOR UPDATE', [request.params.id]);
    if (!booking.length || booking[0].status !== 'active') { await connection.rollback(); return response.status(409).json({ message: 'Only active bookings can be returned' }); }
    for (const unitId of unitIds) {
      await connection.execute("UPDATE equipment_units SET status = 'available', condition_notes = ? WHERE id = ? AND status = 'rented'", [conditionNotes, unitId]);
      await connection.execute('UPDATE booking_unit_assignments SET returned_at = CURRENT_TIMESTAMP WHERE booking_id = ? AND unit_id = ?', [request.params.id, unitId]);
    }
    await connection.execute('INSERT INTO booking_operations (booking_id, operation, condition_notes, missing_accessories, damage_charges, deposit_refund) VALUES (?, "return", ?, ?, ?, ?)', [request.params.id, conditionNotes, missingAccessories, damageCharges, depositRefund]);
    if (Number(damageCharges) > 0) await connection.execute('INSERT INTO booking_payments (booking_id, payment_type, amount, method) VALUES (?, "damage", ?, "manual")', [request.params.id, damageCharges]);
    if (Number(depositRefund) > 0) await connection.execute('INSERT INTO booking_payments (booking_id, payment_type, amount, method, status) VALUES (?, "refund", ?, "manual", "refunded")', [request.params.id, depositRefund]);
    await connection.execute("UPDATE bookings SET status = 'returned' WHERE id = ?", [request.params.id]);
    await connection.commit();
    response.json({ message: 'Return recorded' });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
});

export default router;
