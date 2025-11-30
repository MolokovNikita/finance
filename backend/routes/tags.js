const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      where: { userId: req.userId },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const tag = await Tag.create({
      name,
      color,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Тег успешно создан',
      data: { tag }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Тег с таким именем уже существует'
      });
    }
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Тег не найден'
      });
    }

    await tag.update(req.body);

    res.json({
      success: true,
      message: 'Тег успешно обновлен',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Тег не найден'
      });
    }

    await tag.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

