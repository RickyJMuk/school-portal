import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and teacher role requirement to all routes
router.use(authenticateToken);
router.use(requireRole(['teacher']));

// Get teacher dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = await db.getAsync(
      'SELECT id FROM teachers WHERE user_id = ?', 
      [req.user.id]
    );

    if (!teacherId) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Get assigned subjects and class info
    const classInfo = await db.getAsync(`
      SELECT c.name as class_name, c.level as class_level
      FROM teachers t
      JOIN classes c ON t.class_id = c.id
      WHERE t.user_id = ?
    `, [req.user.id]);

    const subjects = await db.allAsync(`
      SELECT s.id, s.name
      FROM subjects s
      JOIN teacher_subjects ts ON s.id = ts.subject_id
      JOIN teachers t ON ts.teacher_id = t.id
      WHERE t.user_id = ?
    `, [req.user.id]);

    // Get students in assigned class
    const students = await db.allAsync(`
      SELECT u.id, u.full_name, u.email
      FROM users u
      JOIN students s ON u.id = s.user_id
      JOIN teachers t ON s.class_id = t.class_id
      WHERE t.user_id = ?
    `, [req.user.id]);

    // Get pending submissions for grading
    const pendingSubmissions = await db.allAsync(`
      SELECT sub.id, sub.submitted_at, a.title as assignment_title, 
             u.full_name as student_name, subj.name as subject_name
      FROM submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN subjects subj ON a.subject_id = subj.id
      JOIN teacher_subjects ts ON subj.id = ts.subject_id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN students st ON sub.student_id = st.id
      JOIN users u ON st.user_id = u.id
      WHERE t.user_id = ? AND sub.is_marked = FALSE AND a.type = 'written'
      ORDER BY sub.submitted_at DESC
    `, [req.user.id]);

    res.json({
      class_info: classInfo,
      subjects,
      students,
      pending_submissions: pendingSubmissions,
      stats: {
        total_students: students.length,
        total_subjects: subjects.length,
        pending_grading: pendingSubmissions.length
      }
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get submissions for grading
router.get('/submissions', async (req, res) => {
  try {
    const { subject_id, assignment_id } = req.query;

    let query = `
      SELECT sub.id, sub.submitted_at, sub.answers, sub.total_score, sub.is_marked,
             a.title as assignment_title, a.type as assignment_type,
             u.full_name as student_name, subj.name as subject_name
      FROM submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN subjects subj ON a.subject_id = subj.id
      JOIN teacher_subjects ts ON subj.id = ts.subject_id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN students st ON sub.student_id = st.id
      JOIN users u ON st.user_id = u.id
      WHERE t.user_id = ?
    `;

    const params = [req.user.id];

    if (subject_id) {
      query += ' AND subj.id = ?';
      params.push(subject_id);
    }

    if (assignment_id) {
      query += ' AND a.id = ?';
      params.push(assignment_id);
    }

    query += ' ORDER BY sub.submitted_at DESC';

    const submissions = await db.allAsync(query, params);
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Grade a submission
router.put('/submissions/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { total_score, question_marks } = req.body;

    // Update submission
    await db.runAsync(`
      UPDATE submissions 
      SET total_score = ?, is_marked = TRUE 
      WHERE id = ?
    `, [total_score, id]);

    // Insert individual question marks if provided
    if (question_marks && Array.isArray(question_marks)) {
      for (const mark of question_marks) {
        const markId = uuidv4();
        await db.runAsync(`
          INSERT INTO marks (id, submission_id, question_id, obtained_marks)
          VALUES (?, ?, ?, ?)
        `, [markId, id, mark.question_id, mark.obtained_marks]);
      }
    }

    res.json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;