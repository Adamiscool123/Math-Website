require('dotenv').config();
const { pool } = require('./db');

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running database migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(50) NOT NULL,
        topic_id VARCHAR(100) NOT NULL,
        learn_completed BOOLEAN DEFAULT FALSE,
        practice_attempts INTEGER DEFAULT 0,
        practice_best_score FLOAT DEFAULT 0,
        test_attempts INTEGER DEFAULT 0,
        test_best_score FLOAT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, course_id, topic_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(50) NOT NULL,
        topic_id VARCHAR(100) NOT NULL,
        score FLOAT NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_taken INTEGER,
        skill_breakdown JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS practice_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(50) NOT NULL,
        topic_id VARCHAR(100) NOT NULL,
        difficulty VARCHAR(10) NOT NULL,
        score FLOAT NOT NULL,
        questions_attempted INTEGER NOT NULL,
        questions_correct INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Migration complete! All tables created.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
