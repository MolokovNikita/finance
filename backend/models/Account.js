module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    accountType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'account_type'
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'currency_id'
    },
    initialBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'initial_balance'
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'current_balance'
    },
    color: {
      type: DataTypes.STRING(7)
    },
    icon: {
      type: DataTypes.STRING(50)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isIncludedInTotal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_included_in_total'
    },
    notes: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'accounts',
    timestamps: true,
    underscored: true
  });

  Account.associate = (models) => {
    Account.belongsTo(models.User, { foreignKey: 'user_id' });
    Account.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    Account.hasMany(models.Transaction, { foreignKey: 'account_id' });
    Account.hasMany(models.RecurringTransaction, { foreignKey: 'account_id' });
    Account.hasMany(models.FinancialGoal, { foreignKey: 'account_id' });
    Account.belongsToMany(models.Budget, {
      through: models.BudgetAccount,
      foreignKey: 'account_id'
    });
  };

  return Account;
};

