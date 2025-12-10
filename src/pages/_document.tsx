import { Html, Head, Main, NextScript, DocumentContext } from "next/document";

// Helper function to safely get environment variables
const getClientEnv = () => {
  // Only access process.env on the server side during build
  if (typeof process !== "undefined") {
    return {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      NEXT_PUBLIC_BASE_URL:
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
    };
  }

  // Fallback for client-side (shouldn't happen in _document.tsx)
  return {
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: "",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3001",
  };
};

// Only include the env variables we need in the browser
const clientEnv = getClientEnv();

console.log("clientEnv", clientEnv);

const envScript = `
  // Make environment variables available in the browser
  window.ENV = ${JSON.stringify(clientEnv)};

  // For backward compatibility
  window.process = window.process || {};
  window.process.env = window.process.env || {};

  // Set environment variables for client-side access
  Object.entries(${JSON.stringify(clientEnv)}).forEach(([key, value]) => {
    window.process.env[key] = value;
  });
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Inject environment variables */}
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// Only collect styles on the server
Document.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);
  return { ...initialProps };
};
