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
import { createCategory, updateCategory } from '../store/slices/categoriesSlice';
import api from '../services/api';

export default function CategoryForm({ open, onClose, category = null }) {
  const dispatch = useDispatch();
  const { items: categories } = useSelector((state) => state.categories);
  const [loading, setLoading] = useState(false);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryTypeId: '',
    parentCategoryId: '',
    icon: '',
    color: '#1976d2',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name || '',
          categoryTypeId: category.categoryTypeId || category.CategoryType?.id || '',
          parentCategoryId: category.parentCategoryId || '',
          icon: category.icon || '',
          color: category.color || '#1976d2',
          sortOrder: category.sortOrder || 0,
          isActive: category.isActive !== undefined ? category.isActive : true,
        });
      } else {
        setFormData({
          name: '',
          categoryTypeId: '',
          parentCategoryId: '',
          icon: '',
          color: '#1976d2',
          sortOrder: 0,
          isActive: true,
        });
      }
      loadCategoryTypes();
    }
  }, [open, category]);

  const loadCategoryTypes = async () => {
    try {
      // Загружаем типы категорий из API или используем известные значения
      // В реальном приложении можно добавить endpoint для типов категорий
      setCategoryTypes([
        { id: 1, name: 'income', label: 'Доход' },
        { id: 2, name: 'expense', label: 'Расход' },
        { id: 3, name: 'transfer', label: 'Перевод' },
      ]);
    } catch (error) {
      console.error('Ошибка загрузки типов категорий:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // При смене типа категории сбрасываем родительскую категорию
    if (name === 'categoryTypeId') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        parentCategoryId: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanedData = {
        ...formData,
        categoryTypeId: parseInt(formData.categoryTypeId),
        parentCategoryId: formData.parentCategoryId || null,
        icon: formData.icon || null,
        color: formData.color || null,
        sortOrder: parseInt(formData.sortOrder) || 0,
      };

      if (category) {
        await dispatch(updateCategory({ id: category.id, ...cleanedData }));
      } else {
        await dispatch(createCategory(cleanedData));
      }
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтруем категории для выбора родительской (только того же типа и не системные)
  const availableParentCategories = categories.filter(
    cat => 
      cat.categoryTypeId === parseInt(formData.categoryTypeId) || 
      cat.CategoryType?.id === parseInt(formData.categoryTypeId)
  ).filter(cat => !cat.isSystem || cat.id === category?.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{category ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Название категории"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Кафе и рестораны"
            />
            <FormControl fullWidth required>
              <InputLabel>Тип категории</InputLabel>
              <Select
                name="categoryTypeId"
                value={formData.categoryTypeId}
                onChange={handleChange}
                label="Тип категории"
              >
                {categoryTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.categoryTypeId && (
              <FormControl fullWidth>
                <InputLabel>Родительская категория (опционально)</InputLabel>
                <Select
                  name="parentCategoryId"
                  value={formData.parentCategoryId}
                  onChange={handleChange}
                  label="Родительская категория (опционально)"
                >
                  <MenuItem value="">Без родительской категории</MenuItem>
                  {availableParentCategories.map((parentCat) => (
                    <MenuItem key={parentCat.id} value={parentCat.id}>
                      {parentCat.icon && <span style={{ marginRight: 8 }}>{parentCat.icon}</span>}
                      {parentCat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              name="icon"
              label="Иконка (эмодзи или текст)"
              fullWidth
              value={formData.icon}
              onChange={handleChange}
              placeholder="Например: 🍽️ или cafe"
              helperText="Можно использовать эмодзи или текст"
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
              name="sortOrder"
              label="Порядок сортировки"
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={handleChange}
              inputProps={{ min: '0', step: '1' }}
              helperText="Чем меньше число, тем выше в списке"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : category ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

