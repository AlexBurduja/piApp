
import '../global.css'
import '../piMemory.css'
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Pi) {
            console.log("✅ Pi SDK loaded");
            window.Pi.init({ version: "2.0", sandbox: true });
          } else {
            console.warn("❌ Pi SDK NOT found after script load");
          }
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;