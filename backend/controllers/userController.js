const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: {
              $regex: req.query.search,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: req.query.search,
              $options: 'i',
            },
          },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      data: users,
    },
  });
});
