import geckos, { iceServers } from '@geckos.io/server';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;

// Generate random but readable names for users
const adjectives = [
  'Happy', 'Bright', 'Swift', 'Clever', 'Bold', 'Kind', 'Wise', 'Brave',
  'Calm', 'Eager', 'Gentle', 'Lively', 'Proud', 'Silent', 'Witty', 'Zesty',
  'Amber', 'Azure', 'Coral', 'Emerald', 'Golden', 'Ivory', 'Jade', 'Ruby'
];

const nouns = [
  'Tiger', 'Eagle', 'Wolf', 'Lion', 'Fox', 'Bear', 'Hawk', 'Falcon',
  'Dolphin', 'Whale', 'Shark', 'Panda', 'Koala', 'Owl', 'Raven', 'Swan',
  'Phoenix', 'Dragon', 'Griffin', 'Unicorn', 'Pegasus', 'Knight', 'Wizard', 'Mage'
];

function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
}

// Store user names by channel ID
const userNames = new Map<string, string>();
// Store connected users for the user list
const connectedUsers = new Map<string, { id: string; name: string; connectedAt: string }>();

// Function to broadcast user list to all connected clients
function broadcastUserList() {
  const userList = Array.from(connectedUsers.values());
  io.room().emit('user list', userList);
}

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
  // Generate a random name for the user
  const userName = generateRandomName();
  const channelId = channel.id || 'unknown';
  userNames.set(channelId, userName);
  
  // Add user to connected users list
  connectedUsers.set(channelId, {
    id: channelId,
    name: userName,
    connectedAt: new Date().toISOString()
  });
  
  console.log(`User ${userName} (${channelId}) connected`);
  
  // Broadcast updated user list to all clients
  broadcastUserList();
  
  channel.onDisconnect(() => {
    const name = userNames.get(channelId) || channelId;
    console.log(`${name} (${channelId}) got disconnected`);
    userNames.delete(channelId);
    connectedUsers.delete(channelId);
    
    // Broadcast updated user list to all clients
    broadcastUserList();
  });

  // Send welcome message with the user's name
  channel.emit('chat message', `Welcome to the chat ${userName}!`);

  channel.on('chat message', (data) => {
    const name = userNames.get(channelId) || channelId;
    console.log(`Message from ${name} (${channelId}):`, data);
    channel.room.emit('chat message', {
      id: channelId,
      name: name,
      message: data,
      timestamp: new Date().toISOString(),
    });
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/`);
});
