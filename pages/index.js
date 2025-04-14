import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);

  const initPi = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      console.warn('Pi SDK not available');
      return;
    }
    try {
      await window.Pi.init({ version: '2.0' });
      const result = await window.Pi.authenticate(['username'], (payment) => {
        console.log('Incomplete payment:', payment);
      });
      setUsername(result.user.username);
    } catch (err) {
      console.error('Pi login failed:', err);
    }
  };

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>
        {username ? (
          <p className="greeting">Hello, {username}!</p>
        ) : (
          <button className="menu-button" onClick={initPi}>
            🔐 Log in with Pi
          </button>
        )}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">Play PiCards</a>
        </div>
      </div>
    </main>
  );
}
