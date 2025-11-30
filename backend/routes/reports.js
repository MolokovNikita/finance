const express = require('express');
const router = express.Router();
const { Transaction, SavedReport } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/statistics', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate, accountId } = req.query;

    const where = {
      userId: req.userId,
      isExcludedFromStats: false
    };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = startDate;
      if (endDate) where.transactionDate[Op.lte] = endDate;
    }

    if (accountId) where.accountId = accountId;

    const transactions = await Transaction.findAll({
      where,
      attributes: ['transactionType', 'amountInAccountCurrency']
    });

    const income = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amountInAccountCurrency), 0);

    const expense = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amountInAccountCurrency), 0);

    res.json({
      success: true,
      data: {
        income,
        expense,
        balance: income - expense
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/saved', authenticate, async (req, res, next) => {
  try {
    const reports = await SavedReport.findAll({
      where: { userId: req.userId },
      order: [['isFavorite', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/saved', authenticate, async (req, res, next) => {
  try {
    const report = await SavedReport.create({
      ...req.body,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Отчет успешно сохранен',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/saved/:id', authenticate, async (req, res, next) => {
  try {
    const report = await SavedReport.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Отчет не найден'
      });
    }

    await report.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

