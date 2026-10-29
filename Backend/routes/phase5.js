import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();

router.post('/enquiries', async (request, response, next) => {
  try {
    const { name, email, subject, message } = request.body;
    if (!name?.trim() || !email?.includes('@') || !subject?.trim() || !message?.trim()) return response.status(422).json({ message: 'Name, email, subject, and message are required' });
    const [result] = await pool.execute('INSERT INTO enquiries (name, email, subject, message) VALUES (?, ?, ?, ?)', [name.trim(), email.trim(), subject.trim(), message.trim()]);
    response.status(201).json({ id: result.insertId, message: 'Enquiry received' });
  } catch (error) { next(error); }
});

router.get('/dashboard', requireAuth, async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) AS totalBookings,
        SUM(status IN ('requested')) AS pendingRequests,
        SUM(status IN ('approved')) AS confirmedBookings,
        SUM(status IN ('active')) AS activeRentals,
        SUM(status IN ('returned')) AS completedBookings,
        SUM(status IN ('approved', 'active') AND start_date >= CURRENT_DATE()) AS upcomingPickups,
        SUM(status IN ('approved', 'active') AND end_date >= CURRENT_DATE()) AS upcomingReturns
       FROM bookings WHERE user_id = ?`,
      [request.user.id]
    );
    response.json({ summary: rows[0] });
  } catch (error) { next(error); }
});

router.patch('/profile', requireAuth, async (request, response, next) => {
  try {
    const { fullName, phone } = request.body;
    if (!fullName?.trim()) return response.status(422).json({ message: 'Full name is required' });
    await pool.execute('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [fullName.trim(), phone?.trim() || null, request.user.id]);
    response.json({ message: 'Profile updated', user: { fullName: fullName.trim(), phone: phone?.trim() || null } });
  } catch (error) { next(error); }
});

router.get('/admin/overview', requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const [[equipment]] = await pool.query("SELECT COUNT(*) AS totalProducts, COALESCE(SUM(total_units), 0) AS totalUnits, COALESCE(SUM(available_units), 0) AS availableUnits FROM equipment WHERE status = 'active'");
    const [[bookings]] = await pool.query("SELECT SUM(status = 'requested') AS pendingBookings, SUM(status = 'approved') AS confirmedBookings, SUM(status = 'active') AS activeRentals, SUM(status = 'returned') AS completedBookings, COALESCE((SELECT SUM(amount) FROM booking_payments WHERE payment_type IN ('rental', 'damage') AND status = 'recorded'), 0) AS revenue FROM bookings");
    const [recentBookings] = await pool.query('SELECT b.id, b.status, u.full_name AS customerName, b.start_date AS startDate, b.end_date AS endDate FROM bookings b JOIN users u ON u.id = b.user_id ORDER BY b.created_at DESC LIMIT 8');
    response.json({ equipment, bookings, recentBookings });
  } catch (error) { next(error); }
});

router.get('/admin/customers', requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const [customers] = await pool.query(`SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.created_at AS createdAt, COUNT(b.id) AS bookingCount FROM users u LEFT JOIN bookings b ON b.user_id = u.id WHERE u.role = 'customer' GROUP BY u.id ORDER BY u.created_at DESC`);
    response.json({ customers });
  } catch (error) { next(error); }
});

router.get('/admin/reports', requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const [popular] = await pool.query(`SELECT e.name, SUM(bi.quantity) AS unitsRented FROM booking_items bi JOIN equipment e ON e.id = bi.equipment_id JOIN bookings b ON b.id = bi.booking_id WHERE b.status != 'cancelled' GROUP BY e.id ORDER BY unitsRented DESC LIMIT 5`);
    const [[totals]] = await pool.query(`SELECT COUNT(*) AS totalBookings, COALESCE(SUM(subtotal), 0) AS rentalValue, COALESCE(SUM(deposit_amount), 0) AS depositsHeld FROM bookings WHERE status != 'cancelled'`);
    response.json({ popular, totals });
  } catch (error) { next(error); }
});

router.get('/admin/enquiries', requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const [enquiries] = await pool.query('SELECT id, name, email, subject, message, status, created_at AS createdAt FROM enquiries ORDER BY created_at DESC');
    response.json({ enquiries });
  } catch (error) { next(error); }
});

router.patch('/admin/enquiries/:id', requireAuth, requireAdmin, async (request, response, next) => {
  try {
    if (!['new', 'in_progress', 'resolved'].includes(request.body.status)) return response.status(422).json({ message: 'Invalid enquiry status' });
    await pool.execute('UPDATE enquiries SET status = ? WHERE id = ?', [request.body.status, request.params.id]);
    response.json({ message: 'Enquiry updated' });
  } catch (error) { next(error); }
});

export default router;
