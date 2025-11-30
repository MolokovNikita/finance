const express = require('express');
const router = express.Router();
const { UserSetting } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    let settings = await UserSetting.findOne({
      where: { userId: req.userId }
    });

    if (!settings) {
      settings = await UserSetting.create({
        userId: req.userId
      });
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/', authenticate, async (req, res, next) => {
  try {
    let settings = await UserSetting.findOne({
      where: { userId: req.userId }
    });

    if (!settings) {
      settings = await UserSetting.create({
        userId: req.userId,
        ...req.body
      });
    } else {
      await settings.update(req.body);
    }

    res.json({
      success: true,
      message: 'Настройки успешно обновлены',
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

