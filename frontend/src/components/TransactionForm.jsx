import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
} from '@mui/material';
import { createTransaction, updateTransaction } from '../store/slices/transactionsSlice';
import api from '../services/api';

export default function TransactionForm({ open, onClose, transaction = null }) {
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const { items: categories } = useSelector((state) => state.categories);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    transactionType: 'expense',
    amount: '',
    currencyId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (transaction) {
        setFormData({
          accountId: transaction.accountId || '',
          categoryId: transaction.categoryId || '',
          transactionType: transaction.transactionType || 'expense',
          amount: transaction.amount || '',
          currencyId: transaction.currencyId || '',
          transactionDate: transaction.transactionDate || new Date().toISOString().split('T')[0],
          description: transaction.description || '',
          notes: transaction.notes || '',
        });
      } else {
        setFormData({
          accountId: accounts[0]?.id || '',
          categoryId: '',
          transactionType: 'expense',
          amount: '',
          currencyId: '',
          transactionDate: new Date().toISOString().split('T')[0],
          description: '',
          notes: '',
        });
      }
      loadCurrencies();
    }
  }, [open, transaction, accounts]);

  const loadCurrencies = async () => {
    try {
      const response = await api.get('/currencies');
      setCurrencies(response.data.data.currencies);
    } catch (error) {
      console.error('Ошибка загрузки валют:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Очищаем пустые строки
      const cleanedData = { ...formData };
      if (cleanedData.description === '') cleanedData.description = null;
      if (cleanedData.notes === '') cleanedData.notes = null;
      if (cleanedData.location === '') cleanedData.location = null;
      if (cleanedData.categoryId === '') cleanedData.categoryId = null;
      if (cleanedData.payeeId === '') cleanedData.payeeId = null;
      if (cleanedData.paymentMethodId === '') cleanedData.paymentMethodId = null;

      const data = {
        ...cleanedData,
        amount: parseFloat(cleanedData.amount),
        currencyId: cleanedData.currencyId || accounts.find(a => a.id === cleanedData.accountId)?.currencyId,
      };
      if (transaction) {
        await dispatch(updateTransaction({ id: transaction.id, ...data }));
      } else {
        await dispatch(createTransaction(data));
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения транзакции:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    cat => {
      const typeId = formData.transactionType === 'income' ? 1 : formData.transactionType === 'expense' ? 2 : null;
      return typeId && (cat.categoryTypeId === typeId || cat.CategoryType?.id === typeId);
    }
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{transaction ? 'Редактировать транзакцию' : 'Добавить транзакцию'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Тип транзакции</InputLabel>
              <Select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                label="Тип транзакции"
              >
                <MenuItem value="income">Доход</MenuItem>
                <MenuItem value="expense">Расход</MenuItem>
                <MenuItem value="transfer">Перевод</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Счет</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Счет"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Категория"
              >
                <MenuItem value="">Без категории</MenuItem>
                {filteredCategories.length === 0 && formData.transactionType !== 'transfer' && (
                  <MenuItem disabled>Загрузка категорий...</MenuItem>
                )}
                {filteredCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon && <span style={{ marginRight: 8 }}>{category.icon}</span>}
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="amount"
              label="Сумма"
              type="number"
              required
              fullWidth
              value={formData.amount}
              onChange={handleChange}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              name="transactionDate"
              label="Дата"
              type="date"
              required
              fullWidth
              value={formData.transactionDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="description"
              label="Описание"
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              name="notes"
              label="Заметки"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : transaction ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

