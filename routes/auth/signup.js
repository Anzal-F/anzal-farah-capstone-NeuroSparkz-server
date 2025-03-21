import express from "express";
import bcrypt from 'bcrypt'
import knex from '../../db.js';

const router = express.Router();


router.post('/signup', async (req, res) => {
    const { identifier, password, confirmPassword } = req.body;

    if (!identifier || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
  
    try {
      const existingUser = await knex('users').where({ identifier }).first();
      if (existingUser) {
        return res.status(400).json({ error: 'Username/email already in use' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      await knex('users').insert({ identifier, password: hashedPassword });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  export default router;