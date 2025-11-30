module.exports = (sequelize, DataTypes) => {
  const UserSetting = sequelize.define('UserSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'ru'
    },
    dateFormat: {
      type: DataTypes.STRING(20),
      defaultValue: 'DD.MM.YYYY',
      field: 'date_format'
    },
    startOfWeek: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      field: 'start_of_week'
    },
    startOfMonth: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      field: 'start_of_month'
    },
    notificationEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'notification_enabled'
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'email_notifications'
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'push_notifications'
    },
    theme: {
      type: DataTypes.STRING(20),
      defaultValue: 'light'
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
    tableName: 'user_settings',
    timestamps: true,
    underscored: true
  });

  UserSetting.associate = (models) => {
    UserSetting.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return UserSetting;
};

