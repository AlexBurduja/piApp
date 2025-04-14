import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const loadPiSdk = () => {
      if (!window.Pi) {
        const script = document.createElement('script');
        script.src = 'https://sdk.minepi.com/pi-sdk.js';
        script.defer = true;
        script.onload = () => {
          if (window.Pi) {
            window.Pi.init({ version: '2.0' });
          }
        };
        document.body.appendChild(script);
      } else {
        window.Pi.init({ version: '2.0' });
      }
    };

    if (typeof window !== 'undefined') {
      loadPiSdk();
    }
  }, []);

  const loginWithPi = async () => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        const scopes = ['username'];
        const result = await window.Pi.authenticate(scopes, (payment) => {
          console.log('Incomplete payment:', payment);
        });
        setUsername(result.user.username);
      } catch (error) {
        console.error('Pi authentication error:', error);
      }
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
      </div>
    </main>
  );
}
