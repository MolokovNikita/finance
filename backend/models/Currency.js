module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(10)
    },
    decimalPlaces: {
      type: DataTypes.SMALLINT,
      defaultValue: 2,
      field: 'decimal_places'
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
    }
  }, {
    tableName: 'currencies',
    timestamps: false,
    underscored: true
  });

  Currency.associate = (models) => {
    Currency.hasMany(models.ExchangeRate, {
      foreignKey: 'from_currency_id',
      as: 'fromRates'
    });
    Currency.hasMany(models.ExchangeRate, {
      foreignKey: 'to_currency_id',
      as: 'toRates'
    });
    Currency.hasMany(models.Account, { foreignKey: 'currency_id' });
    Currency.hasMany(models.Transaction, { foreignKey: 'currency_id' });
    Currency.hasMany(models.Budget, { foreignKey: 'currency_id' });
    Currency.hasMany(models.FinancialGoal, { foreignKey: 'currency_id' });
    Currency.hasMany(models.RecurringTransaction, { foreignKey: 'currency_id' });
  };

  return Currency;
};

