import { body } from 'express-validator';

export const registrationRules = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ min: 7, max: 30 }).withMessage('Enter a valid mobile number'),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match')
];

export const loginRules = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 1, max: 72 })
];
