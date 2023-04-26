const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.on('connection', socket => {
  socket.on('setup', userData => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', room => {
    socket.join(room);
  });

  socket.on('typing', room => {
    socket.in(room).emit('typing');
    setTimeout(() => {
      socket.in(room).emit('stop typing');
    }, 3000);
  });

  socket.on('new message', newMessageReceived => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log('Chat.users not defined!');

    chat.users.forEach(user => {
      if (user._id == newMessageReceived.sender._id) return;
      io.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.off('setup', userData => {
    socket.leave(userData._id);
  });
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
