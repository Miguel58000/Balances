import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('balances_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('balances_theme');
    return saved || 'dark';
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('balances_lang');
    return saved || 'es';
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`balances_tx_${currentUser.id}`);
      setTransactions(saved ? JSON.parse(saved) : []);
    } else {
      setTransactions([]);
    }
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('balances_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('balances_lang', language);
  }, [language]);

  // --- Real-time Sync & Account Unification ---
  useEffect(() => {
    const unifyAccounts = () => {
      const users = JSON.parse(localStorage.getItem('balances_users') || '[]');
      if (users.length === 0) return;

      const emailMap = {};
      const newUsers = [];
      let changed = false;

      users.forEach(user => {
        if (!emailMap[user.email]) {
          emailMap[user.email] = user;
          newUsers.push(user);
        } else {
          // Duplicate found! Merge transactions
          const masterUser = emailMap[user.email];
          const masterTx = JSON.parse(localStorage.getItem(`balances_tx_${masterUser.id}`) || '[]');
          const duplicateTx = JSON.parse(localStorage.getItem(`balances_tx_${user.id}`) || '[]');
          
          if (duplicateTx.length > 0) {
            // Combine and remove duplicates by ID if any
            const combined = [...masterTx, ...duplicateTx];
            const uniqueTx = Array.from(new Map(combined.map(item => [item.id, item])).values());
            localStorage.setItem(`balances_tx_${masterUser.id}`, JSON.stringify(uniqueTx));
          }
          
          // Cleanup duplicate storage
          localStorage.removeItem(`balances_tx_${user.id}`);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem('balances_users', JSON.stringify(newUsers));
        // If current user was a duplicate, update to master
        if (currentUser) {
          const updatedMaster = newUsers.find(u => u.email === currentUser.email);
          if (updatedMaster && updatedMaster.id !== currentUser.id) {
            setCurrentUser(updatedMaster);
            localStorage.setItem('balances_user', JSON.stringify(updatedMaster));
          }
        }
      }
    };

    unifyAccounts();

    const handleStorageChange = (e) => {
      // Sync user session
      if (e.key === 'balances_user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentUser(newUser);
      }
      // Sync transactions for current user
      if (currentUser && e.key === `balances_tx_${currentUser.id}`) {
        setTransactions(e.newValue ? JSON.parse(e.newValue) : []);
      }
      // Sync theme/lang
      if (e.key === 'balances_theme' && e.newValue) setTheme(e.newValue);
      if (e.key === 'balances_lang' && e.newValue) setLanguage(e.newValue);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key) => translations[language][key] || key;

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('balances_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('balances_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('balances_users') || '[]');
    if (users.find(u => u.email === email)) return false;
    
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('balances_users', JSON.stringify(users));
    setCurrentUser(newUser);
    localStorage.setItem('balances_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('balances_user');
  };

  const addTransaction = (tx) => {
    const newTx = { ...tx, id: Date.now().toString() };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    if (currentUser) {
      localStorage.setItem(`balances_tx_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    if (currentUser) {
      localStorage.setItem(`balances_tx_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const updateTransaction = (updatedTx) => {
    const updated = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    setTransactions(updated);
    if (currentUser) {
      localStorage.setItem(`balances_tx_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      transactions,
      login,
      register,
      logout,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      theme,
      toggleTheme,
      language,
      toggleLanguage,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
