import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Pi) {
        console.log("✅ Pi SDK now available");

        const authenticate = async () => {
          try {
            const scopes = ['username', 'payments'];
            const res = await window.Pi.authenticate(scopes, (payment) => {
              console.log("💸 Unfinished payment found:", payment);
            });

            console.log("👤 User:", res.user.username);
            setUsername(res.user.username);
          } catch (err) {
            console.error("❌ Authentication failed:", err);
            setError("Failed to authenticate with Pi");
          }
        };

        authenticate();
        clearInterval(interval);
      } else {
        console.log("⏳ Waiting for Pi SDK...");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handlePayment = async () => {
    if (!window.Pi) {
      setError("Pi SDK not available");
      return;
    }

    const paymentData = {
      amount: 0.001,
      memo: "PiMemory Test Access",
      metadata: {
        item: "Game Access",
        user: username,
      },
    };

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        console.log("📩 Sending to backend for approval:", paymentId);
        try {
          const res = await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();
          console.log("✅ Approved by backend:", data);
        } catch (err) {
          console.error("❌ Backend approval failed:", err);
        }
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("✅ Blockchain tx complete:", paymentId, txid);
        try {
          const res = await fetch("/api/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
          const data = await res.json();
          console.log("✅ Server marked payment complete:", data);
          setIsPaid(true);
        } catch (err) {
          console.error("❌ Completion failed:", err);
        }
      },

      onCancel: (paymentId) => {
        console.warn("🚫 Payment cancelled", paymentId);
      },

      onError: (error, payment) => {
        console.error("❌ Payment error", error, payment);
      },
    };

    try {
      const payment = await window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log("🎉 Payment started:", payment);
    } catch (error) {
      console.error("❌ Failed to start payment:", error);
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
          <a
            className={`menu-button ${!isPaid ? 'disabled' : ''}`}
            href={isPaid ? "/cards" : "#"}
            onClick={(e) => {
              if (!isPaid) e.preventDefault();
            }}
          >
            🎮 {isPaid ? "Play PiCards" : "Unlock with Pi first"}
          </a>
        </div>

        {!isPaid && (
          <div style={{ marginTop: "2rem" }}>
            <button className="menu-button" onClick={handlePayment}>
              💸 Pay with Pi to Unlock
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
