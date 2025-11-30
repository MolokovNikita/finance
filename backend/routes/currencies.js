const express = require('express');
const router = express.Router();
const { Currency, ExchangeRate } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const currencies = await Currency.findAll({
      where: { isActive: true },
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: { currencies }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/rates', authenticate, async (req, res, next) => {
  try {
    const { fromCurrencyId, toCurrencyId, date } = req.query;

    const where = {};
    if (fromCurrencyId) where.fromCurrencyId = fromCurrencyId;
    if (toCurrencyId) where.toCurrencyId = toCurrencyId;
    if (date) where.date = date;

    const rates = await ExchangeRate.findAll({
      where,
      include: [
        { model: Currency, as: 'fromCurrency' },
        { model: Currency, as: 'toCurrency' }
      ],
      order: [['date', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: { rates }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

