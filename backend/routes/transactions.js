const express = require('express');
const router = express.Router();
const { Transaction, Account, Category, Payee, PaymentMethod, Currency, Tag, TransactionTag } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Получить список транзакций
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      accountId,
      categoryId,
      transactionType,
      search
    } = req.query;

    const where = { userId: req.userId };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = startDate;
      if (endDate) where.transactionDate[Op.lte] = endDate;
    }

    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;
    if (transactionType) where.transactionType = transactionType;

    if (search) {
      where[Op.or] = [
        { description: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Account, include: [{ model: Currency }] },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [['transactionDate', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Создать новую транзакцию
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, validate(schemas.transaction), async (req, res, next) => {
  try {
    const { tagIds, ...transactionData } = req.body;

    // Get account to determine currency
    const account = await Account.findByPk(transactionData.accountId);
    if (!account || account.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        message: 'Счет не найден'
      });
    }

    // Calculate amount in account currency
    const exchangeRate = transactionData.exchangeRate || 1;
    const amountInAccountCurrency = transactionData.amount * exchangeRate;

    const transaction = await Transaction.create({
      ...transactionData,
      userId: req.userId,
      amountInAccountCurrency,
      currencyId: transactionData.currencyId || account.currencyId
    });

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await transaction.setTags(tagIds);
    }

    const transactionWithRelations = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Account, include: [{ model: Currency }] },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency },
        { model: Tag, through: { attributes: [] } }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Транзакция успешно создана',
      data: { transaction: transactionWithRelations }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Получить транзакцию по ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        { model: Account, include: [{ model: Currency }] },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency },
        { model: Tag, through: { attributes: [] } }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Транзакция не найдена'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Обновить транзакцию
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, validate(schemas.transaction), async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Транзакция не найдена'
      });
    }

    const { tagIds, ...transactionData } = req.body;

    // Recalculate amount in account currency if needed
    if (transactionData.amount || transactionData.exchangeRate) {
      const account = await Account.findByPk(transactionData.accountId || transaction.accountId);
      const exchangeRate = transactionData.exchangeRate || transaction.exchangeRate || 1;
      transactionData.amountInAccountCurrency = transactionData.amount * exchangeRate;
    }

    await transaction.update(transactionData);

    // Update tags
    if (tagIds) {
      await transaction.setTags(tagIds);
    }

    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Account, include: [{ model: Currency }] },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency },
        { model: Tag, through: { attributes: [] } }
      ]
    });

    res.json({
      success: true,
      message: 'Транзакция успешно обновлена',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Удалить транзакцию
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Транзакция не найдена'
      });
    }

    await transaction.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

