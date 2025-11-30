const express = require('express');
const router = express.Router();
const { Budget, Category, Currency, Account, BudgetAccount } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { Transaction } = require('../models');
    const { Op } = require('sequelize');
    
    const budgets = await Budget.findAll({
      where: { userId: req.userId },
      include: [
        { model: Category },
        { model: Currency },
        { model: Account, through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Рассчитываем потраченную сумму для каждого бюджета
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const budgetData = budget.toJSON();
        
        // Определяем период для расчета
        const now = new Date();
        let startDate = new Date(budget.startDate);
        let endDate = budget.endDate ? new Date(budget.endDate) : now;
        
        // Если период истек, используем даты бюджета
        if (endDate > now) {
          endDate = now;
        }
        
        // Если бюджет по категории, фильтруем по категории
        // Если по счетам, фильтруем по счетам
        const where = {
          userId: req.userId,
          transactionType: 'expense',
          transactionDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          },
          isExcludedFromStats: false
        };
        
        if (budget.categoryId) {
          where.categoryId = budget.categoryId;
        }
        
        // Если бюджет привязан к счетам, фильтруем по ним
        if (budget.Accounts && budget.Accounts.length > 0) {
          where.accountId = {
            [Op.in]: budget.Accounts.map(acc => acc.id)
          };
        }
        
        const transactions = await Transaction.findAll({
          where,
          attributes: ['amountInAccountCurrency', 'currencyId']
        });
        
        // Суммируем расходы (пока без конвертации валют)
        let spent = 0;
        transactions.forEach(t => {
          // Если валюта транзакции совпадает с валютой бюджета, просто суммируем
          if (t.currencyId === budget.currencyId) {
            spent += parseFloat(t.amountInAccountCurrency || 0);
          } else {
            // TODO: добавить конвертацию валют через exchange_rates
            spent += parseFloat(t.amountInAccountCurrency || 0);
          }
        });
        
        budgetData.spent = spent;
        budgetData.percentage = budget.amount > 0 ? (spent / parseFloat(budget.amount)) * 100 : 0;
        
        return budgetData;
      })
    );

    res.json({
      success: true,
      data: { budgets: budgetsWithSpent }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validate(schemas.budget), async (req, res, next) => {
  try {
    const { accountIds, ...budgetData } = req.body;

    const budget = await Budget.create({
      ...budgetData,
      userId: req.userId
    });

    if (accountIds && accountIds.length > 0) {
      await budget.setAccounts(accountIds);
    }

    const budgetWithRelations = await Budget.findByPk(budget.id, {
      include: [
        { model: Category },
        { model: Currency },
        { model: Account, through: { attributes: [] } }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Бюджет успешно создан',
      data: { budget: budgetWithRelations }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        { model: Category },
        { model: Currency },
        { model: Account, through: { attributes: [] } }
      ]
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Бюджет не найден'
      });
    }

    res.json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(schemas.budget), async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Бюджет не найден'
      });
    }

    const { accountIds, ...budgetData } = req.body;
    await budget.update(budgetData);

    if (accountIds) {
      await budget.setAccounts(accountIds);
    }

    const updatedBudget = await Budget.findByPk(budget.id, {
      include: [
        { model: Category },
        { model: Currency },
        { model: Account, through: { attributes: [] } }
      ]
    });

    res.json({
      success: true,
      message: 'Бюджет успешно обновлен',
      data: { budget: updatedBudget }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Бюджет не найден'
      });
    }

    await budget.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

