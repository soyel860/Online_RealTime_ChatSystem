// // const express = require('express');
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const path = require('path');
// // const session = require('express-session');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const { insertData, connectDB } = require('./mongo');

// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server);

// // app.use(cors({ origin: true, credentials: true }));
// // app.use(bodyParser.json());
// // app.use(express.urlencoded({ extended: true }));

// // app.use(session({
// //     secret: 'chatav_secret_key',
// //     resave: false,
// //     saveUninitialized: true,
// //     cookie: { maxAge: 24 * 60 * 60 * 1000 }
// // }));

// // app.use(express.static('public'));

// // function sessionChecker(req, res, next) {
// //     if (req.session.userId) {
// //         next();
// //     } else {
// //         res.redirect('/login');
// //     }
// // }

// // app.get('/', sessionChecker, (req, res) => {
// //     res.redirect('/home');
// // });

// // app.get('/login', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// // });

// // app.get('/signup', (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'signup.html'));
// // });

// // app.get('/home', sessionChecker, (req, res) => {
// //     res.sendFile(path.join(__dirname, 'public', 'home.html'));
// // });

// // app.get('/logout', (req, res) => {
// //     req.session.destroy(err => {
// //         if (err) console.error(err);
// //         res.redirect('/login');
// //     });
// // });

// // app.post('/login', async (req, res) => {
// //     const { email, password } = req.body;
// //     try {
// //         const collection = await connectDB();
// //         const user = await collection.findOne({ contract: email });

// //         if (!user) return res.json({ success: false, message: 'User not found!' });

// //         if (password !== user.password) {
// //             return res.json({ success: false, message: 'Incorrect password!' });
// //         }

// //         req.session.userId = user._id;
// //         req.session.userName = user.name;

// //         res.json({ success: true, message: 'Login successful!', redirect: '/home' });
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ success: false, message: 'Internal Server Error' });
// //     }
// // });

// // app.post('/signup', async (req, res) => {
// //     const { name, contract, password, age, gender, img } = req.body;

// //     try {
// //         await insertData(name, contract, password, age, gender, img);
// //         res.json({ success: true, message: 'Account created successfully!', redirect: '/login' });
// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ success: false, message: 'Internal Server Error' });
// //     }
// // });

// // let waitingUser = null;

// // io.on('connection', (socket) => {
// //     console.log('User connected:', socket.id);

// //     socket.on('find_match', () => {
// //         if (waitingUser) {
// //             socket.partner = waitingUser;
// //             waitingUser.partner = socket;

// //             socket.emit('matched', { partner: waitingUser.id });
// //             waitingUser.emit('matched', { partner: socket.id });

// //             waitingUser = null;
// //         } else {
// //             waitingUser = socket;
// //         }
// //     });

// //     socket.on('chat_message', ({ to, message }) => {
// //         const target = io.sockets.sockets.get(to);
// //         if (target) {
// //             target.emit('chat_message', { from: socket.id, message });
// //         }
// //     });

// //     socket.on('disconnect', () => {
// //         if (waitingUser === socket) {
// //             waitingUser = null;
// //         }

// //         if (socket.partner) {
// //             socket.partner.emit('partner_disconnected');
// //             socket.partner.partner = null;
// //         }

// //         console.log(`User disconnected: ${socket.id}`);
// //     });
// // });

// // const PORT = process.env.PORT || 3000;
// // server.listen(PORT, () => {
// //     console.log(`Server running at http://localhost:${PORT}`);
// // });

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');
// const session = require('express-session');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const fs = require('fs');
// const { insertData, connectDB } = require('./mongo');



// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'public/uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   }
// });

// // app.use(session({
// //     secret: 'chatav_secret_key',
// //     resave: false,
// //     saveUninitialized: true,
// //     cookie: { 
// //         maxAge: 5 * 24 * 60 * 60 * 1000, // 5 দিনের জন্য (মিলিসেকেন্ডে)
// //         httpOnly: true,
// //         secure: false, // HTTPS না থাকলে false রাখুন
// //         sameSite: 'lax' // অথবা 'none' যদি ক্রস-সাইট ইস্যু থাকে
// //     }
// // }));


// // app.use(cors({ origin: true, credentials: true }));
// app.use(cors({ 
//     origin: '*', 
//     credentials: true 
// }));

// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

// app.use(session({
//   secret: 'chatav_secret_key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));

// function sessionChecker(req, res, next) {
//   if (req.session.userId) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }

// app.get('/', sessionChecker, (req, res) => {
//   res.redirect('/home');
// });

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

// app.get('/signup', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'signup.html'));
// });

