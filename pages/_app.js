import '../global.css'
import '../piMemory.css'
import Script from 'next/script';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: true });
    }
  }, []);

  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Pi) {
            window.Pi.init({ version: '2.0', sandbox: true });
          }
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
