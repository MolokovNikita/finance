const express = require('express');
const router = express.Router();
const { Category, CategoryType } = require('../models');
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { categoryTypeId, includeSystem = false } = req.query;
    const where = {};

    if (!includeSystem) {
      where[Op.or] = [
        { userId: req.userId },
        { isSystem: true }
      ];
    } else {
      where.userId = req.userId;
    }

    if (categoryTypeId) {
      where.categoryTypeId = categoryTypeId;
    }

    const categories = await Category.findAll({
      where,
      include: [
        { model: CategoryType },
        { model: Category, as: 'parentCategory' },
        { model: Category, as: 'subcategories' }
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, validate(schemas.category), async (req, res, next) => {
  try {
    const category = await Category.create({
      ...req.body,
      userId: req.userId
    });

    const categoryWithRelations = await Category.findByPk(category.id, {
      include: [
        { model: CategoryType },
        { model: Category, as: 'parentCategory' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      data: { category: categoryWithRelations }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId: req.userId },
          { isSystem: true }
        ]
      },
      include: [
        { model: CategoryType },
        { model: Category, as: 'parentCategory' },
        { model: Category, as: 'subcategories' }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(schemas.category), async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
        isSystem: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена или это системная категория'
      });
    }

    await category.update(req.body);

    const updatedCategory = await Category.findByPk(category.id, {
      include: [
        { model: CategoryType },
        { model: Category, as: 'parentCategory' }
      ]
    });

    res.json({
      success: true,
      message: 'Категория успешно обновлена',
      data: { category: updatedCategory }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
        isSystem: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена или это системная категория'
      });
    }

    await category.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

