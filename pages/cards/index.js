import { useState, useEffect } from 'react';

export default function PiMemoryApp() {
  const [username, setUsername] = useState(null);
  const [screen, setScreen] = useState('home');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showComplete, setShowComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);

  const initPi = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      console.warn('Pi SDK not available');
      return;
    }
    try {
      const scopes = ['username'];
      const result = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const piUsername = result.user.username;
      setUsername(piUsername);

      const savedLevels = localStorage.getItem(`completedLevels_${piUsername}`);
      if (savedLevels) {
        setCompletedLevels(JSON.parse(savedLevels));
      }
    } catch (err) {
      console.error('Pi authentication failed:', err);
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.log('Found incomplete payment:', payment);
  };

  const startGame = (size) => {
    const numCards = size * size;
    const numPairs = numCards / 2;
    const allEmojis = [
      '🪙', '🔐', '💻', '🌐', '📱', '📈', '📉', '💡', '💰', '🧠',
      '💾', '💳', '📦', '🚀', '⚙️', '🧮', '⛓️', '🔗', '📊', '🛡️',
      '🧱', '🔍', '👨‍💻', '👩‍💻', '🕹️', '📂', '🧾', '🌙', '☀️', '✨',
      '🛒', '📣', '🔄'
    ];

    const selected = allEmojis.slice(0, numPairs);
    const shuffled = [...selected, ...selected]
      .sort(() => 0.5 - Math.random())
      .map((type, index) => ({ id: index, type }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setLevel(size);
    setStartTime(Date.now());
    setEndTime(null);
    setShowComplete(false);
    setStars(0);
    setScreen('game');
  };

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setScore(prev => prev + 10);

        if (newMatched.length === cards.length) {
          const finishedAt = Date.now();
          const duration = Math.floor((finishedAt - startTime) / 1000);

          let bonus = 0;
          let starsEarned = 1;

          if (duration < 20) {
            bonus = 100;
            starsEarned = 5;
          } else if (duration < 40) {
            bonus = 75;
            starsEarned = 4;
          } else if (duration < 60) {
            bonus = 50;
            starsEarned = 3;
          } else if (duration < 90) {
            bonus = 25;
            starsEarned = 2;
          } else {
            bonus = 10;
            starsEarned = 1;
          }

          setTimeout(() => {
            setScore(prev => prev + bonus);
            setEndTime(duration);
            setStars(starsEarned);
            setCompletedLevels(prev => {
              const updated = [...new Set([...prev, level])];
              localStorage.setItem(`completedLevels_${username}`, JSON.stringify(updated));
              return updated;
            });
            setShowComplete(true);
            setScreen('complete');
          }, 800);
        }
      }
      setTimeout(() => setFlipped([]), 800);
    }
  };

  const getGridStyle = () => {
    return {
      gridTemplateColumns: `repeat(${level}, 1fr)`
    };
  };

  return (
    <main className="app-container">
      {screen === 'home' && (
        <div className="menu-screen">
          <h1 className="title">PiMemory</h1>
          <h2 className="subtitle">Choose a level</h2>
          <div className="level-buttons">
            {[2, 4, 6, 8].map((size, index) => (
              <button
                key={size}
                className={`menu-button ${completedLevels.includes(size) ? 'completed' : ''}`}
                onClick={() => startGame(size)}
              >
                Level {index + 1} ({size} × {size})
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="game-screen">
          <h1 className="title">Match the Pairs</h1>
          <p className="score">Score: {score}</p>
          {startTime && <p className="timer">Time: {Math.floor((Date.now() - startTime) / 1000)}s</p>}

          <div className="card-grid" style={getGridStyle()}>
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || matched.includes(index);
              return (
                <div
                  key={card.id}
                  className={`card ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => handleFlip(index)}
                >
                  <div className="card-inner">
                    <div className="card-front">{card.type}</div>
                    <div className="card-back">❓</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {screen === 'complete' && (
        <div className="complete-screen">
          <h2>🎉 Level Complete!</h2>
          <p>Time: {endTime}s</p>
          <p>Total Score: {score}</p>
          <p>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i}>{i < stars ? '⭐' : '☆'}</span>
            ))}
          </p>
          <button className="menu-button" onClick={() => setScreen('home')}>
            Back to Menu
          </button>
        </div>
      )}
    </main>
  );
}