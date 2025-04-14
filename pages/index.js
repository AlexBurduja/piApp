import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateUser = async () => {
      if (typeof window !== 'undefined' && window.Pi) {
        try {
          const scopes = ['username'];
          const authResult = await window.Pi.authenticate(scopes, (payment) => {
            console.log('Unfinished payment found:', payment);
          });

          console.log('✅ Authenticated as:', authResult.user.username);
          setUsername(authResult.user.username);
        } catch (err) {
          console.error('Authentication failed:', err);
          setError('Could not authenticate with Pi Network.');
        }
      }
    };

    authenticateUser();
  }, []);

  // 🔘 Payment handler
  const handlePayment = async () => {
    if (!window.Pi) return;

    try {
      const paymentData = {
        amount: 0.001, // small amount for testing
        memo: "Testing Pi Payment in PiMemory",
        metadata: { type: "test-payment", purpose: "unlock game" }
      };

      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId) => {
          console.log("✅ Ready for server approval", paymentId);
          // Optionally send paymentId to your server to approve it
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log("✅ Ready for server completion", paymentId, txid);
          // Optionally notify your server to complete the payment
        },
        onCancel: (paymentId) => {
          console.log("❌ Payment cancelled", paymentId);
        },
        onError: (error, payment) => {
          console.error("❌ Payment error", error);
        }
      });

      console.log("Payment result:", payment);
    } catch (error) {
      console.error("Payment initiation failed:", error);
    }
  };

  return (
    <main className="app-container">
      <div className="menu-screen">
        <h1 className="title">Welcome to PiMemory</h1>

        {username && <p className="greeting">Hello, {username}!</p>}
        {error && <p className="error">{error}</p>}

        <h2 className="subtitle">Choose a game</h2>
        <div className="game-selector">
          <a className="menu-button" href="/cards">🎮 Play PiCards</a>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button className="menu-button" onClick={handlePayment}>
            💸 Pay with Pi (Test)
          </button>
        </div>
      </div>
    </main>
  );
}
