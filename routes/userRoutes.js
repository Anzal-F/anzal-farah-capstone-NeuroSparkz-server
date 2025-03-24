import { Router } from 'express';
import knex from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Bearer

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ✅ Endpoint to get userId after login
router.get('/get-userid', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Extracted from JWT token

  try {
    const user = await knex('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userId: user.id });
  } catch (error) {
    console.error('Error fetching userId:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;