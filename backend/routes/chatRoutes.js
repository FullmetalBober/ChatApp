const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(chatController.fetchChats)
  .post(chatController.accessChat);

router.route('/group').post(chatController.createGroupChat);
router.route('/rename').put(chatController.renameGroup);
router.route('/group-add').put(chatController.addToGroup);
router.route('/group-remove').put(chatController.removeFromGroup);

module.exports = router;
