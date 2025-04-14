import { useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  const loginWithPi = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      setError('Pi SDK not available. Please open in Pi Browser.');
      return;
    }

    try {
      const result = await window.Pi.authenticate(['username'], (payment) => {
        console.log('Incomplete payment:', payment);
      });
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

        {/* Debug info */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>⚠️ {error}</p>}
      </div>
    </main>
  );
}
