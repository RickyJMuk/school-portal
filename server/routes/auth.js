import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_whitelisted) {
      return res.status(403).json({ message: 'Account not authorized' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let userDetails = {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role
    };

    // Get additional role-specific details
    if (req.user.role === 'student') {
      const student = await db.getAsync(
        `SELECT s.*, c.name as class_name, c.level as class_level 
         FROM students s 
         JOIN classes c ON s.class_id = c.id 
         WHERE s.user_id = ?`,
        [req.user.id]
      );
      userDetails.student_info = student;
    } else if (req.user.role === 'teacher') {
      const teacher = await db.getAsync(
        `SELECT t.*, c.name as class_name, c.level as class_level 
         FROM teachers t 
         JOIN classes c ON t.class_id = c.id 
         WHERE t.user_id = ?`,
        [req.user.id]
      );
      
      const subjects = await db.allAsync(
        `SELECT s.* FROM subjects s
         JOIN teacher_subjects ts ON s.id = ts.subject_id
         JOIN teachers t ON ts.teacher_id = t.id
         WHERE t.user_id = ?`,
        [req.user.id]
      );
      
      userDetails.teacher_info = { ...teacher, subjects };
    }

    res.json(userDetails);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
