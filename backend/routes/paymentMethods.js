const express = require('express');
const router = express.Router();
const { PaymentMethod } = require('../models');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.findAll({
      where: {
        [Op.or]: [
          { userId: req.userId },
          { isSystem: true }
        ]
      },
      order: [['isSystem', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { paymentMethods }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.create({
      ...req.body,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Способ оплаты успешно создан',
      data: { paymentMethod }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
        isSystem: false
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Способ оплаты не найден или это системный способ'
      });
    }

    await paymentMethod.update(req.body);

    res.json({
      success: true,
      message: 'Способ оплаты успешно обновлен',
      data: { paymentMethod }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
        isSystem: false
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Способ оплаты не найден или это системный способ'
      });
    }

    await paymentMethod.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

