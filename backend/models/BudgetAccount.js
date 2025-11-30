module.exports = (sequelize, DataTypes) => {
  const BudgetAccount = sequelize.define('BudgetAccount', {
    budgetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'budget_id'
    },
    accountId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'account_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'budget_accounts',
    timestamps: false,
    underscored: true
  });

  BudgetAccount.associate = (models) => {
    BudgetAccount.belongsTo(models.Budget, { foreignKey: 'budget_id' });
    BudgetAccount.belongsTo(models.Account, { foreignKey: 'account_id' });
  };

  return BudgetAccount;
};

