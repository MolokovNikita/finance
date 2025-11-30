const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

const db = {};

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Currency = require('./Currency')(sequelize, Sequelize.DataTypes);
db.ExchangeRate = require('./ExchangeRate')(sequelize, Sequelize.DataTypes);
db.Account = require('./Account')(sequelize, Sequelize.DataTypes);
db.CategoryType = require('./CategoryType')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.Tag = require('./Tag')(sequelize, Sequelize.DataTypes);
db.Payee = require('./Payee')(sequelize, Sequelize.DataTypes);
db.PaymentMethod = require('./PaymentMethod')(sequelize, Sequelize.DataTypes);
db.RecurringTransaction = require('./RecurringTransaction')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
db.TransactionTag = require('./TransactionTag')(sequelize, Sequelize.DataTypes);
db.Budget = require('./Budget')(sequelize, Sequelize.DataTypes);
db.BudgetAccount = require('./BudgetAccount')(sequelize, Sequelize.DataTypes);
db.FinancialGoal = require('./FinancialGoal')(sequelize, Sequelize.DataTypes);
db.GoalContribution = require('./GoalContribution')(sequelize, Sequelize.DataTypes);
db.Attachment = require('./Attachment')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.SavedReport = require('./SavedReport')(sequelize, Sequelize.DataTypes);
db.UserSetting = require('./UserSetting')(sequelize, Sequelize.DataTypes);
db.AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

