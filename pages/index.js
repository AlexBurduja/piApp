import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateUser = async () => {
      if (typeof window !== 'undefined' && window.Pi) {
        try {
          const scopes = ['username'];
          const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
          setUsername(authResult.user.username);
        } catch (err) {
          console.error('Authentication failed:', err);
          setError('Could not authenticate with Pi Network.');
        }
      }
    };

    const onIncompletePaymentFound = (payment) => {
      // Handle any unfinished payments (optional)
      console.log('Incomplete payment found:', payment);
    };

    authenticateUser();
  }, []);

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>

        {username && (
          <p className="greeting">Hello, {username}!</p>
        )}

        {error && <p className="error">{error}</p>}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">🎮 Play PiCards</a>
        </div>
      </div>
    </main>
  );
}
