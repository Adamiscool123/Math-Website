require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { router: authRouter } = require('./routes/auth');
const progressRouter = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));
app.get('/auth', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'auth.html')));
app.get('/courses', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'courses.html')));
app.get('/course', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'course.html')));
app.get('/topic', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'topic.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 Matheye running at http://localhost:${PORT}\n`);
});
