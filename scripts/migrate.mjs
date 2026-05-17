import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        revoked_at TIMESTAMP
      )
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
      )
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
      )
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
      )
    `);

    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS learn_completed BOOLEAN DEFAULT FALSE");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS practice_attempts INTEGER DEFAULT 0");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS practice_best_score FLOAT DEFAULT 0");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS test_attempts INTEGER DEFAULT 0");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS test_best_score FLOAT DEFAULT 0");
    await client.query("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW()");

    await client.query("CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash)");
    await client.query("CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)");
    await client.query("CREATE INDEX IF NOT EXISTS progress_user_course_idx ON user_progress(user_id, course_id)");
    await client.query("CREATE INDEX IF NOT EXISTS practice_user_topic_idx ON practice_sessions(user_id, course_id, topic_id)");
    await client.query("CREATE INDEX IF NOT EXISTS tests_user_topic_idx ON test_results(user_id, course_id, topic_id)");

    await client.query("COMMIT");
    console.log("Matheye migration complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
