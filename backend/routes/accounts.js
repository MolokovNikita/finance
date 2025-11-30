const express = require('express');
const router = express.Router();
const { Account, Currency } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Получить список счетов
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      where: { userId: req.userId },
      include: [{ model: Currency }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { accounts }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Создать новый счет
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, validate(schemas.account), async (req, res, next) => {
  try {
    const accountData = {
      ...req.body,
      userId: req.userId,
      initialBalance: parseFloat(req.body.initialBalance) || 0,
      currentBalance: parseFloat(req.body.initialBalance) || 0,
      icon: req.body.icon || null,
      notes: req.body.notes || null
    };

    const account = await Account.create(accountData, {
      include: [{ model: Currency }]
    });

    const accountWithCurrency = await Account.findByPk(account.id, {
      include: [{ model: Currency }]
    });

    res.status(201).json({
      success: true,
      message: 'Счет успешно создан',
      data: { account: accountWithCurrency }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Получить счет по ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [{ model: Currency }]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    res.json({
      success: true,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Обновить счет
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, validate(schemas.account), async (req, res, next) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    await account.update(req.body);

    const updatedAccount = await Account.findByPk(account.id, {
      include: [{ model: Currency }]
    });

    res.json({
      success: true,
      message: 'Счет успешно обновлен',
      data: { account: updatedAccount }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Удалить счет
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    await account.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

