import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  const { paymentId, txid, username } = req.body;
  const APP_SECRET = process.env.PI_APP_SECRET;

  if (!paymentId || !txid || !username) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Complete the payment on Pi Network
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${APP_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const data = await response.json();

    // Save payment under user in Firestore
    await setDoc(doc(db, "users", username, "payments", paymentId), {
      paymentId,
      txid,
      memo: data.memo,
      amount: data.amount,
      completedAt: serverTimestamp(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Firebase/Payment error:", err);
    res.status(500).json({ error: "Completion failed", message: err.message });
  }
}
