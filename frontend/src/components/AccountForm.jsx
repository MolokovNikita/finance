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
import { createAccount, updateAccount } from '../store/slices/accountsSlice';
import api from '../services/api';

export default function AccountForm({ open, onClose, account = null }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'checking',
    currencyId: '',
    initialBalance: 0,
    color: '#1976d2',
    icon: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (account) {
        setFormData({
          name: account.name || '',
          accountType: account.accountType || 'checking',
          currencyId: account.currencyId || '',
          initialBalance: account.initialBalance || 0,
          color: account.color || '#1976d2',
          icon: account.icon || '',
          notes: account.notes || '',
        });
      } else {
        setFormData({
          name: '',
          accountType: 'checking',
          currencyId: '',
          initialBalance: 0,
          color: '#1976d2',
          icon: '',
          notes: '',
        });
      }
      loadCurrencies();
    }
  }, [open, account]);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Очищаем пустые строки - преобразуем в null или удаляем
      const cleanedData = { ...formData };
      if (cleanedData.icon === '') cleanedData.icon = null;
      if (cleanedData.notes === '') cleanedData.notes = null;
      if (cleanedData.initialBalance === '') cleanedData.initialBalance = 0;
      cleanedData.initialBalance = parseFloat(cleanedData.initialBalance) || 0;

      if (account) {
        await dispatch(updateAccount({ id: account.id, ...cleanedData }));
      } else {
        await dispatch(createAccount(cleanedData));
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения счета:', error);
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    { value: 'checking', label: 'Текущий счет' },
    { value: 'savings', label: 'Сберегательный счет' },
    { value: 'cash', label: 'Наличные' },
    { value: 'credit_card', label: 'Кредитная карта' },
    { value: 'investment', label: 'Инвестиции' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{account ? 'Редактировать счет' : 'Добавить счет'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Название счета"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel>Тип счета</InputLabel>
              <Select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                label="Тип счета"
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Валюта</InputLabel>
              <Select
                name="currencyId"
                value={formData.currencyId}
                onChange={handleChange}
                label="Валюта"
                required
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="initialBalance"
              label="Начальный баланс"
              type="number"
              fullWidth
              value={formData.initialBalance}
              onChange={handleChange}
            />
            <TextField
              name="color"
              label="Цвет"
              type="color"
              fullWidth
              value={formData.color}
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
            {loading ? 'Сохранение...' : account ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

