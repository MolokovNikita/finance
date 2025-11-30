const express = require('express');
const router = express.Router();
const { User, Currency } = require('../models');
const { authenticate } = require('../middleware/auth');
const { hashPassword } = require('../utils/password');

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Currency, as: 'defaultCurrency' }]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    const { password, ...updateData } = req.body;

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Currency, as: 'defaultCurrency' }]
    });

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

