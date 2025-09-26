import geckos, { iceServers } from '@geckos.io/server';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const app = express();

// Trust proxy for reverse proxy deployments
app.set('trust proxy', true);

const server = http.createServer(app);

const io = geckos({
  iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
  portRange: {
    min: process.env.PORT_RANGE_MIN ? parseInt(process.env.PORT_RANGE_MIN) : 10000,
    max: process.env.PORT_RANGE_MAX ? parseInt(process.env.PORT_RANGE_MAX) : 10007,
  },
  cors: { 
    origin: "*"
  },
});

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../dist/client')));

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.addServer(server);

io.onConnection((channel) => {
  console.log(`User ${channel.id} connected`);
  
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`);
  });

  channel.emit('chat message', `Welcome to the chat ${channel.id}!`);

  channel.on('chat message', (data) => {
    console.log(`Message from ${channel.id}:`, data);
    channel.room.emit('chat message', {
      id: channel.id,
      message: data,
      timestamp: new Date().toISOString(),
    });
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/`);
});
