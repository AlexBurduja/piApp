import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';

async function saveGameData(username, level, finalScore, starsEarned, duration, updatedLevels) {
  try {
    await setDoc(doc(db, "users", username, "levels", `level_${level}`), {
      level,
      score: finalScore,
      stars: starsEarned,
      time: duration,
      completedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "leaderboard", `level_${level}`, "entries", username), {
      username,
      score: finalScore,
      time: duration,
      stars: starsEarned,
      updatedAt: serverTimestamp(),
    });

    if (duration < 20) {
      await setDoc(doc(db, "users", username, "badges", "speed_runner"), {
        name: "Speed Runner",
        earnedAt: serverTimestamp(),
      });
    }

    if ([2, 4, 6, 8].every(lvl => updatedLevels.includes(lvl))) {
      await setDoc(doc(db, "users", username, "badges", "level_master"), {
        name: "Level Master",
        earnedAt: serverTimestamp(),
      });
    }

    if (finalScore >= 300) {
      await setDoc(doc(db, "users", username, "badges", "scorer_300+"), {
        name: "High Scorer",
        earnedAt: serverTimestamp(),
      });
    }

    console.log("✅ Data saved to Firebase!");
  } catch (err) {
    console.error("❌ Error saving to Firebase:", err);
  }
}

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
  const [isClient, setIsClient] = useState(false);

  const piUsernameRef = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);
  const flipSound = useRef(null);
  const winSound = useRef(null);

  const initPi = async () => {
    if (typeof window === 'undefined' || !window.Pi) return;

    try {
      const saved = localStorage.getItem("pi_username");
      if (saved) {
        console.log("✅ Username loaded from localStorage:", saved);
        setUsername(saved);
        piUsernameRef.current = saved;
        return;
      }

      const scopes = ['username'];
      const result = await window.Pi.authenticate(scopes, () => {});
      const piUsername = result.user.username;

      setUsername(piUsername);
      piUsernameRef.current = piUsername;
      localStorage.setItem("pi_username", piUsername);

      console.log("🔐 Logged in via Pi:", piUsername);
    } catch (err) {
      console.error("❌ Pi auth failed:", err);
    }
  };

  const loadCompletedLevels = async (user) => {
    try {
      const saved = localStorage.getItem(`completedLevels_${user}`);
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }

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

  const startGame = (size) => {
    const numCards = size * size;
    const numPairs = numCards / 2;
    const emojis = ['🪙', '🔐', '💻', '🌐', '📱', '📈', '📉', '💡', '💰', '🧠',
      '💾', '💳', '📦', '🚀', '⚙️', '🧮', '⛓️', '🔗', '📊', '🛡️',
      '🧱', '🔍', '👨‍💻', '👩‍💻', '🕹️', '📂', '🧾', '🌙', '☀️', '✨'];

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
    setShowComplete(false);
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
          const finishedAt = Date.now();
          const duration = Math.floor((finishedAt - startTime) / 1000);
          let bonus = 0;
          let starsEarned = 1;

          if (duration < 20) bonus = 100, starsEarned = 5;
          else if (duration < 40) bonus = 75, starsEarned = 4;
          else if (duration < 60) bonus = 50, starsEarned = 3;
          else if (duration < 90) bonus = 25, starsEarned = 2;
          else bonus = 10, starsEarned = 1;

          winSound.current?.play();
          const finalScore = score + bonus;
          setScore(finalScore);
          setEndTime(duration);
          setStars(starsEarned);

          const user = piUsernameRef.current;
          const updated = [...new Set([...completedLevels, level])];
          localStorage.setItem(`completedLevels_${user}`, JSON.stringify(updated));
          setCompletedLevels(updated);
          setShowComplete(true);
          setScreen('complete');

          if (user) {
            saveGameData(user, level, finalScore, starsEarned, duration, updated);
          }
        }
      } else {
        wrongSound.current?.play();
      }
      setFlipped([]);
    }
  };

  const getGridStyle = () => ({
    gridTemplateColumns: `repeat(${level}, 1fr)`
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      correctSound.current = new Audio("/sounds/correct.mp3");
      wrongSound.current = new Audio("/sounds/wrong.mp3");
      flipSound.current = new Audio("/sounds/flip.mp3");
      winSound.current = new Audio("/sounds/win.mp3");
    }

    initPi().then(() => {
      const user = localStorage.getItem("pi_username");
      if (user) loadCompletedLevels(user);
    });
  }, []);

  if (!isClient) return null;

  return (
    <main className="app-container">
      {screen === 'home' && (
        <div className="menu-screen">
          <h1 className="title">PiMemory</h1>
          <h2 className="subtitle">Choose a level</h2>
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
