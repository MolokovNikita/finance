module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    parentCategoryId: {
      type: DataTypes.INTEGER,
      field: 'parent_category_id'
    },
    categoryTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_type_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(50)
    },
    color: {
      type: DataTypes.STRING(7)
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_system'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
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
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });

  Category.associate = (models) => {
    Category.belongsTo(models.User, { foreignKey: 'user_id' });
    Category.belongsTo(models.Category, {
      foreignKey: 'parent_category_id',
      as: 'parentCategory'
    });
    Category.hasMany(models.Category, {
      foreignKey: 'parent_category_id',
      as: 'subcategories'
    });
    Category.belongsTo(models.CategoryType, { foreignKey: 'category_type_id' });
    Category.hasMany(models.Transaction, { foreignKey: 'category_id' });
    Category.hasMany(models.Budget, { foreignKey: 'category_id' });
    Category.hasMany(models.Payee, { foreignKey: 'default_category_id' });
    Category.hasMany(models.RecurringTransaction, { foreignKey: 'category_id' });
  };

  return Category;
};

