const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('./auth');
const router = express.Router();

// GET /api/progress/:courseId  — all topic progress for a course
router.get('/:courseId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_progress WHERE user_id=$1 AND course_id=$2',
      [req.user.userId, req.params.courseId]
    );
    const progressMap = {};
    result.rows.forEach(r => { progressMap[r.topic_id] = r; });
    res.json({ progress: progressMap });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/progress/:courseId/:topicId/learn  — mark learn complete
router.post('/:courseId/:topicId/learn', authenticate, async (req, res) => {
  const { courseId, topicId } = req.params;
  try {
    await pool.query(`
      INSERT INTO user_progress (user_id, course_id, topic_id, learn_completed, last_updated)
      VALUES ($1,$2,$3,true,NOW())
      ON CONFLICT (user_id, course_id, topic_id)
      DO UPDATE SET learn_completed=true, last_updated=NOW()
    `, [req.user.userId, courseId, topicId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/progress/:courseId/:topicId/practice  — save practice session
router.post('/:courseId/:topicId/practice', authenticate, async (req, res) => {
  const { courseId, topicId } = req.params;
  const { difficulty, score, questionsAttempted, questionsCorrect } = req.body;
  try {
    await pool.query(`
      INSERT INTO practice_sessions (user_id, course_id, topic_id, difficulty, score, questions_attempted, questions_correct)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [req.user.userId, courseId, topicId, difficulty, score, questionsAttempted, questionsCorrect]);

    // Update best score
    await pool.query(`
      INSERT INTO user_progress (user_id, course_id, topic_id, practice_attempts, practice_best_score, last_updated)
      VALUES ($1,$2,$3,1,$4,NOW())
      ON CONFLICT (user_id, course_id, topic_id)
      DO UPDATE SET
        practice_attempts = user_progress.practice_attempts + 1,
        practice_best_score = GREATEST(user_progress.practice_best_score, $4),
        last_updated = NOW()
    `, [req.user.userId, courseId, topicId, score]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/progress/:courseId/:topicId/test  — save test result
router.post('/:courseId/:topicId/test', authenticate, async (req, res) => {
  const { courseId, topicId } = req.params;
  const { score, totalQuestions, correctAnswers, timeTaken, skillBreakdown } = req.body;
  try {
    await pool.query(`
      INSERT INTO test_results (user_id, course_id, topic_id, score, total_questions, correct_answers, time_taken, skill_breakdown)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, [req.user.userId, courseId, topicId, score, totalQuestions, correctAnswers, timeTaken, JSON.stringify(skillBreakdown)]);

    await pool.query(`
      INSERT INTO user_progress (user_id, course_id, topic_id, test_attempts, test_best_score, last_updated)
      VALUES ($1,$2,$3,1,$4,NOW())
      ON CONFLICT (user_id, course_id, topic_id)
      DO UPDATE SET
        test_attempts = user_progress.test_attempts + 1,
        test_best_score = GREATEST(user_progress.test_best_score, $4),
        last_updated = NOW()
    `, [req.user.userId, courseId, topicId, score]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/progress/:courseId/:topicId/history  — test history for a topic
router.get('/:courseId/:topicId/history', authenticate, async (req, res) => {
  const { courseId, topicId } = req.params;
  try {
    const tests = await pool.query(
      'SELECT * FROM test_results WHERE user_id=$1 AND course_id=$2 AND topic_id=$3 ORDER BY created_at DESC LIMIT 10',
      [req.user.userId, courseId, topicId]
    );
    const practice = await pool.query(
      'SELECT * FROM practice_sessions WHERE user_id=$1 AND course_id=$2 AND topic_id=$3 ORDER BY created_at DESC LIMIT 10',
      [req.user.userId, courseId, topicId]
    );
    res.json({ tests: tests.rows, practice: practice.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
