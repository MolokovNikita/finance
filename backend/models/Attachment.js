module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
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
    transactionId: {
      type: DataTypes.INTEGER,
      field: 'transaction_id'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name'
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      field: 'file_size'
    },
    mimeType: {
      type: DataTypes.STRING(100),
      field: 'mime_type'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'attachments',
    timestamps: false,
    underscored: true
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.User, { foreignKey: 'user_id' });
    Attachment.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
  };

  return Attachment;
};

