import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchAccounts, deleteAccount } from '../store/slices/accountsSlice';
import AccountForm from '../components/AccountForm';
import { getAccountTypeLabel } from '../utils/translations';

export default function Accounts() {
  const dispatch = useDispatch();
  const { items: accounts, loading } = useSelector((state) => state.accounts);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedAccount(null);
    setFormOpen(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот счет?')) {
      await dispatch(deleteAccount(id));
      dispatch(fetchAccounts());
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
        <Typography variant="h4">Счета</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить счет
        </Button>
      </Box>
      <AccountForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedAccount(null);
          dispatch(fetchAccounts());
        }}
        account={selectedAccount}
      />
      <Grid container spacing={3}>
        {accounts.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Нет счетов</Typography>
            </Paper>
          </Grid>
        ) : (
          accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Paper sx={{ p: 3, position: 'relative' }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Box>
                    <Typography variant="h6">{account.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getAccountTypeLabel(account.accountType)}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(account)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(account.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  {account.currentBalance?.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: account.Currency?.code || 'RUB',
                  })}
                </Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

