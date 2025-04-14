import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Pi SDK and initialize it
  useEffect(() => {
    const loadPiSdk = () => {
      if (!window.Pi) {
        const script = document.createElement('script');
        script.src = 'https://sdk.minepi.com/pi-sdk.js';
        script.defer = true;
        script.onload = () => {
          if (window.Pi) {
            window.Pi.init({ version: '2.0' });
            setSdkLoaded(true);
          } else {
            setError('Pi SDK loaded but Pi object not found.');
          }
        };
        script.onerror = () => setError('Failed to load Pi SDK.');
        document.body.appendChild(script);
      } else {
        window.Pi.init({ version: '2.0' });
        setSdkLoaded(true);
      }
    };

    if (typeof window !== 'undefined') {
      loadPiSdk();
    }
  }, []);

  const loginWithPi = async () => {
    if (!window.Pi) {
      setError('Pi SDK not available.');
      return;
    }

    try {
      const result = await window.Pi.authenticate(['username'], (payment) => {
        console.log('Incomplete payment:', payment);
      });
      setUsername(result.user.username);
    } catch (err) {
      setError(`Pi authentication failed: ${err.message}`);
    }
  };

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>

        {username ? (
          <p className="greeting">Hello, {username}!</p>
        ) : (
          <button className="menu-button" onClick={loginWithPi}>
            🔐 Log in with Pi
          </button>
        )}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">🎮 Play PiCards</a>
        </div>

        {/* Debug info */}
        <div style={{ marginTop: '2rem', color: 'red' }}>
          {!sdkLoaded && <p>⏳ Waiting for Pi SDK to load...</p>}
          {error && <p>⚠️ {error}</p>}
        </div>
      </div>
    </main>
  );
}
