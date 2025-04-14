import { useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  const loginWithPi = async () => {
    if (!window.Pi) {
      setError('Pi SDK not available.');
      return;
    }
  
    try {
      console.log('Logging in...');
      const result = await window.Pi.authenticate(['username'], (payment) => {
        console.log('Incomplete payment:', payment);
      });
      console.log('Login result:', result);
      setUsername(result.user.username);
    } catch (err) {
      setError(`Pi login failed: ${err.message}`);
      console.error('Pi login error:', err);
    }
  };
  

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>

        {username ? (
          <p className="greeting">Hello, {username}!</p>
        ) : (
          <div>
            <button className="menu-button" onClick={loginWithPi}>🔐 Log in with Pi</button>
            <p style={{ color: 'lime' }}>
              Pi SDK: {typeof window !== 'undefined' && window.Pi ? '✅ Available' : '❌ Not Found'}
            </p>
          </div>
        )}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">🎮 Play PiCards</a>
        </div>

        {/* Debug info */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>⚠️ {error}</p>}
      </div>
    </main>
  );
}
