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
