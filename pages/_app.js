// ✅ pages/_app.js
import { useEffect } from 'react';
import '../global.css';
import '../piMemory.css';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const loadPiSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.defer = true;
      script.onload = () => {
        if (window.Pi) {
          window.Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV !== 'production' });
        }
      };
      script.onerror = () => {
        console.error('⚠️ Failed to load Pi SDK');
      };
      document.body.appendChild(script);
    };

    if (typeof window !== 'undefined') loadPiSdk();
  }, []);

  return <Component {...pageProps} />;
}