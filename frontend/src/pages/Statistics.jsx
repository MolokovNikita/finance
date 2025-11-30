import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const response = await api.get('/reports/statistics', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      setStatistics(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pieData = statistics ? [
    { name: 'Доходы', value: statistics.income },
    { name: 'Расходы', value: statistics.expense },
  ] : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Статистика</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Период</InputLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Период">
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="year">Год</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {statistics ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Доходы
              </Typography>
              <Typography variant="h4" color="success.main">
                {statistics.income.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Расходы
              </Typography>
              <Typography variant="h4" color="error.main">
                {statistics.expense.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Баланс
              </Typography>
              <Typography variant="h4" color={statistics.balance >= 0 ? 'success.main' : 'error.main'}>
                {statistics.balance.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Доходы и расходы
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Нет данных для отображения</Typography>
        </Paper>
      )}
    </Box>
  );
}

