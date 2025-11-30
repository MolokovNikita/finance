import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchTransactions, deleteTransaction } from '../store/slices/transactionsSlice';
import TransactionForm from '../components/TransactionForm';
import { format, parseISO } from 'date-fns';
import { getTransactionTypeLabel } from '../utils/translations';

export default function Transactions() {
  const dispatch = useDispatch();
  const { items: transactions, loading } = useSelector((state) => state.transactions);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedTransaction(null);
    setFormOpen(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      await dispatch(deleteTransaction(id));
      dispatch(fetchTransactions());
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'transfer': return 'info';
      default: return 'default';
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
        <Typography variant="h4">Транзакции</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить транзакцию
        </Button>
      </Box>
      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTransaction(null);
          dispatch(fetchTransactions());
        }}
        transaction={selectedTransaction}
      />
      {transactions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Нет транзакций</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Счет</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(parseISO(transaction.transactionDate), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>{transaction.description || '-'}</TableCell>
                  <TableCell>{transaction.Account?.name || '-'}</TableCell>
                  <TableCell>{transaction.Category?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTransactionTypeLabel(transaction.transactionType)}
                      color={getTypeColor(transaction.transactionType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {transaction.amount?.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: transaction.Currency?.code || 'RUB',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(transaction)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(transaction.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

