import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export default function PiMemoryApp() {
  const [username, setUsername] = useState('');
  const [screen, setScreen] = useState('home');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [stars, setStars] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const correctSound = useRef(null);
  const wrongSound = useRef(null);
  const flipSound = useRef(null);
  const winSound = useRef(null);

  const emojis = ['🪙', '🔐', '💻', '🌐', '📱', '📈', '📉', '💡', '💰', '🧠',
    '💾', '💳', '📦', '🚀', '⚙️', '🧮', '⛓️', '🔗', '📊', '🛡️',
    '🧱', '🔍', '👨‍💻', '👩‍💻', '🕹️', '📂', '🧾', '🌙', '☀️', '✨'];

  const loadCompletedLevels = async (user) => {
    try {
      const snapshot = await getDocs(collection(db, "users", user, "levels"));
      const levelsFromDb = snapshot.docs.map(doc => doc.data()?.level).filter(l => typeof l === "number");

      if (levelsFromDb.length > 0) {
        setCompletedLevels(levelsFromDb);
        localStorage.setItem(`completedLevels_${user}`, JSON.stringify(levelsFromDb));
      }
    } catch (err) {
      console.error("❌ Error loading levels:", err);
    }
  };

  const saveGameData = async (user, level, finalScore, starsEarned, duration, updated) => {
    try {
      const levelMap = { 2: 1, 4: 2, 6: 3, 8: 4 };
      const gameLevel = levelMap[level];

      await setDoc(doc(db, "users", user, "levels", `level_${gameLevel}`), {
        level: gameLevel,
        score: finalScore,
        stars: starsEarned,
        time: duration,
        completedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "leaderboard", "memoryGame", "level_" + gameLevel, user), {
        username: user,
        score: finalScore,
        time: duration,
        stars: starsEarned,
        updatedAt: serverTimestamp(),
      });

      if (duration < 20) {
        await setDoc(doc(db, "users", user, "badges", "speed_runner"), {
          name: "Speed Runner",
          earnedAt: serverTimestamp(),
        });
      }

      if ([2, 4, 6, 8].every(lvl => updated.includes(lvl))) {
        await setDoc(doc(db, "users", user, "badges", "level_master"), {
          name: "Level Master",
          earnedAt: serverTimestamp(),
        });
      }

      if (finalScore >= 300) {
        await setDoc(doc(db, "users", user, "badges", "scorer_300+"), {
          name: "High Scorer",
          earnedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("❌ Error saving to Firebase:", err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const levelMap = { 2: 1, 4: 2, 6: 3, 8: 4 };
      const data = {};
      for (const size of [2, 4, 6, 8]) {
        const gameLevel = levelMap[size];
        const q = query(collection(db, "leaderboard", "memoryGame", "level_" + gameLevel), orderBy("time"));
        const snapshot = await getDocs(q);
        data[`level_${gameLevel}`] = snapshot.docs.map(doc => doc.data());
      }
      setLeaderboardData(data);
    } catch (err) {
      console.error("❌ Failed to load leaderboard:", err);
    }
  };

  const startGame = (size) => {
    const numPairs = (size * size) / 2;
    const selected = emojis.slice(0, numPairs);
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
    setStars(0);
    setScreen('game');
  };

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    flipSound.current?.play();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        correctSound.current?.play();
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setScore(prev => prev + 10);

        if (newMatched.length === cards.length) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          let starsEarned = 1;
          let bonus = 10;

          if (duration < 20) starsEarned = 5, bonus = 100;
          else if (duration < 40) starsEarned = 4, bonus = 75;
          else if (duration < 60) starsEarned = 3, bonus = 50;
          else if (duration < 90) starsEarned = 2, bonus = 25;

          const finalScore = score + bonus;
          winSound.current?.play();

          const updated = [...new Set([...completedLevels, level])];
          localStorage.setItem(`completedLevels_${username}`, JSON.stringify(updated));
          setCompletedLevels(updated);

          setScore(finalScore);
          setEndTime(duration);
          setStars(starsEarned);
          setScreen('complete');

          saveGameData(username, level, finalScore, starsEarned, duration, updated);
        }
      } else {
        wrongSound.current?.play();
      }
      setTimeout(() => setFlipped([]), 800);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const user = localStorage.getItem("pi_username");
    if (user) {
      setUsername(user);
      loadCompletedLevels(user);
    }

    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
    flipSound.current = new Audio("/sounds/flip.mp3");
    winSound.current = new Audio("/sounds/win.mp3");
  }, []);

  if (!isClient || !username) return <p style={{ textAlign: 'center', marginTop: '5rem' }}>🔐 Please log in first.</p>;

  return (
    <main className="app-container">
      {screen === 'home' && (
        <div className="menu-screen">
          <h1 className="title">PiMemory</h1>
          <h2 className="subtitle">Choose a level</h2>
          <button className="menu-button" style={{ marginBottom: '1rem' }} onClick={loadLeaderboard}>📊 View Leaderboard</button>
          {leaderboardData && Object.entries(leaderboardData).map(([level, entries]) => (
            <div key={level}>
              <h3>{level.replace('_', ' ').toUpperCase()}</h3>
              <ul>
                {entries.map((entry, i) => (
                  <li key={i}>{entry.username} - {entry.time}s ⭐{entry.stars}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="level-buttons">
            {[2, 4, 6, 8].map((size, index) => {
              const isCompleted = completedLevels.includes(size);
              const previous = [2, 4, 6, 8][index - 1];
              const isUnlocked = index === 0 || completedLevels.includes(previous);

              return (
                <button
                  key={size}
                  className={`menu-button ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  onClick={() => isUnlocked && startGame(size)}
                  disabled={!isUnlocked}
                >
                  Level {index + 1} ({size} × {size})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="game-screen">
          <h1 className="title">Match the Pairs</h1>
          <p className="score">Score: {score}</p>
          {startTime && <p className="timer">Time: {Math.floor((Date.now() - startTime) / 1000)}s</p>}
          <div className="card-grid" style={{ gridTemplateColumns: `repeat(${level}, 1fr)` }}>
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
          <p>{Array.from({ length: 5 }, (_, i) => <span key={i}>{i < stars ? '⭐' : '☆'}</span>)}</p>
          <button className="menu-button" onClick={() => setScreen('home')}>
            Back to Menu
          </button>
        </div>
      )}
    </main>
  );
}
