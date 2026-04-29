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
    const runUnification = () => {
      const users = JSON.parse(localStorage.getItem('balances_users') || '[]');
      if (users.length <= 1) return;

      const emailGroups = {};
      let hasDuplicates = false;

      // Group users by email
      users.forEach(u => {
        if (!emailGroups[u.email]) emailGroups[u.email] = [];
        emailGroups[u.email].push(u);
      });

      const newUsers = [];
      
      Object.values(emailGroups).forEach(group => {
        const master = group[0];
        newUsers.push(master);
        
        if (group.length > 1) {
          hasDuplicates = true;
          // Merge all transactions into master
          let allTx = JSON.parse(localStorage.getItem(`balances_tx_${master.id}`) || '[]');
          
          group.slice(1).forEach(dup => {
            const dupTx = JSON.parse(localStorage.getItem(`balances_tx_${dup.id}`) || '[]');
            allTx = [...allTx, ...dupTx];
            localStorage.removeItem(`balances_tx_${dup.id}`);
          });

          // Unique transactions only
          const uniqueTx = Array.from(new Map(allTx.map(tx => [tx.id, tx])).values());
          localStorage.setItem(`balances_tx_${master.id}`, JSON.stringify(uniqueTx));
        }
      });

      if (hasDuplicates) {
        localStorage.setItem('balances_users', JSON.stringify(newUsers));
        
        // If we are logged in as one of the merged accounts, switch to master
        if (currentUser) {
          const masterUser = newUsers.find(u => u.email === currentUser.email);
          if (masterUser && masterUser.id !== currentUser.id) {
            setCurrentUser(masterUser);
            localStorage.setItem('balances_user', JSON.stringify(masterUser));
          }
        }
      }
    };

    runUnification();

    const handleStorageChange = (e) => {
      if (!e.newValue) return;

      // Sync Session
      if (e.key === 'balances_user') {
        setCurrentUser(JSON.parse(e.newValue));
      }
      
      // Sync Transactions (only if it matches our current ID)
      if (currentUser && e.key === `balances_tx_${currentUser.id}`) {
        setTransactions(JSON.parse(e.newValue));
      }

      // If users list changed, re-run unification
      if (e.key === 'balances_users') {
        runUnification();
      }

      // Sync Theme/Lang
      if (e.key === 'balances_theme') setTheme(e.newValue);
      if (e.key === 'balances_lang') setLanguage(e.newValue);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.id, currentUser?.email]);

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
