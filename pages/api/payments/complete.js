export default async function handler(req, res) {
    const { paymentId, txid } = req.body;
    const APP_SECRET = process.env.PI_APP_SECRET;
  
    try {
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${APP_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Completion failed", message: err.message });
    }
  }
  