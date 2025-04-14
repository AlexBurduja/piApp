import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Pi SDK Script */}
          <script src="https://sdk.minepi.com/pi-sdk.js" defer></script>

          {/* Pi.init() call */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function () {
                  if (window.Pi) {
                    Pi.init({ version: '2.0', sandbox: ${process.env.NODE_ENV !== 'production'} });
                    console.log('✅ Pi SDK initialized');
                  } else {
                    console.warn('❌ Pi SDK missing');
                  }
                });
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
