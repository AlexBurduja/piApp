import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [piStatus, setPiStatus] = useState('loading');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.Pi) {
        setPiStatus('available');
      } else {
        setPiStatus('missing');
      }
    }
  }, []);

  const loginWithPi = async () => {
    if (!window.Pi) {
      setError('Pi SDK not available. Please open in Pi Browser.');
      return;
    }

    try {
      const result = await window.Pi.authenticate(['username'], (payment) => {
        console.log('Incomplete payment:', payment);
      });
      console.log(result);
      setUsername(result.user.username);
    } catch (err) {
      setError(`Pi login failed: ${err.message}`);
    }
  };

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>

        {username ? (
          <p className="greeting">Hello, {username}!</p>
        ) : (
          <button className="menu-button" onClick={loginWithPi}>🔐 Log in with Pi</button>
        )}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">🎮 Play PiCards</a>
        </div>

        {/* Client-only debug output to avoid hydration mismatch */}
        <div style={{ color: 'lime', marginTop: '1rem' }}>
          {piStatus === 'loading' ? null : (
            <p>Pi SDK: {piStatus === 'available' ? '✅ Available' : '❌ Not Found'}</p>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
      </div>
    </main>
  );
}
