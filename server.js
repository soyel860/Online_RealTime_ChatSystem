const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { insertData, connectDB } = require('./mongo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Multer file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware setup
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ Session configuration (7 days persist)
app.use(session({
  secret: 'chatav_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// Session checker middleware
function sessionChecker(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', sessionChecker, (req, res) => {
  res.redirect('/home');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/home', sessionChecker, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const collection = await connectDB();
    const user = await collection.findOne({ contract: email });

    if (!user) return res.json({ success: false, message: 'User not found!' });
    if (password !== user.password) return res.json({ success: false, message: 'Incorrect password!' });

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.json({ success: true, message: 'Login successful!', redirect: '/Home' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Signup
app.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, contract, password, age, gender } = req.body;
    let imgPath = '';

    if (req.file) {
      imgPath = '/uploads/' + req.file.filename;
    }

    await insertData(name, contract, password, age, gender, imgPath);

    res.json({ success: true, message: 'Account created successfully!', redirect: '/login' });
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
});

// Socket.IO logic
let waitingUser = null;
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  activeUsers.set(socket.id, { partner: null });

  socket.on('find_match', () => {
    if (waitingUser && waitingUser.id !== socket.id) {
      socket.partner = waitingUser;
      waitingUser.partner = socket;

      activeUsers.set(socket.id, { partner: waitingUser.id });
      activeUsers.set(waitingUser.id, { partner: socket.id });

      socket.emit('matched', { partner: waitingUser.id });
      waitingUser.emit('matched', { partner: socket.id });

      waitingUser = null;
    } else {
      waitingUser = socket;
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
    console.log(`User disconnected: ${socket.id}`);
    if (waitingUser === socket) {
      waitingUser = null;
    }

    const userData = activeUsers.get(socket.id);
    if (userData && userData.partner) {
      const partnerSocket = io.sockets.sockets.get(userData.partner);
      if (partnerSocket) {
        partnerSocket.emit('partner_disconnected');
        partnerSocket.partner = null;
      }

      activeUsers.set(userData.partner, { partner: null });
    }

    activeUsers.delete(socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
