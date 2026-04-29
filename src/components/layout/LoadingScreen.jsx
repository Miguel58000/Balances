import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
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
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
        }}
      >
        B
      </motion.div>
      <motion.div
        animate={{ width: ['0%', '100%', '0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: '120px',
          height: '3px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div style={{ height: '100%', width: '100%', background: 'var(--primary)' }} />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
