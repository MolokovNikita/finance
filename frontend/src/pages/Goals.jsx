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
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, CheckCircle as CheckCircleIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchGoals, deleteGoal } from '../store/slices/goalsSlice';
import GoalForm from '../components/GoalForm';

export default function Goals() {
  const dispatch = useDispatch();
  const { items: goals, loading } = useSelector((state) => state.goals);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedGoal(null);
    setFormOpen(true);
  };

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту цель?')) {
      await dispatch(deleteGoal(id));
      dispatch(fetchGoals());
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
        <Typography variant="h4">Финансовые цели</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить цель
        </Button>
      </Box>
      <GoalForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedGoal(null);
          dispatch(fetchGoals());
        }}
        goal={selectedGoal}
      />
      <Grid container spacing={3}>
        {goals.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Нет целей</Typography>
            </Paper>
          </Grid>
        ) : (
          goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <Grid item xs={12} md={6} key={goal.id}>
                <Paper sx={{ p: 3, position: 'relative' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{goal.name}</Typography>
                      {goal.isAchieved && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Достигнуто"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(goal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {goal.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        {goal.currentAmount?.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: goal.Currency?.code || 'RUB',
                          minimumFractionDigits: 0,
                        }) || '0'} / {goal.targetAmount?.toLocaleString('ru-RU', {
                          style: 'currency',
                          currency: goal.Currency?.code || 'RUB',
                          minimumFractionDigits: 0,
                        })}
                      </Typography>
                      <Typography variant="body2">{percentage.toFixed(0)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      color={goal.isAchieved ? 'success' : 'primary'}
                    />
                  </Box>
                  {goal.targetDate && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Целевая дата: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}

