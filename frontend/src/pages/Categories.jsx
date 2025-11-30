import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchCategories, deleteCategory } from '../store/slices/categoriesSlice';
import CategoryForm from '../components/CategoryForm';

export default function Categories() {
  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector((state) => state.categories);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category) => {
    // Можно редактировать только пользовательские категории
    if (!category.isSystem) {
      setSelectedCategory(category);
      setFormOpen(true);
    }
  };

  const handleDelete = async (id, isSystem) => {
    if (isSystem) {
      alert('Системные категории нельзя удалять');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      await dispatch(deleteCategory(id));
      dispatch(fetchCategories());
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const incomeCategories = categories.filter(cat => cat.CategoryType?.name === 'income');
  const expenseCategories = categories.filter(cat => cat.CategoryType?.name === 'expense');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Категории</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить категорию
        </Button>
      </Box>
      <CategoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedCategory(null);
          dispatch(fetchCategories());
        }}
        category={selectedCategory}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Доходы
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {incomeCategories.length === 0 ? (
                <Typography color="text.secondary">Нет категорий</Typography>
              ) : (
                incomeCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    icon={category.icon ? <span>{category.icon}</span> : undefined}
                    sx={{ 
                      backgroundColor: category.color || '#1976d2', 
                      color: 'white',
                      position: 'relative',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onDelete={!category.isSystem ? () => handleDelete(category.id, category.isSystem) : undefined}
                    deleteIcon={!category.isSystem ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id, category.isSystem);
                        }}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : undefined}
                    onClick={!category.isSystem ? () => handleEdit(category) : undefined}
                    style={{ cursor: !category.isSystem ? 'pointer' : 'default' }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Расходы
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {expenseCategories.length === 0 ? (
                <Typography color="text.secondary">Нет категорий</Typography>
              ) : (
                expenseCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    icon={category.icon ? <span>{category.icon}</span> : undefined}
                    sx={{ 
                      backgroundColor: category.color || '#d32f2f', 
                      color: 'white',
                      position: 'relative',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onDelete={!category.isSystem ? () => handleDelete(category.id, category.isSystem) : undefined}
                    deleteIcon={!category.isSystem ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id, category.isSystem);
                        }}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : undefined}
                    onClick={!category.isSystem ? () => handleEdit(category) : undefined}
                    style={{ cursor: !category.isSystem ? 'pointer' : 'default' }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

