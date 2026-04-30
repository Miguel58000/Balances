import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy
} from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});

  // Fetch ARS official rate from DolarApi (most reliable for ARS)
  const fetchARSHistorical = async (date) => {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.venta || 900;
    } catch (e) {
      return 900; // Valor de respaldo si falla la API de Argentina
    }
  };

  const fetchExchangeRate = async (date, from, to) => {
    const cleanFrom = from?.toUpperCase();
    const cleanTo = to?.toUpperCase();
    if (cleanFrom === cleanTo) return 1;

    const cacheKey = `${date}_${cleanFrom}_${cleanTo}`;
    if (exchangeRates[cacheKey]) return exchangeRates[cacheKey];

    try {
      let rate;
      if (cleanFrom === 'ARS' || cleanTo === 'ARS') {
        const arsToUsdRate = await fetchARSHistorical(date);
        if (cleanFrom === 'ARS') {
          const usdToTarget = await fetchExchangeRate(date, 'USD', cleanTo);
          rate = (1 / arsToUsdRate) * usdToTarget;
        } else {
          const sourceToUsd = await fetchExchangeRate(date, cleanFrom, 'USD');
          rate = sourceToUsd * arsToUsdRate;
        }
      } else {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${cleanFrom}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        rate = data.rates[cleanTo];
      }

      if (rate && !isNaN(rate) && rate !== 0) {
        setExchangeRates(prev => ({ ...prev, [cacheKey]: rate }));
        return rate;
      }
    } catch (error) {
      console.warn(`Error en conversión ${cleanFrom} -> ${cleanTo}`);
    }
    return 1;
  };

  const convertAmount = async (amount, from, to, date) => {
    if (from === to) return amount;
    const rate = await fetchExchangeRate(date, from, to);
    return amount * rate;
  };
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('balances_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('balances_lang') || 'es');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName,
          email: user.email
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Firestore Transactions Listener
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }

    setLoading(true); // Empezamos a cargar datos del nuevo usuario
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.id),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);
      setLoading(false); // Ya tenemos datos
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('balances_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('balances_lang', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'es' ? 'en' : 'es');
  const t = (key) => translations[language][key] || key;

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      setCurrentUser({
        id: res.user.uid,
        name,
        email
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => signOut(auth);

  const addTransaction = async (tx) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        ...tx,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  const updateTransaction = async (updatedTx) => {
    try {
      const { id, ...data } = updatedTx;
      await updateDoc(doc(db, 'transactions', id), data);
    } catch (error) {
      console.error("Error updating transaction: ", error);
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
      t,
      loading,
      displayCurrency,
      setDisplayCurrency,
      fetchExchangeRate,
      convertAmount
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
