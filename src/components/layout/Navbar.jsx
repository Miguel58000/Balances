import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ReceiptText, LogOut, Sun, Moon, Languages, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { currentUser, logout, theme, toggleTheme, language, toggleLanguage, t } = useApp();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser) return null;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link 
        to="/" 
        className={`btn ${location.pathname === '/' ? 'btn-primary' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '10px 16px',
          background: location.pathname === '/' ? 'var(--primary)' : 'transparent',
          color: location.pathname === '/' ? 'white' : 'var(--text-main)',
          width: mobile ? '100%' : 'auto',
          justifyContent: mobile ? 'flex-start' : 'center'
        }}
      >
        <LayoutDashboard size={18} />
        <span>{t('dashboard')}</span>
      </Link>
      <Link 
        to="/transactions" 
        className={`btn ${location.pathname === '/transactions' ? 'btn-primary' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '10px 16px',
          background: location.pathname === '/transactions' ? 'var(--primary)' : 'transparent',
          color: location.pathname === '/transactions' ? 'white' : 'var(--text-main)',
          width: mobile ? '100%' : 'auto',
          justifyContent: mobile ? 'flex-start' : 'center'
        }}
      >
        <ReceiptText size={18} />
        <span>{t('transactions')}</span>
      </Link>
    </>
  );

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Hamburger Menu Toggle (Mobile Only) */}
            <button 
              className="mobile-only"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                padding: '8px', 
                color: 'var(--text-main)',
                display: 'none' // Controlled by CSS
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

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
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>B</div>
              <span className="desktop-only">Balances</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Main Nav Links (Desktop Only) */}
            <div className="desktop-only" style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
              <NavLinks />
            </div>

            <div className="desktop-only" style={{ width: '1px', height: '24px', background: 'var(--border-glass)', marginRight: '8px' }} />

            {/* Language & Theme - Moved slightly left by being before profile and having a gap */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
              <button 
                onClick={toggleLanguage}
                className="btn-icon"
                title={language.toUpperCase()}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}
              >
                <Languages size={18} />
                <span className="desktop-only">{language.toUpperCase()}</span>
              </button>

              <button 
                onClick={toggleTheme}
                className="btn-icon"
                style={{
                  width: '38px',
                  height: '38px',
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
            </div>

            <div className="profile-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="profile-box desktop-only" style={{ 
                paddingLeft: '12px', 
                borderLeft: '1px solid var(--border-glass)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {currentUser.name.split(' ')[0]} 👋
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>{currentUser.email}</div>
              </div>
              
              <button onClick={logout} className="btn-icon" style={{ 
                color: 'var(--danger)', 
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.05)',
                borderRadius: '10px'
              }}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 998
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border-glass)',
                zIndex: 999,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700'
                }}>B</div>
                <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Balances</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <NavLinks mobile />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{currentUser.email}</div>
                </div>
                <button onClick={logout} className="btn" style={{ 
                  width: '100%', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--danger)',
                  justifyContent: 'flex-start'
                }}>
                  <LogOut size={18} />
                  {t('logout') || 'Cerrar Sesión'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


export default Navbar;
