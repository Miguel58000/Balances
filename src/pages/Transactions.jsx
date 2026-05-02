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
import { CURRENCIES } from '../constants/currencies';

const Transactions = () => {
  const { transactions, deleteTransaction, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedId, setExpandedId] = useState(null);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showCurMenu, setShowCurMenu] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    currency: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    return transactions.filter(tx => {
      const matchType = filters.type === 'all' || tx.type === filters.type;
      const matchCategory = filters.category === 'all' || tx.category === filters.category;
      const matchCurrency = filters.currency === 'all' || tx.currency === filters.currency;
      const matchSearch = tx.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tx.description || '').toLowerCase().includes(filters.search.toLowerCase());

      const txDate = new Date(tx.date);
      const matchStart = !filters.startDate || txDate >= new Date(filters.startDate);
      const matchEnd = !filters.endDate || txDate <= new Date(filters.endDate);

      return matchType && matchCategory && matchCurrency && matchSearch && matchStart && matchEnd;
    });
  }, [transactions, filters]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Si pasamos a escritorio, cerramos cualquier detalle abierto
      if (!mobile) setExpandedId(null);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getCategoryLabel = (catId) => {
    const cat = categoryOptions.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  const getTypeLabel = (typeId) => {
    const type = typeOptions.find(t => t.id === typeId);
    return type ? type.label : typeId;
  };

  return (
    <div className="animate-fade-in page-container">
      <div className="page-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>{t('transactions')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('overview')}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} />
          <span>{t('newTransaction')}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card filters-bar" style={{ padding: '24px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
        <div className="filters-grid">
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

          <div className="type-category-filters">
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
                          maxHeight: '250px',
                          overflowY: 'auto',
                          padding: '8px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-glass)',
                          minWidth: '250px',
                          maxWidth: '90vw'
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
                setShowCurMenu(false);
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
                  currency: 'all',
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
            <div className="input-group" style={{ marginBottom: 0 }}>
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
                  <span>{filters.currency === 'all' ? t('all') : filters.currency}</span>
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
                          overflowY: 'auto',
                          padding: '8px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-glass)',
                          minWidth: '250px',
                          maxWidth: '90vw'
                        }}
                      >
                        {[
                          { id: 'all', label: t('all') },
                          ...CURRENCIES.map(c => ({ id: c.code, label: `${c.code} - ${c.name}` }))
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            className="btn-option"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              background: filters.currency === opt.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              color: filters.currency === opt.id ? 'var(--primary)' : 'var(--text-main)',
                              fontSize: '0.9rem',
                              marginBottom: '2px',
                              border: 'none',
                              display: 'block',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setFilters({ ...filters, currency: opt.id });
                              setShowCurMenu(false);
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
          </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card transactions-list-card" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: '600' }}>{t('results')} ({filteredTransactions.length})</h3>
        </div>

        <div style={{ maxHeight: '600px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {filteredTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead className="transactions-table-header">
                <tr>
                  <th className="table-header-cell">{t('title')}</th>
                  <th className="table-header-cell">{t('category')}</th>
                  <th className="table-header-cell">{t('date')}</th>
                  <th className="table-header-cell amount-header">{t('amount')}</th>
                  <th className="table-header-cell actions-header"></th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`transaction-row ${expandedId === transaction.id ? 'expanded' : ''}`}
                      onClick={() => {
                        if (isMobile) {
                          setExpandedId(expandedId === transaction.id ? null : transaction.id);
                        }
                      }}
                    >
                      <td className="transaction-detail-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="transaction-icon" style={{
                            width: '40px', // Default size
                            height: '40px', // Default size
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {transaction.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <div className="transaction-title">{transaction.title}</div>
                            {transaction.description && <div className="transaction-description">{transaction.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="transaction-category-cell">
                        <span className="transaction-category-pill" style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)'
                        }}>
                          {getCategoryLabel(transaction.category)}
                        </span>
                      </td>
                      <td className="transaction-date-cell">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="transaction-amount-cell">
                        <div className="transaction-amount" style={{
                          fontWeight: '700',
                          color: transaction.type === 'income' ? 'var(--success)' : 'var(--text-main)'
                        }}>
                           {transaction.type === 'income' ? '+' : '-'}$ {transaction.amount.toLocaleString('es-AR', { useGrouping: true, minimumFractionDigits: 2 })}
                          <span className="transaction-currency">{transaction.currency}</span>
                        </div>
                      </td>
                      <td className="transaction-actions-cell">
                        <div className="transaction-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que se expanda/colapse la fila
                              setEditingTransaction(transaction);
                              setShowForm(true);
                            }}
                            style={{ background: 'none', color: 'var(--text-dim)' }}
                            className="hover-primary"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTransaction(transaction.id); }}
                            style={{ background: 'none', color: 'var(--text-dim)' }}
                            className="hover-danger"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {expandedId === transaction.id && (
                        <motion.tr
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mobile-detail-row"
                          style={{ overflow: 'hidden' }}
                        >
                          <td colSpan={5}>
                            <div className="mobile-detail-content">
                              {transaction.description && (
                                <div className="mobile-detail-item" style={{ flexDirection: 'column', gap: '4px' }}>
                                  <strong>{t('description')}:</strong>
                                  <span style={{ color: 'var(--text-dim)' }}>{transaction.description}</span>
                                </div>
                              )}
                              <div className="mobile-detail-item">
                                <strong>{t('category')}:</strong>
                                <span>{getCategoryLabel(transaction.category)}</span>
                              </div>
                              <div className="mobile-detail-item">
                                <strong>{t('date')}:</strong>
                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                              </div>
                              <div className="mobile-detail-actions">
                                <button onClick={(e) => { e.stopPropagation(); setEditingTransaction(transaction); setShowForm(true); }} className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', flex: 1, gap: '8px' }}>
                                  <Edit2 size={16} /> {t('edit')}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); deleteTransaction(transaction.id); }} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', flex: 1, gap: '8px' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
              {t('noTransactions')}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls" style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid var(--border-glass)'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="btn"
              style={{ padding: '8px 16px', opacity: currentPage === 1 ? 0.3 : 1, minWidth: 'auto' }}
            >
              &laquo;
            </button>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentPage === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: currentPage === i + 1 ? 'white' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="btn"
              style={{ padding: '8px 16px', opacity: currentPage === totalPages ? 0.3 : 1, minWidth: 'auto' }}
            >
              &raquo;
            </button>
          </div>
        )}
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
            <div className="modal-content" style={{ width: '100%', maxWidth: '500px' }}>
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

      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-danger:hover { color: var(--danger) !important; transform: scale(1.1); transition: all 0.2s; }
        .hover-primary:hover { color: var(--primary) !important; transform: scale(1.1); transition: all 0.2s; }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .page-header > div { order: 1; }
          .page-header > button { 
            order: 2; 
            width: 100%;
            justify-content: center;
          }
          .page-header > button span { display: inline !important; }
          .section-title { font-size: 1.5rem !important; }
          .page-header p { display: block !important; }
          
          .transaction-row { cursor: pointer; }
          .transaction-row.expanded { background: rgba(255,255,255,0.05); }
          .mobile-detail-row td { padding: 0 !important; border-bottom: 1px solid var(--border-glass); }
        }

        /* Responsive styles for Transactions page */

        /* Filters Bar */
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          align-items: flex-end;
        }

        .type-category-filters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr; /* Stack filters vertically on small screens */
          }
          .type-category-filters {
            grid-template-columns: 1fr; /* Stack type and category vertically */
          }
        }

        /* Transactions Table */
        .transactions-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          /* min-width: 700px; */ /* Removed fixed min-width to allow shrinking */
        }

        .transactions-table-header {
          background: rgba(255,255,255,0.02);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .table-header-cell {
          text-align: left;
          padding: 16px 24px;
          color: var(--text-dim);
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap; /* Prevent header text wrapping */
        }

        .amount-header { text-align: right; }
        .actions-header { text-align: center; }

        .transaction-row {
          border-bottom: 1px solid var(--border-glass);
        }

        .transaction-detail-cell,
        .transaction-category-cell,
        .transaction-date-cell,
        .transaction-amount-cell,
        .transaction-actions-cell {
          padding: 16px 24px;
          white-space: nowrap; /* Prevent text wrapping in cells by default */
        }

        .transaction-date-cell { color: var(--text-muted); font-size: 0.9rem; }
        .transaction-amount-cell { text-align: right; }
        .transaction-actions-cell { text-align: center; }

        .transaction-title { font-weight: 600; }
        .transaction-description { font-size: 0.8rem; color: var(--text-dim); }
        .transaction-category-pill { padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); font-size: 0.85rem; color: var(--text-muted); }
        .transaction-amount { font-weight: 700; }
        .transaction-currency { font-size: 0.75rem; color: var(--text-dim); margin-left: 4px; }

        .mobile-detail-content {
          padding: 16px;
          background: rgba(255,255,255,0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-detail-item { display: flex; justify-content: space-between; font-size: 0.85rem; }
        .mobile-detail-item strong { color: var(--text-dim); }
        .mobile-detail-actions {
          display: flex;
          justify-content: space-around;
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .transaction-category-cell, 
          .transaction-date-cell, 
          .transaction-actions-cell,
          .transaction-description,
          .table-header-cell:nth-child(2),
          .table-header-cell:nth-child(3),
          .actions-header {
            display: none !important;
          }

          .table-header-cell,
          .transaction-detail-cell,
          .transaction-category-cell,
          .transaction-date-cell,
          .transaction-amount-cell,
          .transaction-actions-cell {
            padding: 12px 16px; /* Reduce padding on smaller screens */
            font-size: 0.9rem;
          }

          .transaction-icon {
            width: 32px !important;
            height: 32px !important;
          }

          .transaction-title {
            font-size: 0.95rem;
          }

          .transaction-description {
            display: none; /* Hide description on small screens to save space */
          }

          .transaction-category-pill {
            font-size: 0.8rem;
            padding: 2px 8px;
          }

          .transaction-amount {
            font-size: 0.95rem;
          }

          .transaction-currency {
            font-size: 0.7rem;
          }

          .transaction-actions button {
            padding: 4px !important;
          }
        }

        @media (max-width: 480px) {
          .table-header-cell,
          .transaction-detail-cell,
          .transaction-category-cell,
          .transaction-date-cell,
          .transaction-amount-cell,
          .transaction-actions-cell {
            padding: 8px 12px; /* Further reduce padding on very small screens */
            font-size: 0.8rem;
          }

          .transaction-icon {
            width: 28px !important;
            height: 28px !important;
          }

          .transaction-title {
            font-size: 0.9rem;
          }

          .transaction-category-pill {
            font-size: 0.75rem;
          }

          .transaction-amount {
            font-size: 0.9rem;
          }

          .transaction-currency {
            font-size: 0.65rem;
          }
        }

        /* Modal responsiveness */
        .modal-overlay {
          align-items: center; /* Center modal vertically on smaller screens */
          padding: 20px; /* Add some padding around the modal */
        }

        .modal-content {
          max-width: 90%; /* Allow modal to take more width on small screens */
          padding: 24px !important; /* Adjust padding inside modal */
        }
      `}} />
    </div>
  );
};

export default Transactions;
