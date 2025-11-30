import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { fetchAccounts } from '../store/slices/accountsSlice';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import { format, parseISO } from 'date-fns';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: accounts, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { items: transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions({ limit: 10 }));
  }, [dispatch]);

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.currentBalance || 0);
  }, 0);

  if (accountsLoading || transactionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Главная
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Общий баланс
            </Typography>
            <Typography variant="h4" color="primary">
              {totalBalance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Количество счетов
            </Typography>
            <Typography variant="h4" color="primary">
              {accounts.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Последние транзакции
            </Typography>
            <Typography variant="h4" color="primary">
              {transactions.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Последние транзакции
            </Typography>
            {transactions.length === 0 ? (
              <Typography color="text.secondary">Нет транзакций</Typography>
            ) : (
              <Box>
                {transactions.slice(0, 5).map((transaction) => (
                  <Box key={transaction.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body1">
                      {transaction.description || 'Без описания'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(parseISO(transaction.transactionDate), 'dd.MM.yyyy')} -{' '}
                      {transaction.amount?.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: transaction.Currency?.code || 'RUB',
                      })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

