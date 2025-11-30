module.exports = (sequelize, DataTypes) => {
  const GoalContribution = sequelize.define('GoalContribution', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    goalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'goal_id'
    },
    transactionId: {
      type: DataTypes.INTEGER,
      field: 'transaction_id'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    contributionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'contribution_date'
    },
    notes: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'goal_contributions',
    timestamps: false,
    underscored: true
  });

  GoalContribution.associate = (models) => {
    GoalContribution.belongsTo(models.FinancialGoal, { foreignKey: 'goal_id' });
    GoalContribution.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
  };

  return GoalContribution;
};

