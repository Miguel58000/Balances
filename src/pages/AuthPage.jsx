import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Wallet, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, t, toggleLanguage, language } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!login(formData.email, formData.password)) {
        setError('Invalid credentials');
      }
    } else {
      if (!register(formData.name, formData.email, formData.password)) {
        setError('User already exists');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Language toggle for non-logged users */}
      <button 
        onClick={toggleLanguage}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          padding: '8px 16px',
          borderRadius: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          zIndex: 10,
          fontWeight: '600'
        }}
      >
        {language.toUpperCase()}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '48px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Wallet size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Balances</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? t('welcome') : t('createAccount')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">{t('fullName')}</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="input-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">{t('email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input-control"
                style={{ paddingLeft: '40px' }}
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="input-control"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}
            >
              {error}
            </motion.div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '10px' }}>
            {isLogin ? t('login') : t('signup')}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>
            {isLogin ? (language === 'es' ? '¿No tienes cuenta?' : "Don't have an account?") : (language === 'es' ? '¿Ya tienes cuenta?' : "Already have an account?")}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ 
              background: 'none', 
              color: 'var(--primary)', 
              fontWeight: '600', 
              marginLeft: '8px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? t('signup') : t('login')}
          </button>
        </div>
      </motion.div>

      {/* Decorative Blur Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
    </div>
  );
};


export default AuthPage;
