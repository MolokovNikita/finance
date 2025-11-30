const express = require('express');
const router = express.Router();
const { RecurringTransaction, Account, Category, Payee, PaymentMethod, Currency } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const recurringTransactions = await RecurringTransaction.findAll({
      where: { userId: req.userId },
      include: [
        { model: Account },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency }
      ],
      order: [['nextDueDate', 'ASC']]
    });

    res.json({
      success: true,
      data: { recurringTransactions }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.create({
      ...req.body,
      userId: req.userId
    });

    const transactionWithRelations = await RecurringTransaction.findByPk(recurringTransaction.id, {
      include: [
        { model: Account },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Регулярная транзакция успешно создана',
      data: { recurringTransaction: transactionWithRelations }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Регулярная транзакция не найдена'
      });
    }

    await recurringTransaction.update(req.body);

    const updatedTransaction = await RecurringTransaction.findByPk(recurringTransaction.id, {
      include: [
        { model: Account },
        { model: Category },
        { model: Payee },
        { model: PaymentMethod },
        { model: Currency }
      ]
    });

    res.json({
      success: true,
      message: 'Регулярная транзакция успешно обновлена',
      data: { recurringTransaction: updatedTransaction }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const recurringTransaction = await RecurringTransaction.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!recurringTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Регулярная транзакция не найдена'
      });
    }

    await recurringTransaction.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

