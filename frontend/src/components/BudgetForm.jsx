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
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { createBudget, updateBudget } from '../store/slices/budgetsSlice';
import api from '../services/api';

export default function BudgetForm({ open, onClose, budget = null }) {
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const { items: categories } = useSelector((state) => state.categories);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    amount: '',
    currencyId: '',
    periodType: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rolloverUnused: false,
    alertThreshold: 80,
    isActive: true,
    accountIds: [],
  });

  useEffect(() => {
    if (open) {
      if (budget) {
        setFormData({
          name: budget.name || '',
          categoryId: budget.categoryId || '',
          amount: budget.amount || '',
          currencyId: budget.currencyId || '',
          periodType: budget.periodType || 'monthly',
          startDate: budget.startDate || new Date().toISOString().split('T')[0],
          endDate: budget.endDate || '',
          rolloverUnused: budget.rolloverUnused || false,
          alertThreshold: budget.alertThreshold || 80,
          isActive: budget.isActive !== undefined ? budget.isActive : true,
          accountIds: budget.Accounts?.map(a => a.id) || [],
        });
      } else {
        setFormData({
          name: '',
          categoryId: '',
          amount: '',
          currencyId: '',
          periodType: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          rolloverUnused: false,
          alertThreshold: 80,
          isActive: true,
          accountIds: [],
        });
      }
      loadCurrencies();
    }
  }, [open, budget]);

  const loadCurrencies = async () => {
    try {
      const response = await api.get('/currencies');
      setCurrencies(response.data.data.currencies);
      if (response.data.data.currencies.length > 0 && !formData.currencyId) {
        setFormData(prev => ({
          ...prev,
          currencyId: response.data.data.currencies[0].id,
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки валют:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAccountChange = (accountId) => {
    const accountIds = formData.accountIds.includes(accountId)
      ? formData.accountIds.filter(id => id !== accountId)
      : [...formData.accountIds, accountId];
    setFormData({
      ...formData,
      accountIds,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanedData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || null,
        endDate: formData.endDate || null,
        alertThreshold: parseFloat(formData.alertThreshold),
      };

      if (budget) {
        await dispatch(updateBudget({ id: budget.id, ...cleanedData }));
      } else {
        await dispatch(createBudget(cleanedData));
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения бюджета:', error);
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter(
    cat => cat.CategoryType?.name === 'expense' || cat.categoryTypeId === 2
  );

  const periodTypes = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' },
    { value: 'custom', label: 'Произвольный' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{budget ? 'Редактировать бюджет' : 'Добавить бюджет'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Название бюджета"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Категория"
              >
                <MenuItem value="">Общий бюджет</MenuItem>
                {expenseCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon && <span style={{ marginRight: 8 }}>{category.icon}</span>}
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="amount"
              label="Сумма бюджета"
              type="number"
              required
              fullWidth
              value={formData.amount}
              onChange={handleChange}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <FormControl fullWidth required>
              <InputLabel>Валюта</InputLabel>
              <Select
                name="currencyId"
                value={formData.currencyId}
                onChange={handleChange}
                label="Валюта"
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Период</InputLabel>
              <Select
                name="periodType"
                value={formData.periodType}
                onChange={handleChange}
                label="Период"
              >
                {periodTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="startDate"
              label="Дата начала"
              type="date"
              required
              fullWidth
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="endDate"
              label="Дата окончания (опционально)"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="alertThreshold"
              label="Порог уведомления (%)"
              type="number"
              fullWidth
              value={formData.alertThreshold}
              onChange={handleChange}
              inputProps={{ min: '0', max: '100', step: '1' }}
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                Счета (выберите счета для отслеживания):
              </Typography>
              {accounts.map((account) => (
                <FormControlLabel
                  key={account.id}
                  control={
                    <Checkbox
                      checked={formData.accountIds.includes(account.id)}
                      onChange={() => handleAccountChange(account.id)}
                    />
                  }
                  label={account.name}
                />
              ))}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  name="rolloverUnused"
                  checked={formData.rolloverUnused}
                  onChange={handleChange}
                />
              }
              label="Переносить неиспользованную сумму"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              }
              label="Активен"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : budget ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

