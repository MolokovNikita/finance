module.exports = (sequelize, DataTypes) => {
  const FinancialGoal = sequelize.define('FinancialGoal', {
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
    accountId: {
      type: DataTypes.INTEGER,
      field: 'account_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'target_amount'
    },
    currentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'current_amount'
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'currency_id'
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      field: 'target_date'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isAchieved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_achieved'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      field: 'image_url'
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
    tableName: 'financial_goals',
    timestamps: true,
    underscored: true
  });

  FinancialGoal.associate = (models) => {
    FinancialGoal.belongsTo(models.User, { foreignKey: 'user_id' });
    FinancialGoal.belongsTo(models.Account, { foreignKey: 'account_id' });
    FinancialGoal.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    FinancialGoal.hasMany(models.GoalContribution, { foreignKey: 'goal_id' });
  };

  return FinancialGoal;
};

