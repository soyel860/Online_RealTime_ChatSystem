const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static('public'));

app.post('/set-session', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Invalid name' });
  req.session.userName = name;
  res.status(200).json({ message: 'Session set' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/home', (req, res) => {
  if (!req.session.userName) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/term', (req, res)=>{
  req.sendFile(path.join(__dirname, 'public', 'term.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dev.html'));
});

let waitingUser = null;
const activeUsers = new Map();

io.on('connection', socket => {
  activeUsers.set(socket.id, { partner: null, name: null, img: null });

  socket.on('find_match', () => {
    if (waitingUser && waitingUser.id !== socket.id) {
      socket.partner = waitingUser;
      waitingUser.partner = socket;

      activeUsers.get(socket.id).partner = waitingUser.id;
      activeUsers.get(waitingUser.id).partner = socket.id;

      socket.emit('matched', { partner: waitingUser.id });
      waitingUser.emit('matched', { partner: socket.id });

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  socket.on('send_name', ({ name, img }) => {
    const userData = activeUsers.get(socket.id);
    if (userData) {
      userData.name = name;
      userData.img = img;
      activeUsers.set(socket.id, userData);

      const partnerId = userData.partner;
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit('receive_partner_name', { name });
          if (img) partnerSocket.emit('receive_partner_img', { img });
        }
      }
    }
  });

  socket.on('chat_message', ({ to, message }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('chat_message', { from: socket.id, message });
    }
  });

  socket.on('typing', ({ to }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('typing_status', { from: socket.id });
    }
  });

  socket.on('stop_typing', ({ to }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('stop_typing_status', { from: socket.id });
    }
  });

  socket.on('disconnect', () => {
    if (waitingUser === socket) {
      waitingUser = null;
    }

    const userData = activeUsers.get(socket.id);
    if (userData?.partner) {
      const partnerSocket = io.sockets.sockets.get(userData.partner);
      if (partnerSocket) {
        partnerSocket.emit('partner_disconnected');
        activeUsers.set(userData.partner, {
          ...activeUsers.get(userData.partner),
          partner: null
        });
      }
    }

    activeUsers.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
