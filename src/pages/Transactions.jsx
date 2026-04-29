import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2,
  ArrowUpRight, 
  ArrowDownLeft,
  X,
  Calendar,
  Tag,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import TransactionForm from '../components/transactions/TransactionForm';

const Transactions = () => {
  const { transactions, deleteTransaction, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  const categoryOptions = useMemo(() => {
    const baseExpense = ['Food', 'Transport', 'Housing', 'Services', 'Entertainment', 'Health', 'Education'];
    const baseIncome = ['Salary', 'Sales', 'Investment', 'Gift'];
    
    // Get custom categories from transactions
    const customCats = transactions
      .filter(tx => {
        const isDefault = [...baseExpense, ...baseIncome].includes(tx.category);
        const matchesType = filters.type === 'all' || tx.type === filters.type;
        return !isDefault && matchesType;
      })
      .map(tx => tx.category);
    
    const uniqueCustom = [...new Set(customCats)];

    let currentBase = [];
    if (filters.type === 'expense') currentBase = baseExpense;
    else if (filters.type === 'income') currentBase = baseIncome;
    else currentBase = [...baseExpense, ...baseIncome];

    return [
      { id: 'all', label: t('all') },
      ...currentBase.map(id => ({ id, label: t(`cat_${id.toLowerCase()}`) || id })),
      ...uniqueCustom.map(id => ({ id, label: id })),
      { id: 'Others', label: t('others') }
    ];
  }, [filters.type, transactions, t]);

  const typeOptions = [
    { id: 'all', label: t('all') },
    { id: 'income', label: t('income') },
    { id: 'expense', label: t('expenses') }
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filters.type === 'all' || t.type === filters.type;
      const matchCategory = filters.category === 'all' || t.category === filters.category;
      const matchSearch = t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          t.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const tDate = new Date(t.date);
      const matchStart = !filters.startDate || tDate >= new Date(filters.startDate);
      const matchEnd = !filters.endDate || tDate <= new Date(filters.endDate);

      return matchType && matchCategory && matchSearch && matchStart && matchEnd;
    });
  }, [transactions, filters]);

  const getCategoryLabel = (catId) => {
    const cat = categoryOptions.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  const getTypeLabel = (typeId) => {
    const type = typeOptions.find(t => t.id === typeId);
    return type ? type.label : typeId;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>{t('transactions')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('overview')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} />
          {t('newTransaction')}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px',
          alignItems: 'flex-end'
        }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>{t('search')}</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: '36px' }}
                placeholder={`${t('search')}...`}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>{t('type')}</label>
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
                  onClick={() => setShowTypeMenu(!showTypeMenu)}
                >
                  <span>{getTypeLabel(filters.type)}</span>
                  <ChevronDown size={18} style={{ 
                    transform: showTypeMenu ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s' 
                  }} />
                </button>

                <AnimatePresence>
                  {showTypeMenu && (
                    <>
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: 100 }} 
                        onClick={() => setShowTypeMenu(false)} 
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
                          padding: '8px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        {typeOptions.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            className="btn-option"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              background: filters.type === opt.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              color: filters.type === opt.id ? 'var(--primary)' : 'var(--text-main)',
                              fontSize: '0.9rem',
                              marginBottom: '2px',
                              border: 'none',
                              display: 'block',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setFilters({ ...filters, type: opt.id, category: 'all' });
                              setShowTypeMenu(false);
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
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
                  <span>{getCategoryLabel(filters.category)}</span>
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
                          maxHeight: '300px',
                          overflowY: 'auto',
                          padding: '8px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        {categoryOptions.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            className="btn-option"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              background: filters.category === cat.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              color: filters.category === cat.id ? 'var(--primary)' : 'var(--text-main)',
                              fontSize: '0.9rem',
                              marginBottom: '2px',
                              border: 'none',
                              display: 'block',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setFilters({ ...filters, category: cat.id });
                              setShowCatMenu(false);
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
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>{t('dateRange')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="date"
                className="input-control"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <input
                type="date"
                className="input-control"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setFilters({
                  type: 'all',
                  category: 'all',
                  startDate: '',
                  endDate: '',
                  search: ''
                });
                setShowTypeMenu(false);
                setShowCatMenu(false);
              }}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
                padding: '12px',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              title={t('clearFilters')}
            >
              <RotateCcw size={16} />
              <span style={{ fontSize: '0.9rem' }}>{t('clearFilters')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card" style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: '600' }}>{t('results')} ({filteredTransactions.length})</h3>
        </div>

        <div style={{ maxHeight: '600px', overflow: 'auto' }}>
          {filteredTransactions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500' }}>{t('detail')}</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500' }}>{t('category')}</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500' }}>{t('date')}</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500' }}>{t('amount')}</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '500' }}></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTransactions.map((t) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ borderBottom: '1px solid var(--border-glass)' }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{t.title}</div>
                            {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          background: 'rgba(255,255,255,0.05)', 
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}>
                          {getCategoryLabel(t.category)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' 
                        }}>
                          {t.type === 'income' ? '+' : '-'}$ {t.amount.toLocaleString()}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>{t.currency}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => {
                              setEditingTransaction(t);
                              setShowForm(true);
                            }}
                            style={{ background: 'none', color: 'var(--text-dim)' }}
                            className="hover-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            style={{ background: 'none', color: 'var(--text-dim)' }}
                            className="hover-danger"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
              {t('noTransactions')}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '80px 20px',
            overflowY: 'auto'
          }}>
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <TransactionForm 
                transactionToEdit={editingTransaction}
                onClose={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                }} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-danger:hover { color: var(--danger) !important; transform: scale(1.1); transition: all 0.2s; }
        .hover-primary:hover { color: var(--primary) !important; transform: scale(1.1); transition: all 0.2s; }
      `}} />
    </div>
  );
};

export default Transactions;
