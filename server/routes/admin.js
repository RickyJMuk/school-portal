import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT u.*, 
             CASE 
               WHEN u.role = 'student' THEN c.name 
               WHEN u.role = 'teacher' THEN tc.name 
               ELSE NULL 
             END as class_name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN classes tc ON t.class_id = tc.id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { full_name, email, password, role, class_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.runAsync(`
      INSERT INTO users (id, full_name, email, password, role, is_whitelisted)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, full_name, email, hashedPassword, role, true]);

    // If student or teacher, create role-specific record
    if (role === 'student' && class_id) {
      const studentId = uuidv4();
      await db.runAsync(`
        INSERT INTO students (id, user_id, class_id)
        VALUES (?, ?, ?)
      `, [studentId, userId, class_id]);
    } else if (role === 'teacher' && class_id) {
      const teacherId = uuidv4();
      await db.runAsync(`
        INSERT INTO teachers (id, user_id, class_id)
        VALUES (?, ?, ?)
      `, [teacherId, userId, class_id]);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await db.runAsync('DELETE FROM students WHERE user_id = ?', [id]);
    await db.runAsync('DELETE FROM teachers WHERE user_id = ?', [id]);
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await db.allAsync('SELECT * FROM classes ORDER BY level, name');
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create class
router.post('/classes', async (req, res) => {
  try {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ message: 'Name and level are required' });
    }

    const classId = uuidv4();
    await db.runAsync(`
      INSERT INTO classes (id, name, level)
      VALUES (?, ?, ?)
    `, [classId, name, level]);

    res.status(201).json({ message: 'Class created successfully' });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await db.allAsync(`
      SELECT s.*, c.name as class_name, c.level as class_level
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      ORDER BY c.level, s.name
    `);
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create subject
router.post('/subjects', async (req, res) => {
  try {
    const { name, class_id } = req.body;

    if (!name || !class_id) {
      return res.status(400).json({ message: 'Name and class are required' });
    }

    const subjectId = uuidv4();
    await db.runAsync(`
      INSERT INTO subjects (id, name, class_id)
      VALUES (?, ?, ?)
    `, [subjectId, name, class_id]);

    res.status(201).json({ message: 'Subject created successfully' });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      total_users: 0,
      total_students: 0,
      total_teachers: 0,
      total_classes: 0,
      total_subjects: 0,
      total_assignments: 0,
      pending_submissions: 0
    };

    const userCount = await db.getAsync('SELECT COUNT(*) as count FROM users');
    stats.total_users = userCount.count;

    const studentCount = await db.getAsync('SELECT COUNT(*) as count FROM students');
    stats.total_students = studentCount.count;

    const teacherCount = await db.getAsync('SELECT COUNT(*) as count FROM teachers');
    stats.total_teachers = teacherCount.count;

    const classCount = await db.getAsync('SELECT COUNT(*) as count FROM classes');
    stats.total_classes = classCount.count;

    const subjectCount = await db.getAsync('SELECT COUNT(*) as count FROM subjects');
    stats.total_subjects = subjectCount.count;

    const assignmentCount = await db.getAsync('SELECT COUNT(*) as count FROM assignments');
    stats.total_assignments = assignmentCount.count;

    const pendingCount = await db.getAsync('SELECT COUNT(*) as count FROM submissions WHERE is_marked = FALSE');
    stats.pending_submissions = pendingCount.count;

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
