import { useState, useEffect } from 'react';

export default function PiMemoryApp() {
  const [username, setUsername] = useState('Pioneer');
  const [screen, setScreen] = useState('home');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(null);

  useEffect(() => {
    setUsername('Pioneer');
  }, []);

  const startGame = (size) => {
    let numCards = size * size;
    if (numCards % 2 !== 0) numCards -= 1; // ensure even number of cards
    const numPairs = numCards / 2;
    const allEmojis = ['🍕', '🎈', '🐱', '🚀', '🎮', '🌈', '🎵', '⚽', '🍓', '🐶', '🌟', '🎁', '🧠', '🧸', '🍩', '🍄', '🦋', '📦', '🧃', '🪐', '🐸', '🍪'];
    const selected = allEmojis.slice(0, numPairs);
    const shuffled = [...selected, ...selected]
      .sort(() => 0.5 - Math.random())
      .map((type, index) => ({ id: index, type }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setLevel(size);
    setScreen('game');
  };

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].type === cards[second].type) {
        setMatched([...matched, first, second]);
        setScore(score + 10);
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
      
        <div className="menu-screen">
          <h1 className="title">PiMemory</h1>
          <p className="greeting">Hello, {username}!</p>
          <h2 className="subtitle">Choose a game!</h2>
        </div>

        <div className="game-selector">
          <a href='/cards'>PiCards</a>
        </div>
    </main>
  );
}