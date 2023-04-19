const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('Please provide a user id', 400));
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate('users latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  });

  if (isChat.length > 0) {
    return res.status(200).json({
      status: 'success',
      data: isChat[0],
    });
  } else {
    let ChatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(ChatData);

      const FullChat = await Chat.findById(createdChat._id).populate('users');

      res.status(201).json({
        status: 'success',
        data: FullChat,
      });
    } catch (err) {
      return next(new AppError(err.message, 400));
    }
  }
});

exports.fetchChats = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users')
      .populate('groupAdmin')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async result => {
        result = await User.populate(result, {
          path: 'latestMessage.sender',
          select: 'name pic email',
        });
        res.status(200).json({
          status: 'success',
          data: result,
        });
      });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
});

exports.createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return next(new AppError('Please provide a name and users', 400));
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return next(new AppError('Please provide at least 2 users', 400));
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users')
      .populate('groupAdmin');

    res.status(201).json({
      status: 'success',
      data: fullGroupChat,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
});

exports.renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!updatedChat) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedChat,
  });
});

exports.addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!added) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: added,
  });
});

exports.removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!removed) {
    return next(new AppError('Chat not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: removed,
  });
});
