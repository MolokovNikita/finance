// Функции для перевода значений на русский язык

export const getAccountTypeLabel = (type) => {
  const types = {
    checking: 'Текущий счет',
    savings: 'Сберегательный счет',
    cash: 'Наличные',
    credit_card: 'Кредитная карта',
    investment: 'Инвестиции',
  };
  return types[type] || type;
};

export const getTransactionTypeLabel = (type) => {
  const types = {
    income: 'Доход',
    expense: 'Расход',
    transfer: 'Перевод',
  };
  return types[type] || type;
};

export const getPeriodTypeLabel = (type) => {
  const types = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно',
    custom: 'Произвольный',
  };
  return types[type] || type;
};

