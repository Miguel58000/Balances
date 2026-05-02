import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { CURRENCIES } from '../constants/currencies';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e'];

const Dashboard = () => {
  const { transactions, currentUser, t, language, displayCurrency, setDisplayCurrency, convertAmount } = useApp();
  const [period, setPeriod] = useState('month'); // month, quarter, semester, year
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubPeriod, setSelectedSubPeriod] = useState(Math.ceil((new Date().getMonth() + 1) / 3)); // Current Quarter
  const [convertedTransactions, setConvertedTransactions] = useState([]);
  const [isConverting, setIsConverting] = useState(false);

  // Handle conversion of all transactions to the display currency
  useEffect(() => {
    const processTransactions = async () => {
      setIsConverting(true);
      const converted = await Promise.all(transactions.map(async (tx) => {
        const convertedAmount = await convertAmount(tx.amount, tx.currency, displayCurrency, tx.date);
        return { ...tx, displayAmount: convertedAmount };
      }));
      setConvertedTransactions(converted);
      setIsConverting(false);
    };

    processTransactions();
  }, [transactions, displayCurrency]);

  // Calculate filtered stats based on convertedTransactions
  const stats = useMemo(() => {
    // Aseguramos que solo se calculen estadísticas cuando todas las transacciones estén convertidas
    if (isConverting || (transactions.length > 0 && convertedTransactions.length !== transactions.length)) return null;

    let startDate, endDate;
    const txs = convertedTransactions;

    if (period === 'month') {
      const [year, month] = viewDate.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else if (period === 'quarter') {
      startDate = new Date(selectedYear, (selectedSubPeriod - 1) * 3, 1);
      endDate = new Date(selectedYear, selectedSubPeriod * 3, 0, 23, 59, 59);
    } else if (period === 'semester') {
      const sem = Math.min(selectedSubPeriod, 2); // Ensure it's 1 or 2
      startDate = new Date(selectedYear, (sem - 1) * 6, 1);
      endDate = new Date(selectedYear, sem * 6, 0, 23, 59, 59);
    } else { // year
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
    }

    const filtered = txs.filter(tx => {
      const d = new Date(tx.date);
      return d >= startDate && d <= endDate;
    });

    const income = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.displayAmount, 0);
    const expense = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.displayAmount, 0);

    // Savings Rate based on SALARY vs TOTAL EXPENSES (as requested)
    const salaryIncome = filtered.filter(tx => tx.type === 'income' && tx.category === 'Salary').reduce((sum, tx) => sum + tx.displayAmount, 0);

    const count = filtered.length;
    const avg = income > 0 || expense > 0 ? (income - expense) / (period === 'year' ? 12 : period === 'semester' ? 6 : period === 'quarter' ? 3 : 1) : 0;
    const savingsRate = salaryIncome > 0 ? ((salaryIncome - expense) / salaryIncome) * 100 : 0;

    const mapCategories = (data, type) => {
      const map = {};
      data.filter(tx => tx.type === type).forEach(tx => {
        map[tx.category] = (map[tx.category] || 0) + tx.displayAmount;
      });
      return Object.entries(map)
        .map(([name, value]) => ({
          name: {
            'Food': t('cat_food'),
            'Transport': t('cat_transport'),
            'Housing': t('cat_housing'),
            'Services': t('cat_services'),
            'Entertainment': t('cat_entertainment'),
            'Health': t('cat_health'),
            'Education': t('cat_education'),
            'Salary': t('cat_salary'),
            'Sales': t('cat_sales'),
            'Investment': t('cat_investment'),
            'Gift': t('cat_gift'),
            'Others': t('others')
          }[name] || name,
          value
        }))
        .sort((a, b) => b.value - a.value);
    };

    return {
      income,
      expense,
      balance: income - expense,
      count,
      avg,
      savingsRate,
      expenseChartData: mapCategories(filtered, 'expense'),
      incomeChartData: mapCategories(filtered, 'income')
    };
  }, [convertedTransactions, isConverting, transactions, period, viewDate, selectedYear, selectedSubPeriod, t, displayCurrency]);

  // Fixed totals for the Historical Summary (always relative to today)
  const calculateFixedTotal = (months) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);
    const txs = convertedTransactions.length === transactions.length ? convertedTransactions : [];

    const filtered = txs.filter(tx => new Date(tx.date) >= startDate);
    const inc = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.displayAmount, 0);
    const exp = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.displayAmount, 0);
    return inc - exp;
  };

  const periodBalances = {
    month: calculateFixedTotal(1),
    quarter: calculateFixedTotal(3),
    semester: calculateFixedTotal(6),
    year: calculateFixedTotal(12)
  };

  const getTitleDate = () => {
    const dateStr = period === 'month'
      ? new Date(viewDate + '-02').toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })
      : period === 'quarter' ? `T${selectedSubPeriod} ${selectedYear}`
        : period === 'semester' ? `S${selectedSubPeriod} ${selectedYear}`
          : `${selectedYear}`;

    return dateStr;
  };

  if (!stats) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ color: 'var(--primary)' }}
        >
          <RefreshCw size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>
            {t('controlPanel')} - {getTitleDate()}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('overview')}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Currency Selector */}
          <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px', alignItems: 'center', gap: '8px' }}>
            {isConverting && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ marginLeft: '8px', color: 'var(--primary)', display: 'flex' }}
              >
                <RefreshCw size={14} />
              </motion.div>
            )}
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              className="input-control currency-select"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 12px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: '#1a1a1a', color: 'white' }}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px', gap: '8px' }}>
            {period === 'month' ? (
              <input
                type="month"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
                className="input-control"
                style={{ background: 'transparent', border: 'none', padding: '6px 12px', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-control"
                  style={{ width: '100px', background: 'transparent', border: 'none', textAlign: 'center', color: 'var(--text-main)', fontWeight: 'bold' }}
                />
                {(period === 'quarter' || period === 'semester') && (
                  <select
                    value={selectedSubPeriod}
                    onChange={(e) => setSelectedSubPeriod(parseInt(e.target.value))}
                    className="input-control"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 'bold' }}
                  >
                    {period === 'quarter' ? [1, 2, 3, 4].map(q => (
                      <option key={q} value={q} style={{ background: 'var(--bg-card)' }}>T{q}</option>
                    )) : [1, 2].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>S{s}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="glass" style={{
            display: 'flex',
            padding: '6px',
            borderRadius: '14px',
            gap: '4px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {[
              { id: 'month', label: t('monthly') },
              { id: 'quarter', label: t('quarterly') },
              { id: 'semester', label: t('semiannual') },
              { id: 'year', label: t('annual') }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className="btn"
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  background: period === p.id ? 'var(--primary)' : 'transparent',
                  color: period === p.id ? 'white' : 'var(--text-muted)',
                  minWidth: 'auto',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* 1. Ingresos */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
              {t('income')}
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {displayCurrency} {stats.income.toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* 2. Gastos */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
              {t('expenses')}
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {displayCurrency} {stats.expense.toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* 3. Balance Neto */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('netBalance')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {stats.balance >= 0 ? '+' : ''}{displayCurrency} {stats.balance.toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* 4. Promedio Mensual */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChartIcon size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('monthlyAvg')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {displayCurrency} {Math.round(stats.avg).toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* 5. Tasa de Ahorro */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('savingsRate')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
             {stats.savingsRate.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </div>
        </div>

        {/* 6. Total Movimientos */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('transactions')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {stats.count}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         {/* Expenses Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <PieChartIcon size={20} color="var(--danger)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('byCategory')}</h3>
          </div>

          <div style={{ height: '360px', width: '100%', minHeight: '360px' }}>
            {stats.expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                  >
                    {stats.expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--text-main)'
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {t('noData')}
              </div>
            )}
          </div>

          {stats.expenseChartData.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.expenseChartData.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[index % COLORS.length] }} />
                    <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                     {displayCurrency} {item.value.toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2 })} ({stats.expense > 0 ? ((item.value / stats.expense) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

         {/* Income Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <PieChartIcon size={20} color="var(--success)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('incomeByCategory')}</h3>
          </div>

          <div style={{ height: '360px', width: '100%', minHeight: '360px' }}>
            {stats.incomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.incomeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                  >
                    {stats.incomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--text-main)'
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {t('noData')}
              </div>
            )}
          </div>

          {stats.incomeChartData.length > 0 && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.incomeChartData.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[(index + 3) % COLORS.length] }} />
                    <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                     {displayCurrency} {item.value.toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2 })} ({stats.income > 0 ? ((item.value / stats.income) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical Balances */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Calendar size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('historical')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'month', label: t('monthly'), sub: t('last30') },
              { id: 'quarter', label: t('quarterly'), sub: t('last3') },
              { id: 'semester', label: t('semiannual'), sub: t('last6') },
              { id: 'year', label: t('annual'), sub: t('last12') }
            ].map(p => (
              <div key={p.id} className="glass" style={{
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '500' }}>
                  {t('balanceOf')} {p.label}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: periodBalances[p.id] >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {periodBalances[p.id] >= 0 ? '+' : ''}{displayCurrency} {periodBalances[p.id].toLocaleString('es-AR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {p.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
