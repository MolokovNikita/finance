module.exports = (sequelize, DataTypes) => {
  const TransactionTag = sequelize.define('TransactionTag', {
    transactionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'transaction_id'
    },
    tagId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'tag_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'transaction_tags',
    timestamps: false,
    underscored: true
  });

  TransactionTag.associate = (models) => {
    TransactionTag.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
    TransactionTag.belongsTo(models.Tag, { foreignKey: 'tag_id' });
  };

  return TransactionTag;
};

