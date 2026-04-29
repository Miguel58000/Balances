import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  PieChart as PieIcon,
  Filter,
  ChevronDown
} from 'lucide-react';
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
  const { transactions, currentUser, t, language } = useApp();
  const [period, setPeriod] = useState('month'); // month, quarter, semester, year

  // Calculate filtered stats based on period
  const stats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);
    else if (period === 'semester') startDate.setMonth(now.getMonth() - 6);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const filtered = transactions.filter(tx => new Date(tx.date) >= startDate);
    
    const income = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    
    const mapCategories = (type) => {
      const map = {};
      filtered.filter(tx => tx.type === type).forEach(tx => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
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

    const expenseChartData = mapCategories('expense');
    const incomeChartData = mapCategories('income');

    return { 
      income, 
      expense, 
      balance: income - expense, 
      expenseChartData, 
      incomeChartData 
    };
  }, [transactions, period, t]);

  // Overall totals for quick view cards
  const calculateTotal = (months) => {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - months);
    const filtered = transactions.filter(tx => new Date(tx.date) >= startDate);
    const inc = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const exp = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return inc - exp;
  };

  const periodBalances = {
    month: stats.balance,
    quarter: calculateTotal(3),
    semester: calculateTotal(6),
    year: calculateTotal(12)
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: '4px' }}>{t('controlPanel')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('overview')}</p>
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
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  background: period === p.id ? 'var(--primary)' : 'transparent',
                  color: period === p.id ? 'white' : 'var(--text-muted)',
                }}
              >
                {p.label}
              </button>
            ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '40px' 
      }}>
        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--success)', filter: 'blur(60px)', opacity: 0.1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('income')} {period === 'month' ? t('thisMonth') : ''}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            $ {stats.income.toLocaleString()}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--danger)', filter: 'blur(60px)', opacity: 0.1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{t('expenses')} {period === 'month' ? t('thisMonth') : ''}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            $ {stats.expense.toLocaleString()}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={24} />
            </div>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t('netBalance')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            $ {stats.balance.toLocaleString()}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Expenses Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <PieIcon size={20} color="var(--danger)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('byCategory')}</h3>
          </div>
          
          <div style={{ height: '360px', width: '100%' }}>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {t('noData')}
              </div>
            )}
          </div>
        </div>

        {/* Income Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <PieIcon size={20} color="var(--success)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('incomeByCategory')}</h3>
          </div>
          
          <div style={{ height: '360px', width: '100%' }}>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {t('noData')}
              </div>
            )}
          </div>
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
                  {language === 'es' ? `Balance ${p.label}` : `${p.label} Balance`}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    color: periodBalances[p.id] >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {periodBalances[p.id] >= 0 ? '+' : ''}$ {periodBalances[p.id].toLocaleString()}
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
