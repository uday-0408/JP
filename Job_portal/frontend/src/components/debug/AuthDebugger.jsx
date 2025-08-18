import React from 'react';
import { useSelector } from 'react-redux';

// A small component to show authentication state for debugging
// Add this component to any page where you need to debug auth
const AuthDebugger = () => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);
  
  const hasCookies = document.cookie
    .split(';')
    .some(c => c.trim().startsWith('token='));
  
  const styles = {
    container: {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px',
      overflow: 'auto'
    },
    title: {
      margin: '0 0 5px 0',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '3px'
    },
    green: { color: '#4ade80' },
    red: { color: '#f87171' },
    yellow: { color: '#facc15' }
  };
  
  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Auth Debug</h4>
      
      <div style={styles.row}>
        <span>isAuthenticated:</span>
        <span style={isAuthenticated ? styles.green : styles.red}>
          {isAuthenticated ? 'true' : 'false'}
        </span>
      </div>
      
      <div style={styles.row}>
        <span>User:</span>
        <span style={user ? styles.green : styles.red}>
          {user ? user.fullname : 'null'}
        </span>
      </div>
      
      <div style={styles.row}>
        <span>Role:</span>
        <span style={user?.role ? styles.green : styles.yellow}>
          {user?.role || 'N/A'}
        </span>
      </div>
      
      <div style={styles.row}>
        <span>Auth Cookie:</span>
        <span style={hasCookies ? styles.green : styles.red}>
          {hasCookies ? 'Present' : 'Missing'}
        </span>
      </div>
      
      <div style={styles.row}>
        <span>Loading:</span>
        <span style={loading ? styles.yellow : styles.green}>
          {loading ? 'true' : 'false'}
        </span>
      </div>
    </div>
  );
};

export default AuthDebugger;
