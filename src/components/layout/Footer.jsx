import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Footer = () => {
  const { t } = useApp();
  return (
    <footer style={{
      padding: '16px 0',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-glass)',
      background: 'rgba(0,0,0,0.02)'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '1.2rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>B</div>
            Balances
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', textAlign: 'center' }}>
            {t('footerText')}
          </p>

          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            marginTop: '20px',
            borderTop: '1px solid var(--border-glass)',
            gap: '12px'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              <span>© 2026 Miguel Rodríguez. {t('rights')}.</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <span>{t('version')} 1.8.0</span>
                <span className="desktop-only">•</span>
                <span>{t('lastUpdate')}: 30/04/2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
