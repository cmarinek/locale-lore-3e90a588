import React from 'react';

const Index: React.FC = () => {
  console.log('SIMPLE INDEX: Starting render...');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ff0000',
      color: '#ffffff',
      fontSize: '32px',
      fontWeight: 'bold',
      padding: '40px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>🚀 APP IS WORKING!</h1>
      <p style={{ marginBottom: '10px' }}>React is rendering successfully</p>
      <p style={{ marginBottom: '10px' }}>Time: {new Date().toLocaleTimeString()}</p>
      <p style={{ marginBottom: '20px' }}>If you see this red screen, the app is loading!</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '15px 30px',
          fontSize: '20px',
          backgroundColor: '#ffffff',
          color: '#ff0000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};

export default Index;