// app.get('/home', sessionChecker, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'Home.html'));
// });

// app.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) console.error(err);
//     res.redirect('/login');
//   });
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const collection = await connectDB();
//     const user = await collection.findOne({ contract: email });

//     if (!user) return res.json({ success: false, message: 'User not found!' });

//     if (password !== user.password) {
//       return res.json({ success: false, message: 'Incorrect password!' });
//     }

//     req.session.userId = user._id;
//     req.session.userName = user.name;

//     res.json({ success: true, message: 'Login successful!', redirect: '/Home' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });

// app.post('/signup', upload.single('profileImage'), async (req, res) => {
//   try {
//     const { name, contract, password, age, gender } = req.body;
//     let imgPath = '';

//     if (req.file) {
//       imgPath = '/uploads/' + req.file.filename;
//     }

//     await insertData(name, contract, password, age, gender, imgPath);
    
//     res.json({ 
//       success: true, 
//       message: 'Account created successfully!', 
//       redirect: '/login' 
//     });
//   } catch (err) {
//     console.error(err);
//     if (req.file) {
//       fs.unlinkSync(req.file.path);
//     }
//     res.status(500).json({ 
//       success: false, 
//       message: err.message || 'Internal Server Error' 
//     });
//   }
// });

// let waitingUser = null;

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('find_match', () => {
//     if (waitingUser) {
//       socket.partner = waitingUser;
//       waitingUser.partner = socket;

//       socket.emit('matched', { partner: waitingUser.id });
//       waitingUser.emit('matched', { partner: socket.id });

//       waitingUser = null;
//     } else {
//       waitingUser = socket;
//     }
//   });

//   socket.on('chat_message', ({ to, message }) => {
//     const target = io.sockets.sockets.get(to);
//     if (target) {
//       target.emit('chat_message', { from: socket.id, message });
//     }
//   });

//   socket.on('disconnect', () => {
//     if (waitingUser === socket) {
//       waitingUser = null;
//     }

//     if (socket.partner) {
//       socket.partner.emit('partner_disconnected');
//       socket.partner.partner = null;
//     }

//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// const PORT = process.env.PORT || 3000;
// // server.listen(PORT, '0.0.0.0' () => {
// //   console.log(`Server running at http://localhost:${PORT}`);
// // });

// server.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running at http://0.0.0.0:${PORT}`);
// });




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

// File upload configuration
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

// Middleware
app.use(cors({ 
  origin: '*', 
  credentials: true 
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'chatav_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
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

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const collection = await connectDB();
    const user = await collection.findOne({ contract: email });

    if (!user) return res.json({ success: false, message: 'User not found!' });

    if (password !== user.password) {
      return res.json({ success: false, message: 'Incorrect password!' });
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.json({ success: true, message: 'Login successful!', redirect: '/Home' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Signup endpoint
app.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, contract, password, age, gender } = req.body;
    let imgPath = '';

    if (req.file) {
      imgPath = '/uploads/' + req.file.filename;
    }

    await insertData(name, contract, password, age, gender, imgPath);
    
    res.json({ 
      success: true, 
      message: 'Account created successfully!', 
      redirect: '/login' 
    });
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Internal Server Error' 
    });
  }
});

// Socket.IO Logic
let waitingUser = null;
const activeUsers = new Map(); // To track active users and their partners

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  activeUsers.set(socket.id, { partner: null });

  // Match finding logic
  socket.on('find_match', () => {
    if (waitingUser && waitingUser.id !== socket.id) {
      // Pair the users
      socket.partner = waitingUser;
      waitingUser.partner = socket;
      
      // Update activeUsers map
      activeUsers.set(socket.id, { partner: waitingUser.id });
      activeUsers.set(waitingUser.id, { partner: socket.id });

      // Notify both users
      socket.emit('matched', { partner: waitingUser.id });
      waitingUser.emit('matched', { partner: socket.id });

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  // Chat message handling
  socket.on('chat_message', ({ to, message }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('chat_message', { from: socket.id, message });
    }
  });

  // Typing indicator logic
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

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Clean up waiting user
    if (waitingUser === socket) {
      waitingUser = null;
    }

    // Notify partner if exists
    const userData = activeUsers.get(socket.id);
    if (userData && userData.partner) {
      const partnerSocket = io.sockets.sockets.get(userData.partner);
      if (partnerSocket) {
        partnerSocket.emit('partner_disconnected');
        partnerSocket.partner = null;
      }
      
      // Update partner's entry in activeUsers
      activeUsers.set(userData.partner, { partner: null });
    }

    // Remove from active users
    activeUsers.delete(socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});