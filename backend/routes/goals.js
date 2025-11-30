const express = require('express');
const router = express.Router();
const { FinancialGoal, Account, Currency, GoalContribution } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const goals = await FinancialGoal.findAll({
      where: { userId: req.userId },
      include: [
        { model: Account },
        { model: Currency }
      ],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { goals }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validate(schemas.goal), async (req, res, next) => {
  try {
    const goal = await FinancialGoal.create({
      ...req.body,
      userId: req.userId
    });

    const goalWithRelations = await FinancialGoal.findByPk(goal.id, {
      include: [
        { model: Account },
        { model: Currency }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Цель успешно создана',
      data: { goal: goalWithRelations }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const goal = await FinancialGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        { model: Account },
        { model: Currency },
        { model: GoalContribution, order: [['contributionDate', 'DESC']] }
      ]
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Цель не найдена'
      });
    }

    res.json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(schemas.goal), async (req, res, next) => {
  try {
    const goal = await FinancialGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Цель не найдена'
      });
    }

    await goal.update(req.body);

    const updatedGoal = await FinancialGoal.findByPk(goal.id, {
      include: [
        { model: Account },
        { model: Currency }
      ]
    });

    res.json({
      success: true,
      message: 'Цель успешно обновлена',
      data: { goal: updatedGoal }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const goal = await FinancialGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Цель не найдена'
      });
    }

    await goal.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

