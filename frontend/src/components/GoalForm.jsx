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
import { createGoal, updateGoal } from '../store/slices/goalsSlice';
import api from '../services/api';

export default function GoalForm({ open, onClose, goal = null }) {
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    currencyId: '',
    accountId: '',
    targetDate: '',
    priority: 0,
    imageUrl: '',
  });

  useEffect(() => {
    if (open) {
      if (goal) {
        setFormData({
          name: goal.name || '',
          description: goal.description || '',
          targetAmount: goal.targetAmount || '',
          currentAmount: goal.currentAmount || '',
          currencyId: goal.currencyId || '',
          accountId: goal.accountId || '',
          targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
          priority: goal.priority || 0,
          imageUrl: goal.imageUrl || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          targetAmount: '',
          currentAmount: '0',
          currencyId: '',
          accountId: '',
          targetDate: '',
          priority: 0,
          imageUrl: '',
        });
      }
      loadCurrencies();
    }
  }, [open, goal]);

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
      const cleanedData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        accountId: formData.accountId || null,
        targetDate: formData.targetDate || null,
        priority: parseInt(formData.priority) || 0,
        imageUrl: formData.imageUrl || null,
        description: formData.description || null,
      };

      if (goal) {
        await dispatch(updateGoal({ id: goal.id, ...cleanedData }));
      } else {
        await dispatch(createGoal(cleanedData));
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения цели:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{goal ? 'Редактировать цель' : 'Добавить цель'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Название цели"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Накопить на отпуск"
            />
            <TextField
              name="description"
              label="Описание"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              name="targetAmount"
              label="Целевая сумма"
              type="number"
              required
              fullWidth
              value={formData.targetAmount}
              onChange={handleChange}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              name="currentAmount"
              label="Текущая сумма"
              type="number"
              fullWidth
              value={formData.currentAmount}
              onChange={handleChange}
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Сколько уже накоплено"
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
            <FormControl fullWidth>
              <InputLabel>Счет (опционально)</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Счет (опционально)"
              >
                <MenuItem value="">Без привязки к счету</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="targetDate"
              label="Целевая дата (опционально)"
              type="date"
              fullWidth
              value={formData.targetDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="priority"
              label="Приоритет"
              type="number"
              fullWidth
              value={formData.priority}
              onChange={handleChange}
              inputProps={{ min: '0', max: '10', step: '1' }}
              helperText="Чем выше число, тем выше приоритет (0-10)"
            />
            <TextField
              name="imageUrl"
              label="URL изображения (опционально)"
              fullWidth
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : goal ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

