module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
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
    exchangeRate: {
      type: DataTypes.DECIMAL(18, 8),
      defaultValue: 1,
      field: 'exchange_rate'
    },
    amountInAccountCurrency: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'amount_in_account_currency'
    },
    transactionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'transaction_date'
    },
    description: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recurring'
    },
    recurringTransactionId: {
      type: DataTypes.INTEGER,
      field: 'recurring_transaction_id'
    },
    transferTransactionId: {
      type: DataTypes.INTEGER,
      field: 'transfer_transaction_id'
    },
    location: {
      type: DataTypes.STRING(255)
    },
    isExcludedFromStats: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_excluded_from_stats'
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
    tableName: 'transactions',
    timestamps: true,
    underscored: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: 'user_id' });
    Transaction.belongsTo(models.Account, { foreignKey: 'account_id' });
    Transaction.belongsTo(models.Category, { foreignKey: 'category_id' });
    Transaction.belongsTo(models.Payee, { foreignKey: 'payee_id' });
    Transaction.belongsTo(models.PaymentMethod, { foreignKey: 'payment_method_id' });
    Transaction.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    Transaction.belongsTo(models.RecurringTransaction, {
      foreignKey: 'recurring_transaction_id'
    });
    Transaction.belongsTo(models.Transaction, {
      foreignKey: 'transfer_transaction_id',
      as: 'transferTransaction'
    });
    Transaction.hasMany(models.Transaction, {
      foreignKey: 'transfer_transaction_id',
      as: 'transferTransactions'
    });
    Transaction.belongsToMany(models.Tag, {
      through: models.TransactionTag,
      foreignKey: 'transaction_id'
    });
    Transaction.hasMany(models.Attachment, { foreignKey: 'transaction_id' });
    Transaction.hasMany(models.GoalContribution, { foreignKey: 'transaction_id' });
  };

  return Transaction;
};

