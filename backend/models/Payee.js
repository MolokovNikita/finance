module.exports = (sequelize, DataTypes) => {
  const Payee = sequelize.define('Payee', {
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
    defaultCategoryId: {
      type: DataTypes.INTEGER,
      field: 'default_category_id'
    },
    notes: {
      type: DataTypes.TEXT
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
    tableName: 'payees',
    timestamps: true,
    underscored: true
  });

  Payee.associate = (models) => {
    Payee.belongsTo(models.User, { foreignKey: 'user_id' });
    Payee.belongsTo(models.Category, { foreignKey: 'default_category_id', as: 'defaultCategory' });
    Payee.hasMany(models.Transaction, { foreignKey: 'payee_id' });
    Payee.hasMany(models.RecurringTransaction, { foreignKey: 'payee_id' });
  };

  return Payee;
};

