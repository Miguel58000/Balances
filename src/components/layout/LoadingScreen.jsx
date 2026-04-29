import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const LoadingScreen = () => {
  const { t } = useApp();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Anillo rotatorio externo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--primary)',
            borderRightColor: 'var(--secondary)',
            opacity: 0.6
          }}
        />
        
        {/* Segundo anillo rotatorio (contrasentido) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: 'var(--primary)',
            borderLeftColor: 'var(--secondary)',
            opacity: 0.4
          }}
        />

        {/* Logo central con pulso */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: 1 }}
          transition={{ 
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 }
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            zIndex: 2
          }}
        >
          B
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '40px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontWeight: '600',
          letterSpacing: '3px',
          textTransform: 'uppercase'
        }}
      >
        {t('syncing')}
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
