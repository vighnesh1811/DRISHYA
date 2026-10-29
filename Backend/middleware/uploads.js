import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDirectory = path.resolve('uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDirectory),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

const imageOnly = (_request, file, callback) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
  callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
};

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageOnly
});

export const uploadDirectoryPath = uploadDirectory;
