module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      field: 'last_name'
    },
    defaultCurrencyId: {
      type: DataTypes.INTEGER,
      field: 'default_currency_id'
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'UTC'
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      field: 'avatar_url'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified'
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
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.belongsTo(models.Currency, {
      foreignKey: 'default_currency_id',
      as: 'defaultCurrency'
    });
    User.hasMany(models.Account, { foreignKey: 'user_id' });
    User.hasMany(models.Category, { foreignKey: 'user_id' });
    User.hasMany(models.Transaction, { foreignKey: 'user_id' });
    User.hasMany(models.Budget, { foreignKey: 'user_id' });
    User.hasMany(models.FinancialGoal, { foreignKey: 'user_id' });
    User.hasMany(models.Tag, { foreignKey: 'user_id' });
    User.hasMany(models.Payee, { foreignKey: 'user_id' });
    User.hasMany(models.PaymentMethod, { foreignKey: 'user_id' });
    User.hasMany(models.RecurringTransaction, { foreignKey: 'user_id' });
    User.hasMany(models.Notification, { foreignKey: 'user_id' });
    User.hasMany(models.SavedReport, { foreignKey: 'user_id' });
    User.hasOne(models.UserSetting, { foreignKey: 'user_id' });
    User.hasMany(models.Attachment, { foreignKey: 'user_id' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id' });
  };

  return User;
};

