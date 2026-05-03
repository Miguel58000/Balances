import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Wallet, ArrowLeft, CheckCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingReset, setLoadingReset] = useState(false);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  const { login, register, sendPasswordReset, t, toggleLanguage, language } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar campos vacíos
    if (!formData.email.trim() || !formData.password.trim()) {
      setError(t('bothFieldsRequired'));
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmail'));
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (!res.success) {
        if (res.error === 'auth/invalid-credential' || res.error === 'auth/wrong-password' || res.error === 'auth/user-not-found') {
          setError(t('invalidCredentials'));
        } else {
          setError(res.error || t('invalidCredentials'));
        }
      }
    } else {
      const res = await register(formData.name, formData.email, formData.password);
      if (!res.success) {
        // Handle specific Firebase errors
        if (res.error?.includes('email-already-in-use')) {
          setError(t('emailAlreadyInUse'));
        } else if (res.error?.includes('weak-password')) {
          setError(t('passwordTooShort'));
        } else if (res.error?.includes('invalid-email')) {
          setError(t('invalidEmail'));
        } else if (res.error?.includes('missing-email') || res.error?.includes('missing-password')) {
          setError(t('bothFieldsRequired'));
        } else {
          setError(res.error || t('userExists'));
        }
      }
    }
  };

    const handleForgotPassword = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoadingReset(true);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t('invalidEmail'));
        setLoadingReset(false);
        return;
      }

      const res = await sendPasswordReset(formData.email);
      setLoadingReset(false);
      if (res.success) {
        setSuccess(t('resetLinkSent'));
      } else {
        if (res.error === 'USER_NOT_FOUND') {
          setError(t('emailNotFound'));
        } else if (res.error === 'INVALID_EMAIL') {
          setError(t('invalidEmail'));
        } else if (res.error === 'EMAIL_REQUIRED') {
          setError(t('invalidAmount') || 'Email required');
        } else {
          setError(t('errorSendingResetEmail'));
        }
      }
    };

  const handleBack = () => {
    setShowForgotPassword(false);
    setError('');
    setSuccess('');
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
            {showForgotPassword
              ? t('forgotPassword') || 'Recover your account'
              : isLogin ? t('welcome') : t('createAccount')
            }
          </p>
        </div>

        <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!showForgotPassword && !isLogin && (
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
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 disabled={showForgotPassword && false}
              />
            </div>
          </div>

          {!showForgotPassword && (
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
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                color: '#22c55e', 
                fontSize: '0.95rem', 
                textAlign: 'center', 
                background: 'rgba(34, 197, 94, 0.15)', 
                padding: '12px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                fontWeight: '500',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <CheckCircle size={18} />
              {success}
            </motion.div>
          )}

           <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '10px' }} disabled={showForgotPassword && loadingReset}>
             {showForgotPassword ? (
               loadingReset ? (
                 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                     style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                   />
                   {t('sending') || 'Sending...'}
                 </span>
               ) : (
                 t('sendResetLink') || 'Send Reset Link'
               )
             ) : isLogin ? t('login') || 'Login' : t('signup') || 'Sign Up'}
           </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem' }}>
          {showForgotPassword ? (
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={16} />
              {t('login') || 'Back to Login'}
            </button>
          ) : (
            <>
              <span style={{ color: 'var(--text-dim)' }}>
                {isLogin
                  ? (language === 'es' ? '¿No tienes cuenta?' : "Don't have an account?")
                  : (language === 'es' ? '¿Ya tienes cuenta?' : "Already have an account?")}
              </span>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
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

                {isLogin && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                      }}
                    >
                      {t('forgotPassword') || 'Forgot Password?'}
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      </motion.div>

      {/* Decorative Blur Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
    </div>
  );
};

export default AuthPage;
