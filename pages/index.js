
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateUser = async () => {
      // Wait until Pi is available
      if (typeof window === 'undefined' || !window.Pi) {
        console.warn('⏳ Pi SDK not yet available');
        return;
      }
  
      console.log('🔐 Pi SDK ready, authenticating...');
      try {
        const scopes = ['username'];
        const result = await window.Pi.authenticate(scopes, (payment) => {
          console.log('Unfinished payment:', payment);
        });
        console.log('✅ Auth result:', result);
        setUsername(result.user.username);
      } catch (err) {
        console.error('❌ Auth failed:', err);
        setError('Could not authenticate with Pi Network.');
      }
    };
  
    // Run shortly after load to ensure SDK is ready
    const delay = setTimeout(authenticateUser, 1000);
    return () => clearTimeout(delay);
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
