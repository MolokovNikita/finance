module.exports = (sequelize, DataTypes) => {
  const CategoryType = sequelize.define('CategoryType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'category_types',
    timestamps: false,
    underscored: true
  });

  CategoryType.associate = (models) => {
    CategoryType.hasMany(models.Category, { foreignKey: 'category_type_id' });
  };

  return CategoryType;
};

