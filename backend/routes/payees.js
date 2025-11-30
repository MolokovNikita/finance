const express = require('express');
const router = express.Router();
const { Payee, Category } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const payees = await Payee.findAll({
      where: { userId: req.userId },
      include: [{ model: Category, as: 'defaultCategory' }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { payees }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const payee = await Payee.create({
      ...req.body,
      userId: req.userId
    });

    const payeeWithCategory = await Payee.findByPk(payee.id, {
      include: [{ model: Category, as: 'defaultCategory' }]
    });

    res.status(201).json({
      success: true,
      message: 'Получатель успешно создан',
      data: { payee: payeeWithCategory }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const payee = await Payee.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!payee) {
      return res.status(404).json({
        success: false,
        message: 'Получатель не найден'
      });
    }

    await payee.update(req.body);

    const updatedPayee = await Payee.findByPk(payee.id, {
      include: [{ model: Category, as: 'defaultCategory' }]
    });

    res.json({
      success: true,
      message: 'Получатель успешно обновлен',
      data: { payee: updatedPayee }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const payee = await Payee.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!payee) {
      return res.status(404).json({
        success: false,
        message: 'Получатель не найден'
      });
    }

    await payee.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

