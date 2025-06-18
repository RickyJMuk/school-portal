import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create assignment (admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { title, description, class_id, subject_id, type, deadline, questions } = req.body;

    if (!title || !class_id || !subject_id || !type || !deadline) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const assignmentId = uuidv4();
    
    await db.runAsync(`
      INSERT INTO assignments (id, class_id, subject_id, title, description, type, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [assignmentId, class_id, subject_id, title, description, type, deadline]);

    // Add questions if provided
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        const questionId = uuidv4();
        await db.runAsync(`
          INSERT INTO questions (id, assignment_id, question_text, options, correct_option, marks)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          questionId, 
          assignmentId, 
          question.question_text, 
          JSON.stringify(question.options), 
          question.correct_option, 
          question.marks || 1
        ]);
      }
    }

    res.status(201).json({ message: 'Assignment created successfully', assignmentId });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assignment details with questions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await db.getAsync(`
      SELECT a.*, c.name as class_name, s.name as subject_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.id = ?
    `, [id]);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has access to this assignment
    if (req.user.role === 'student') {
      const studentClass = await db.getAsync(
        'SELECT class_id FROM students WHERE user_id = ?', 
        [req.user.id]
      );
      if (!studentClass || studentClass.class_id !== assignment.class_id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      const teacherAccess = await db.getAsync(`
        SELECT 1 FROM teacher_subjects ts
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE t.user_id = ? AND ts.subject_id = ?
      `, [req.user.id, assignment.subject_id]);
      if (!teacherAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Get questions
    const questions = await db.allAsync(`
      SELECT id, question_text, options, marks
      ${req.user.role === 'admin' || req.user.role === 'teacher' ? ', correct_option' : ''}
      FROM questions
      WHERE assignment_id = ?
      ORDER BY id
    `, [id]);

    // Parse options JSON
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }));

    res.json({
      ...assignment,
      questions: parsedQuestions
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit assignment
router.post('/:id/submit', requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Get student info
    const student = await db.getAsync(
      'SELECT id, class_id FROM students WHERE user_id = ?', 
      [req.user.id]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check if assignment exists and belongs to student's class
    const assignment = await db.getAsync(
      'SELECT * FROM assignments WHERE id = ? AND class_id = ?', 
      [id, student.class_id]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = await db.getAsync(
      'SELECT id FROM submissions WHERE student_id = ? AND assignment_id = ?', 
      [student.id, id]
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    let totalScore = 0;
    let isMarked = false;

    // Auto-grade MCQ assignments
    if (assignment.type === 'mcq') {
      const questions = await db.allAsync(
        'SELECT * FROM questions WHERE assignment_id = ?', 
        [id]
      );

      for (const question of questions) {
        const studentAnswer = answers[question.id];
        if (studentAnswer === question.correct_option) {
          totalScore += question.marks;
        }
      }
      isMarked = true;
    }

    const submissionId = uuidv4();
    await db.runAsync(`
      INSERT INTO submissions (id, student_id, assignment_id, answers, total_score, is_marked)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [submissionId, student.id, id, JSON.stringify(answers), totalScore, isMarked]);

    res.json({ 
      message: 'Assignment submitted successfully', 
      score: isMarked ? totalScore : null 
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all assignments (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const assignments = await db.allAsync(`
      SELECT a.*, c.name as class_name, s.name as subject_name,
             COUNT(sub.id) as submission_count
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN submissions sub ON a.id = sub.assignment_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json(assignments);
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
