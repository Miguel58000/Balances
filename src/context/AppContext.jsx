import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../constants/translations';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  confirmPasswordReset
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
   const [displayCurrency, setDisplayCurrency] = useState('ARS');
   const [exchangeRates, setExchangeRates] = useState({});
   const pendingFetches = useRef({});

    const fetchExchangeRate = async (date, from, to) => {
      const cleanFrom = from?.toUpperCase();
      const cleanTo = to?.toUpperCase();
      if (cleanFrom === cleanTo) return 1;

      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const dateStr = dateObj.toISOString().split('T')[0];
      const cacheKey = `${dateStr}_${cleanFrom}_${cleanTo}`;

      if (exchangeRates[cacheKey]) return exchangeRates[cacheKey];
      if (pendingFetches.current[cacheKey]) {
        return pendingFetches.current[cacheKey];
      }

      try {
        const fetchPromise = (async () => {
          try {
            const url = date
              ? `https://open.er-api.com/v6/${dateStr}?base=${cleanFrom}&symbols=${cleanTo}`
              : `https://open.er-api.com/v6/latest?base=${cleanFrom}&symbols=${cleanTo}`;

            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              const rate = data.rates?.[cleanTo];
              if (rate && rate > 0) {
                const roundedRate = Math.round(rate * 10000) / 10000;
                setExchangeRates(prev => ({ ...prev, [cacheKey]: roundedRate }));
                return roundedRate;
              }
            }
           } catch {
           }

          const fallback = {
            'BRL_USD': 0.18, 'USD_BRL': 5.52,
            'ARS_USD': 0.0012, 'USD_ARS': 850,
            'EUR_USD': 1.09, 'USD_EUR': 0.92,
            'GBP_USD': 1.28, 'USD_GBP': 0.78,
            'MXN_USD': 0.052, 'USD_MXN': 19.2,
            'CLP_USD': 0.0011, 'USD_CLP': 910,
            'COP_USD': 0.00025, 'USD_COP': 4000,
            'PEN_USD': 0.27, 'USD_PEN': 3.7,
            'ARS_BRL': 0.0036, 'BRL_ARS': 280
          };

          const direct = fallback[`${cleanFrom}_${cleanTo}`];
          if (direct) return direct;
          const reverse = fallback[`${cleanTo}_${cleanFrom}`];
          if (reverse) return 1 / reverse;
          const fUsd = fallback[`${cleanFrom}_USD`];
          const uTo = fallback[`USD_${cleanTo}`];
          if (fUsd && uTo) return fUsd * uTo;

          return 1;
        })();

        pendingFetches.current[cacheKey] = fetchPromise;
        return await fetchPromise;
      } catch {
        delete pendingFetches.current[cacheKey];
        return 1;
      }
     };

    const convertAmount = async (amount, from, to, date) => {
     if (from === to) return Math.round(amount * 100) / 100;
     const rate = await fetchExchangeRate(date, from, to);
     if (!rate) {
       return Math.round(amount * 100) / 100;
     }
     const converted = amount * rate;
     return Math.round(converted * 100) / 100;
   };
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('balances_theme') || 'dark');
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('balances_lang');
    return saved === 'en' || saved === 'es' ? saved : 'es';
  });

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
  const t = (key) => (translations[language] && translations[language][key]) || key;

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

  const sendPasswordReset = async (email) => {
    try {
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyResetCode = async (code) => {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return { success: true, email };
    } catch (error) {
      return { success: false, error: error.code || error.message };
    }
  };

  const confirmPasswordResetCode = async (code, newPassword) => {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

   const addTransaction = async (tx) => {
     if (!currentUser) return;
     try {
       await addDoc(collection(db, 'transactions'), {
         ...tx,
         userId: currentUser.id,
         createdAt: new Date().toISOString()
       });
     } catch {
       // ignore
     }
   };

   const deleteTransaction = async (id) => {
     try {
       await deleteDoc(doc(db, 'transactions', id));
     } catch {
       // ignore
     }
   };

   const updateTransaction = async (updatedTx) => {
     try {
       const { id, userId, createdAt, ...data } = updatedTx;
       if (!id) return;
       await updateDoc(doc(db, 'transactions', id), data);
     } catch {
       // ignore
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
      convertAmount,
      sendPasswordReset,
      verifyResetCode,
      confirmPasswordResetCode
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
