import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './config/database.js';
import User from './models/User.js';
import Task from './models/Task.js';

dotenv.config();

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Initialize admin user
(async () => {
  try {
    await User.createAdmin();
    console.log('Admin user initialized');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
})();

// Auth routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        points: user.points
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Protected routes
app.post('/api/family-members', authenticateToken, async (req, res) => {
  try {
    const { username, password, name, avatar } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员可以添加家庭成员' });
    }
    
    const userId = await User.createFamilyMember(username, password, name, avatar);
    res.status(201).json({ id: userId });
  } catch (error) {
    console.error('Create family member error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.getByUser(req.user.id);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const task = { ...req.body, createdBy: req.user.id };
    const taskId = await Task.create(task);
    res.status(201).json({ id: taskId });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
  try {
    await Task.complete(req.params.id, req.user.id);
    const points = await User.getPoints(req.user.id);
    res.json({ points });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});