module.exports = (sequelize, DataTypes) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fromCurrencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'from_currency_id'
    },
    toCurrencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'to_currency_id'
    },
    rate: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'exchange_rates',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['from_currency_id', 'to_currency_id', 'date']
      }
    ]
  });

  ExchangeRate.associate = (models) => {
    ExchangeRate.belongsTo(models.Currency, {
      foreignKey: 'from_currency_id',
      as: 'fromCurrency'
    });
    ExchangeRate.belongsTo(models.Currency, {
      foreignKey: 'to_currency_id',
      as: 'toCurrency'
    });
  };

  return ExchangeRate;
};

