import { useEffect } from 'react';
import '../global.css';
import '../piMemory.css';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' }); // required
      }
    };
    document.body.appendChild(script);
  }, []);
  

  return <Component {...pageProps} />;
}
