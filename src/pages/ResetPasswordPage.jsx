import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyResetCode, confirmPasswordResetCode, t, toggleLanguage, language } = useApp();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [checking, setChecking] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCode = async () => {
      const oobCode = searchParams.get('oobCode') || searchParams.get('code');
      if (!oobCode) {
        return { error: t('invalidOrExpiredCode') || 'Invalid or expired link' };
      }
      setCode(oobCode);
      const res = await verifyResetCode(oobCode);
      if (res.success) {
        return { email: res.email, valid: true };
      } else {
        return { error: res.error || t('invalidOrExpiredCode') };
      }
    };

    checkCode().then(result => {
      if (result?.error) {
        if (result.error === 'auth/expired-action-code') {
          setError(t('expiredLink'));
         } else {
          // Mapear errores de Firebase a mensajes traducidos
          if (result.error === 'auth/invalid-action-code' || result.error === 'auth/expired-action-code') {
            setError(t('expiredLink'));
          } else if (result.error === 'auth/user-not-found') {
            setError(t('emailNotFound'));
          } else {
            setError(t('invalidOrExpiredCode'));
          }
        }
      }
      if (result?.email) {
        setEmail(result.email);
        setCodeValid(true);
      }
      setChecking(false);
    });
  }, [searchParams, verifyResetCode, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError(t('passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await confirmPasswordResetCode(code, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    } else {
      setError(res.error || t('invalidOrExpiredCode'));
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
      {/* Language toggle */}
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

      {/* Decorative Blur Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '450px', padding: '48px', position: 'relative', zIndex: 1 }}
      >
        {checking ? (
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '40px', height: '40px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 16px' }}
            />
            <p style={{ color: 'var(--text-muted)' }}>{t('syncing') || 'Verifying...'}</p>
          </div>
        ) : error && !codeValid ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={32} style={{ color: 'var(--danger)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>{t('invalidOrExpiredCode') || 'Invalid Link'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
            <button onClick={() => navigate('/auth')} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {t('login') || 'Back to Login'}
            </button>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>{t('passwordResetSuccess') || 'Success'}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Se te redirigirá a iniciar sesión</p>
          </div>
        ) : (
          <>
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
                <Lock size={32} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>{t('resetYourPassword') || 'Reset Password'}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('email')}: <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label htmlFor="newPassword">{t('newPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    className="input-control"
                    style={{ paddingLeft: '40px' }}
                     placeholder="••••••••"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="input-control"
                    style={{ paddingLeft: '40px' }}
                     placeholder="••••••••"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '10px' }} disabled={loading}>
                {loading ? '...' : t('resetPassword') || 'Reset Password'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={() => navigate('/auth')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', fontSize: '0.9rem' }}
              >
                <ArrowLeft size={16} />
                {t('cancel') || 'Back to Login'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
