import { useState, useEffect } from 'react';
import { fetchAccounts } from '@/api/mockApi';
import { Account } from '@/types/account';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const fetchedAccounts = await fetchAccounts();
        setAccounts(fetchedAccounts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  return { accounts, loading, error };
};