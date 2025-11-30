const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    // Преобразуем пустые строки в null для опциональных полей и строки-числа в числа
    const cleanedBody = { ...req.body };
    Object.keys(cleanedBody).forEach(key => {
      if (cleanedBody[key] === '') {
        cleanedBody[key] = null;
      } else if (key === 'initialBalance' && typeof cleanedBody[key] === 'string') {
        cleanedBody[key] = parseFloat(cleanedBody[key]) || 0;
      } else if (['amount', 'targetAmount', 'currentAmount'].includes(key) && typeof cleanedBody[key] === 'string') {
        cleanedBody[key] = parseFloat(cleanedBody[key]);
      }
    });

    const { error, value } = schema.validate(cleanedBody, {
      abortEarly: false,
      stripUnknown: true,
      convert: true // Автоматическое преобразование типов
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(100),
    lastName: Joi.string().max(100)
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  account: Joi.object({
    name: Joi.string().required().max(255),
    accountType: Joi.string().required(),
    currencyId: Joi.number().integer().required(),
    initialBalance: Joi.alternatives().try(
      Joi.number(),
      Joi.string().pattern(/^\d+(\.\d+)?$/).empty('')
    ).default(0),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null).empty(''),
    icon: Joi.string().max(50).allow('', null).empty(''),
    isActive: Joi.boolean().default(true),
    isIncludedInTotal: Joi.boolean().default(true),
    notes: Joi.string().allow('', null).empty('')
  }),

  transaction: Joi.object({
    accountId: Joi.number().integer().required(),
    categoryId: Joi.number().integer().allow(null),
    payeeId: Joi.number().integer().allow(null),
    paymentMethodId: Joi.number().integer().allow(null),
    transactionType: Joi.string().valid('income', 'expense', 'transfer').required(),
    amount: Joi.number().positive().required(),
    currencyId: Joi.number().integer().required(),
    exchangeRate: Joi.number().positive().default(1),
    transactionDate: Joi.date().required(),
    description: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    location: Joi.string().max(255).allow('', null),
    isExcludedFromStats: Joi.boolean().default(false),
    tagIds: Joi.array().items(Joi.number().integer())
  }),

  category: Joi.object({
    name: Joi.string().required().max(255),
    parentCategoryId: Joi.number().integer().allow(null),
    categoryTypeId: Joi.number().integer().required(),
    icon: Joi.string().max(50).allow('', null),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('', null),
    isActive: Joi.boolean().default(true),
    sortOrder: Joi.number().integer().default(0)
  }),

  budget: Joi.object({
    categoryId: Joi.number().integer().allow(null),
    name: Joi.string().required().max(255),
    amount: Joi.number().positive().required(),
    currencyId: Joi.number().integer().required(),
    periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    rolloverUnused: Joi.boolean().default(false),
    alertThreshold: Joi.number().min(0).max(100).default(80),
    isActive: Joi.boolean().default(true),
    accountIds: Joi.array().items(Joi.number().integer())
  }),

  goal: Joi.object({
    accountId: Joi.number().integer().allow(null),
    name: Joi.string().required().max(255),
    description: Joi.string().allow('', null),
    targetAmount: Joi.number().positive().required(),
    currencyId: Joi.number().integer().required(),
    targetDate: Joi.date().allow(null),
    priority: Joi.number().integer().default(0),
    imageUrl: Joi.string().uri().max(500).allow('', null)
  })
};

module.exports = { validate, schemas };

