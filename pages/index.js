import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  collection
} from 'firebase/firestore';

export default function HomePage() {
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const Loader = ({ message }) => (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <p style={{ fontSize: "1.5rem" }}>{message}</p>
      <div className="spinner" />
    </div>
  );  

  // Authenticate the user using Pi SDK
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Pi) {
        console.log("✅ Pi SDK available");

        const authenticate = async () => {
          try {
            const scopes = ['username', 'payments'];
            const res = await window.Pi.authenticate(scopes, (payment) => {
              console.log("💸 Unfinished payment found:", payment);
            });

            console.log("👤 Authenticated as:", res.user.username);
            setUsername(res.user.username);

            // Save user to Firestore
            await setDoc(doc(db, "users", res.user.username), {
              username: res.user.username,
              lastLogin: serverTimestamp(),
            }, { merge: true });

            // Check if user has any completed payments
            const paymentsSnapshot = await getDocs(
              collection(db, "users", res.user.username, "payments")
            );

            if (!paymentsSnapshot.empty) {
              console.log("🟢 User already paid");
              setIsPaid(true);
            }
          } catch (err) {
            console.error("❌ Auth failed:", err);
            setError("Could not authenticate with Pi.");
          }
          setLoading(false); 
        };

        authenticate();
        clearInterval(interval);
      } else {
        console.log("⏳ Waiting for Pi SDK...");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Utility function to call local backend API routes
  const callApi = async (url, payload) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${url} failed: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (err) {
      console.error("❌ API call failed:", err);
      throw err;
    }
  };

  const handlePayment = async () => {
    if (!window.Pi) {
      setError("Pi SDK not available");
      return;
    }

    const paymentData = {
      amount: 0.001,
      memo: "PiMemory Game Access",
      metadata: {
        user: username,
      },
    };

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        console.log("📩 Sending to backend for approval:", paymentId);
        try {
          const data = await callApi("/api/approve", { paymentId });
          console.log("✅ Payment approved:", data);
        } catch (err) {
          console.error("❌ Payment approval failed:", err);
        }
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("✅ Blockchain complete:", paymentId, txid);
        try {
          const data = await callApi("/api/complete", {
            paymentId,
            txid,
            username
          });
          console.log("✅ Payment marked complete:", data);
          setIsPaid(true);
        } catch (err) {
          console.error("❌ Completion error:", err);
        }
      },

      onCancel: (paymentId) => {
        console.warn("🚫 Payment cancelled by user:", paymentId);
      },

      onError: (error, payment) => {
        console.error("❌ Payment error:", error, payment);
      },
    };

    try {
      const payment = await window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log("🎉 Payment flow started:", payment);
    } catch (err) {
      console.error("❌ Payment init error:", err);
    }
  };

  return (
    <main className="app-container">
    {loading ? (
      <Loader message="🔐 Logging you in..." />
    ) : (
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
    )}
    </main>
    );
}
