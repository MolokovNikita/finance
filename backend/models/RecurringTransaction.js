module.exports = (sequelize, DataTypes) => {
  const RecurringTransaction = sequelize.define('RecurringTransaction', {
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
      allowNull: false,
      field: 'account_id'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id'
    },
    payeeId: {
      type: DataTypes.INTEGER,
      field: 'payee_id'
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      field: 'payment_method_id'
    },
    transactionType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'transaction_type'
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
    description: {
      type: DataTypes.TEXT
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    intervalValue: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'interval_value'
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
    nextDueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'next_due_date'
    },
    lastGeneratedDate: {
      type: DataTypes.DATEONLY,
      field: 'last_generated_date'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    autoCreate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'auto_create'
    },
    remindBeforeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'remind_before_days'
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
    tableName: 'recurring_transactions',
    timestamps: true,
    underscored: true
  });

  RecurringTransaction.associate = (models) => {
    RecurringTransaction.belongsTo(models.User, { foreignKey: 'user_id' });
    RecurringTransaction.belongsTo(models.Account, { foreignKey: 'account_id' });
    RecurringTransaction.belongsTo(models.Category, { foreignKey: 'category_id' });
    RecurringTransaction.belongsTo(models.Payee, { foreignKey: 'payee_id' });
    RecurringTransaction.belongsTo(models.PaymentMethod, { foreignKey: 'payment_method_id' });
    RecurringTransaction.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    RecurringTransaction.hasMany(models.Transaction, { foreignKey: 'recurring_transaction_id' });
  };

  return RecurringTransaction;
};

