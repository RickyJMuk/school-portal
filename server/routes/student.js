import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and student role requirement to all routes
router.use(authenticateToken);
router.use(requireRole(['student']));

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const student = await db.getAsync(`
      SELECT s.*, c.name as class_name, c.level as class_level
      FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE s.user_id = ?
    `, [req.user.id]);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get subjects for student's class
    const subjects = await db.allAsync(`
      SELECT s.id, s.name
      FROM subjects s
      WHERE s.class_id = ?
    `, [student.class_id]);

    // Get recent submissions
    const recentSubmissions = await db.allAsync(`
      SELECT sub.id, sub.submitted_at, sub.total_score, sub.is_marked,
             a.title as assignment_title, subj.name as subject_name
      FROM submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN subjects subj ON a.subject_id = subj.id
      WHERE sub.student_id = ?
      ORDER BY sub.submitted_at DESC
      LIMIT 5
    `, [student.id]);

    // Get pending assignments
    const pendingAssignments = await db.allAsync(`
      SELECT a.id, a.title, a.deadline, a.type, subj.name as subject_name
      FROM assignments a
      JOIN subjects subj ON a.subject_id = subj.id
      LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE a.class_id = ? AND sub.id IS NULL AND a.deadline > datetime('now')
      ORDER BY a.deadline ASC
    `, [student.id, student.class_id]);

    res.json({
      student_info: student,
      subjects,
      recent_submissions: recentSubmissions,
      pending_assignments: pendingAssignments,
      stats: {
        total_subjects: subjects.length,
        completed_assignments: recentSubmissions.length,
        pending_assignments: pendingAssignments.length
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subjects for student
router.get('/subjects', async (req, res) => {
  try {
    const student = await db.getAsync(
      'SELECT class_id FROM students WHERE user_id = ?', 
      [req.user.id]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const subjects = await db.allAsync(`
      SELECT s.id, s.name
      FROM subjects s
      WHERE s.class_id = ?
      ORDER BY s.name
    `, [student.class_id]);

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assignments for a subject
router.get('/subjects/:subjectId/assignments', async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const student = await db.getAsync(
      'SELECT id, class_id FROM students WHERE user_id = ?', 
      [req.user.id]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignments = await db.allAsync(`
      SELECT a.*, 
             CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END as is_submitted,
             sub.total_score, sub.is_marked, sub.submitted_at
      FROM assignments a
      LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE a.subject_id = ? AND a.class_id = ?
      ORDER BY a.deadline ASC
    `, [student.id, subjectId, student.class_id]);

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submission history
router.get('/submissions', async (req, res) => {
  try {
    const student = await db.getAsync(
      'SELECT id FROM students WHERE user_id = ?', 
      [req.user.id]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const submissions = await db.allAsync(`
      SELECT sub.*, a.title as assignment_title, a.type as assignment_type,
             subj.name as subject_name
      FROM submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN subjects subj ON a.subject_id = subj.id
      WHERE sub.student_id = ?
      ORDER BY sub.submitted_at DESC
    `, [student.id]);

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;