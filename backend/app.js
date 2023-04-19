const express = require('express');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/users', userRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
 
app.use(globalErrorHandler);

module.exports = app;
