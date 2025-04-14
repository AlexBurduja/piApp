'use client'
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateUser = async () => {
      if (typeof window !== 'undefined' && window.Pi) {
        console.log('Pi SDK found, attempting to authenticate...');
  
        try {
          const scopes = ['username'];
          const authResult = await window.Pi.authenticate(scopes, (payment) => {
            console.log('Unfinished payment:', payment);
          });
  
          console.log('Auth result:', authResult);
          setUsername(authResult.user.username);
        } catch (err) {
          console.error('Authentication error:', err);
          setError('Could not authenticate with Pi Network.');
        }
      } else {
        console.warn('Pi SDK not found.');
      }
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
