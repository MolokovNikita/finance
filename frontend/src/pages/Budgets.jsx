import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchBudgets, deleteBudget } from '../store/slices/budgetsSlice';
import BudgetForm from '../components/BudgetForm';

export default function Budgets() {
  const dispatch = useDispatch();
  const { items: budgets, loading } = useSelector((state) => state.budgets);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedBudget(null);
    setFormOpen(true);
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот бюджет?')) {
      await dispatch(deleteBudget(id));
      dispatch(fetchBudgets());
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Бюджеты</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить бюджет
        </Button>
      </Box>
      <BudgetForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedBudget(null);
          dispatch(fetchBudgets());
        }}
        budget={selectedBudget}
      />
      <Grid container spacing={3}>
        {budgets.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Нет бюджетов</Typography>
            </Paper>
          </Grid>
        ) : (
          budgets.map((budget) => {
            const spent = budget.spent || 0;
            const percentage = budget.percentage || 0;
            return (
              <Grid item xs={12} md={6} key={budget.id}>
                <Paper sx={{ p: 3, position: 'relative' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Box>
                      <Typography variant="h6">{budget.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {budget.Category?.name || 'Общий бюджет'}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(budget)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(budget.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        Потрачено: {spent.toLocaleString('ru-RU')} / {budget.amount.toLocaleString('ru-RU')}
                      </Typography>
                      <Typography variant="body2">{percentage.toFixed(0)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      color={percentage > 100 ? 'error' : percentage > 80 ? 'warning' : 'primary'}
                    />
                  </Box>
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}

