const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./models/db');

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Server-Sent Events for real-time task updates
app.get('/api/tasks/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  const connectionMessage = { type: 'connected', message: 'SSE connection established' };
  res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);

  // Store the response object to send updates later
  if (!global.sseClients) {
    global.sseClients = [];
  }
  global.sseClients.push(res);

  // Remove client when connection closes
  req.on('close', () => {
    const index = global.sseClients.indexOf(res);
    if (index > -1) {
      global.sseClients.splice(index, 1);
    }
  });
});

// Helper function to broadcast task updates to all connected clients
global.broadcastTaskUpdate = (updateData) => {
  if (global.sseClients) {
    global.sseClients.forEach((client, index) => {
      try {
        client.write(`data: ${JSON.stringify(updateData)}\n\n`);
      } catch (error) {
        console.error(`Failed to send update to client ${index}:`, error);
      }
    });
  }
};

// Register your API routes here!
const employeeRoutes = require('./routes/employee');
app.use('/api/employees', employeeRoutes);

const hrPolicyRoutes = require('./routes/hrPolicy');
app.use('/api/hr-policies', hrPolicyRoutes);

const taskRoutes = require('./routes/task');
app.use('/api/tasks', taskRoutes);

const hrRoutes = require('./routes/hr');
app.use('/api/hr', hrRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// Remove db.sync() and start server after MongoDB connection
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
