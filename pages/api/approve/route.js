export default async function handler(req, res) {
    const { paymentId } = req.body;
    const APP_SECRET = process.env.PI_APP_SECRET; // 👈 store this in Vercel
  
    try {
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${APP_SECRET}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Approval failed", message: err.message });
    }
  }
  