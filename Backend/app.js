import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import path from 'node:path';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import bookingRoutes from './routes/bookings.js';
import adminOperationsRoutes from './routes/adminOperations.js';
import phase5Routes from './routes/phase5.js';

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'drishya-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminOperationsRoutes);
app.use('/api', phase5Routes);

app.use((error, _request, response, _next) => {
  console.error('API error:', error);
  if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'A record with those unique details already exists' });
  if (error.code === 'ER_DATA_TOO_LONG') return response.status(422).json({ message: 'One of the submitted fields is too long' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return response.status(422).json({ message: 'The selected category or related record is invalid' });
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return response.status(422).json({ message: 'Image must be 5 MB or smaller' });
    return response.status(422).json({ message: 'Only JPG, PNG, and WebP image files are supported' });
  }
  response.status(500).json({ message: 'An unexpected server error occurred' });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

export default app;
