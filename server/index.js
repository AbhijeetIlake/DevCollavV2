import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import snippetRoutes from './routes/snippets.js';
import workspaceRoutes from './routes/workspaces.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/snippets', snippetRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/dashboard', dashboardRoutes);

const workspaceUsers = new Map();
const workspaceContent = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-workspace', ({ workspaceId, userId, username }) => {
    socket.join(workspaceId);

    if (!workspaceUsers.has(workspaceId)) {
      workspaceUsers.set(workspaceId, new Map());
    }

    workspaceUsers.get(workspaceId).set(socket.id, { userId, username });

    const users = Array.from(workspaceUsers.get(workspaceId).values());
    io.to(workspaceId).emit('users-update', users);

    if (workspaceContent.has(workspaceId)) {
      socket.emit('content-update', workspaceContent.get(workspaceId));
    }

    console.log(`User ${username} joined workspace ${workspaceId}`);
  });

  socket.on('code-change', ({ workspaceId, content }) => {
    workspaceContent.set(workspaceId, content);
    socket.to(workspaceId).emit('content-update', content);
  });

  socket.on('cursor-move', ({ workspaceId, position, userId }) => {
    socket.to(workspaceId).emit('cursor-update', { position, userId });
  });

  socket.on('leave-workspace', ({ workspaceId }) => {
    if (workspaceUsers.has(workspaceId)) {
      workspaceUsers.get(workspaceId).delete(socket.id);
      const users = Array.from(workspaceUsers.get(workspaceId).values());
      io.to(workspaceId).emit('users-update', users);
    }
    socket.leave(workspaceId);
  });

  socket.on('disconnect', () => {
    workspaceUsers.forEach((users, workspaceId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        const remainingUsers = Array.from(users.values());
        io.to(workspaceId).emit('users-update', remainingUsers);
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
