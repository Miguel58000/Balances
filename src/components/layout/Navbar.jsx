import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ReceiptText, LogOut, Sun, Moon, Languages } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout, theme, toggleTheme, language, toggleLanguage, t } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-glass)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}>
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          textDecoration: 'none',
          color: 'var(--text-main)',
          fontWeight: '700',
          fontSize: '1.4rem'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>B</div>
          Balances
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/" className={`btn ${location.pathname === '/' ? 'btn-primary' : ''}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              background: location.pathname === '/' ? 'var(--primary)' : 'transparent',
              color: location.pathname === '/' ? 'white' : 'var(--text-main)'
            }}>
              <LayoutDashboard size={18} />
              <span className="nav-text">{t('dashboard')}</span>
            </Link>
            <Link to="/transactions" className={`btn ${location.pathname === '/transactions' ? 'btn-primary' : ''}`} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              background: location.pathname === '/transactions' ? 'var(--primary)' : 'transparent',
              color: location.pathname === '/transactions' ? 'white' : 'var(--text-main)'
            }}>
              <ReceiptText size={18} />
              <span className="nav-text">{t('transactions')}</span>
            </Link>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="btn"
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              <Languages size={18} />
              {language.toUpperCase()}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="btn"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                color: theme === 'dark' ? 'var(--warning)' : 'var(--primary)'
              }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="profile-box">
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('hello')}, {currentUser.name.split(' ')[0]} <span style={{ fontSize: '1rem' }}>👋</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>{currentUser.email}</div>
            </div>
            
            <button onClick={logout} className="btn" style={{ 
              color: 'var(--danger)', 
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
