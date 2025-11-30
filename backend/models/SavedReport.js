module.exports = (sequelize, DataTypes) => {
  const SavedReport = sequelize.define('SavedReport', {
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
    reportType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'report_type'
    },
    filters: {
      type: DataTypes.JSONB
    },
    chartType: {
      type: DataTypes.STRING(50),
      field: 'chart_type'
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite'
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
    tableName: 'saved_reports',
    timestamps: true,
    underscored: true
  });

  SavedReport.associate = (models) => {
    SavedReport.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return SavedReport;
};

