import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';
import { imageUpload } from '../middleware/uploads.js';

const router = Router();
const fields = 'e.id, e.name, e.slug, e.description, e.daily_rate AS dailyRate, e.security_deposit AS securityDeposit, e.total_units AS totalUnits, e.available_units AS availableUnits, e.image_url AS imageUrl, e.status, c.name AS categoryName, c.slug AS categorySlug';

router.get('/categories', async (_request, response, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, slug FROM equipment_categories ORDER BY name');
    response.json({ categories: rows });
  } catch (error) { next(error); }
});

router.get('/', async (request, response, next) => {
  try {
    const { search = '', category = '', sort = 'name' } = request.query;
    const orderBy = { name: 'e.name ASC', price_asc: 'e.daily_rate ASC', price_desc: 'e.daily_rate DESC' }[sort] || 'e.name ASC';
    const conditions = ['e.status = ?'];
    const params = ['active'];
    if (search) { conditions.push('(e.name LIKE ? OR e.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (category) { conditions.push('c.slug = ?'); params.push(category); }
    const [rows] = await pool.execute(`SELECT ${fields} FROM equipment e JOIN equipment_categories c ON c.id = e.category_id WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`, params);
    response.json({ equipment: rows });
  } catch (error) { next(error); }
});

router.get('/:slug', async (request, response, next) => {
  try {
    const [rows] = await pool.execute(`SELECT ${fields} FROM equipment e JOIN equipment_categories c ON c.id = e.category_id WHERE e.slug = ? AND e.status = 'active' LIMIT 1`, [request.params.slug]);
    if (!rows.length) return response.status(404).json({ message: 'Equipment not found' });
    response.json({ equipment: rows[0] });
  } catch (error) { next(error); }
});

router.post('/image-upload', requireAuth, requireAdmin, imageUpload.single('image'), (request, response) => {
  if (!request.file) return response.status(422).json({ message: 'Please select an image file' });
  response.status(201).json({ imageUrl: `/uploads/${request.file.filename}` });
});

router.post('/', requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const { name, slug, categoryId, description, dailyRate, securityDeposit = 0, totalUnits = 1, imageUrl = null } = request.body;
    const normalizedName = name?.trim();
    const normalizedSlug = slug?.trim().toLowerCase();
    const rate = Number(dailyRate);
    const deposit = Number(securityDeposit);
    const units = Number(totalUnits);
    const normalizedImageUrl = imageUrl?.trim() || null;
    if (!normalizedName || !normalizedSlug || !categoryId || !Number.isFinite(rate) || rate < 0 || !Number.isFinite(deposit) || deposit < 0 || !Number.isInteger(units) || units < 1) {
      return response.status(422).json({ message: 'Name, slug, category, valid rate, deposit, and stock are required' });
    }
    if (normalizedSlug.length > 180) return response.status(422).json({ message: 'URL slug must be 180 characters or fewer' });
    if (normalizedImageUrl && normalizedImageUrl.length > 500) return response.status(422).json({ message: 'Image URL must be 500 characters or fewer' });
    const [category] = await pool.execute('SELECT id FROM equipment_categories WHERE id = ? LIMIT 1', [categoryId]);
    if (!category.length) return response.status(404).json({ message: 'Selected category was not found' });
    const [result] = await pool.execute(
      'INSERT INTO equipment (category_id, name, slug, description, daily_rate, security_deposit, total_units, available_units, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [categoryId, normalizedName, normalizedSlug, description?.trim() || null, rate, deposit, units, units, normalizedImageUrl]
    );
    response.status(201).json({ id: result.insertId });
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const { name, slug, categoryId, description, dailyRate, securityDeposit, totalUnits, availableUnits, imageUrl, status } = request.body;
    await pool.execute(
      'UPDATE equipment SET category_id = ?, name = ?, slug = ?, description = ?, daily_rate = ?, security_deposit = ?, total_units = ?, available_units = ?, image_url = ?, status = ? WHERE id = ?',
      [categoryId, name, slug, description || null, dailyRate, securityDeposit, totalUnits, availableUnits, imageUrl || null, status || 'active', request.params.id]
    );
    response.json({ message: 'Equipment updated' });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireAdmin, async (request, response, next) => {
  try {
    await pool.execute("UPDATE equipment SET status = 'inactive' WHERE id = ?", [request.params.id]);
    response.status(204).end();
  } catch (error) { next(error); }
});

export default router;
