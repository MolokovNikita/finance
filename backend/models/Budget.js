module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
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
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'currency_id'
    },
    periodType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'period_type'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      field: 'end_date'
    },
    rolloverUnused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'rollover_unused'
    },
    alertThreshold: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 80.00,
      field: 'alert_threshold'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
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
    tableName: 'budgets',
    timestamps: true,
    underscored: true
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.User, { foreignKey: 'user_id' });
    Budget.belongsTo(models.Category, { foreignKey: 'category_id' });
    Budget.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    Budget.belongsToMany(models.Account, {
      through: models.BudgetAccount,
      foreignKey: 'budget_id'
    });
  };

  return Budget;
};

