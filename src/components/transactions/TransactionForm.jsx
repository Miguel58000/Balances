import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, DollarSign, Tag, FileText, Calendar, ChevronDown } from 'lucide-react';

const TransactionForm = ({ onClose, transactionToEdit }) => {
  const { addTransaction, updateTransaction, transactions, t, language } = useApp();
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showCurMenu, setShowCurMenu] = useState(false);
  const [curSearch, setCurSearch] = useState('');
  const [formData, setFormData] = useState(transactionToEdit ? {
    ...transactionToEdit,
    amount: transactionToEdit.amount.toString()
  } : {
    title: '',
    amount: '',
    currency: 'ARS',
    category: '',
    description: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState('');

  const currencies = [
    { code: 'ARS', name: t('currency_ars'), symbol: '$' },
    { code: 'USD', name: t('currency_usd'), symbol: 'u$s' },
    { code: 'EUR', name: t('currency_eur'), symbol: '€' },
    { code: 'BRL', name: t('currency_brl'), symbol: 'R$' },
    { code: 'CLP', name: t('currency_clp'), symbol: '$' },
    { code: 'UYU', name: t('currency_uyu'), symbol: '$' },
    { code: 'COP', name: t('currency_cop'), symbol: '$' },
    { code: 'MXN', name: t('currency_mxn'), symbol: '$' },
    { code: 'GBP', name: t('currency_gbp'), symbol: '£' },
    { code: 'JPY', name: t('currency_jpy'), symbol: '¥' },
    { code: 'CNY', name: t('currency_cny'), symbol: '¥' },
    { code: 'CHF', name: t('currency_chf'), symbol: 'Fr' },
    { code: 'CAD', name: t('currency_cad'), symbol: '$' },
    { code: 'AUD', name: t('currency_aud'), symbol: '$' }
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(curSearch.toLowerCase()) || 
    c.name.toLowerCase().includes(curSearch.toLowerCase())
  );

  const categories = useMemo(() => {
    const baseExpense = ['Food', 'Transport', 'Housing', 'Services', 'Entertainment', 'Health', 'Education'];
    const baseIncome = ['Salary', 'Sales', 'Investment', 'Gift'];
    
    // Get custom categories from transactions of this type
    const customCats = transactions
      .filter(tx => {
        const isDefault = [...baseExpense, ...baseIncome].includes(tx.category);
        return !isDefault && tx.type === formData.type;
      })
      .map(tx => tx.category);
    
    const uniqueCustom = [...new Set(customCats)];
    const currentBase = formData.type === 'expense' ? baseExpense : baseIncome;

    return [
      ...currentBase.map(id => ({ id, label: t(`cat_${id.toLowerCase()}`) || id })),
      ...uniqueCustom.map(id => ({ id, label: id })),
      { id: 'Others', label: t('others') }
    ];
  }, [formData.type, transactions, t]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) return setError(t('specify'));
    if (parseFloat(formData.amount) <= 0 || isNaN(parseFloat(formData.amount))) return setError(t('invalidAmount'));
    
    const finalData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: formData.category === 'Others' ? (customCategory || t('others')) : formData.category
    };

    if (transactionToEdit) {
      updateTransaction(finalData);
    } else {
      addTransaction(finalData);
    }
    
    if (onClose) onClose();
  };

  const getCategoryLabel = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{ padding: '32px', width: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          {transactionToEdit ? t('editTransaction') : t('newTransaction')}
        </h2>
        {onClose && (
          <button onClick={onClose} className="btn" style={{ padding: '8px' }}>
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="input-group" style={{ flexDirection: 'row', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            className="btn"
            style={{
              flex: 1,
              background: formData.type === 'expense' ? 'var(--danger)' : 'transparent',
              color: formData.type === 'expense' ? 'white' : 'var(--text-muted)'
            }}
          >
            {t('expenses')}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            className="btn"
            style={{
              flex: 1,
              background: formData.type === 'income' ? 'var(--success)' : 'transparent',
              color: formData.type === 'income' ? 'white' : 'var(--text-muted)'
            }}
          >
            {t('income')}
          </button>
        </div>

        <div className="input-group">
          <label>{t('title')}</label>
          <div style={{ position: 'relative' }}>
            <FileText size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '32px' }}
              placeholder={t('title')}
              required
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setError('');
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label>{t('amount')}</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="number"
                className="input-control no-spinner"
                style={{ paddingLeft: '32px' }}
                placeholder="0.00"
                required
                min="0.01"
                step="any"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  setError('');
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label>{t('currency')}</label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="input-control"
                style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingLeft: '16px'
                }}
                onClick={() => setShowCurMenu(!showCurMenu)}
              >
                <span>{formData.currency}</span>
                <ChevronDown size={18} style={{ 
                  transform: showCurMenu ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.3s' 
                }} />
              </button>

              <AnimatePresence>
                {showCurMenu && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 100 }} 
                      onClick={() => setShowCurMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="glass-card"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        zIndex: 110,
                        maxHeight: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '8px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-glass)'
                      }}
                    >
                      <input
                        type="text"
                        className="input-control"
                        placeholder={`${t('search')}...`}
                        style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '8px' }}
                        value={curSearch}
                        onChange={(e) => setCurSearch(e.target.value)}
                        autoFocus
                      />
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filteredCurrencies.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            className="btn-option"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: formData.currency === c.code ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              color: formData.currency === c.code ? 'var(--primary)' : 'var(--text-main)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '2px'
                            }}
                            onClick={() => {
                              setFormData({ ...formData, currency: c.code });
                              setShowCurMenu(false);
                              setCurSearch('');
                            }}
                          >
                            <span style={{ fontSize: '0.9rem' }}><b>{c.code}</b> - {c.name}</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="input-group">
          <label>{t('category')}</label>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="input-control"
              style={{ 
                textAlign: 'left', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingLeft: '16px'
              }}
              onClick={() => setShowCatMenu(!showCatMenu)}
            >
              <span style={{ color: formData.category ? 'var(--text-main)' : 'var(--text-dim)' }}>
                {formData.category ? getCategoryLabel(formData.category) : t('category')}
              </span>
              <ChevronDown size={18} style={{ 
                transform: showCatMenu ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.3s' 
              }} />
            </button>

              <AnimatePresence>
                {showCatMenu && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 100 }} 
                      onClick={() => setShowCatMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="glass-card"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        zIndex: 110,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        padding: '8px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-glass)'
                      }}
                    >
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          className="btn-option"
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: formData.category === cat.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: formData.category === cat.id ? 'var(--primary)' : 'var(--text-main)',
                            fontSize: '0.95rem',
                            marginBottom: '2px',
                            display: 'block',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            setFormData({ ...formData, category: cat.id });
                            setShowCatMenu(false);
                            setError('');
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
          </div>
        </div>

        <div className="input-group">
          <label>{t('date')}</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="date"
              className="input-control"
              style={{ paddingLeft: '32px' }}
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <AnimatePresence>
          {formData.category === 'Others' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="input-group"
            >
              <label>{t('specify')} ({t('optional')})</label>
              <input
                type="text"
                className="input-control"
                placeholder="..."
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setError('');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

        <div className="input-group">
          <label>{t('description')}</label>
          <textarea
            className="input-control"
            style={{ minHeight: '80px', paddingTop: '10px' }}
            placeholder="..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn" 
            style={{ flex: 1, border: '1px solid var(--border-glass)' }}
          >
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '14px' }}>
            {transactionToEdit ? t('saveChanges') : t('save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TransactionForm;
