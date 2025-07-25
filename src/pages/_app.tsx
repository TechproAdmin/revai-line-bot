import "../styles/globals.css";
import liff from "@line/liff";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [liffObject, setLiffObject] = useState<typeof liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          throw new Error(
            "LIFF ID is missing. Set NEXT_PUBLIC_LIFF_ID in your environment variables.",
          );
        }

        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID,
          withLoginOnExternalBrowser: true,
        });
        setLiffObject(liff);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("LIFF initialization failed:", error);
          setLiffError(error.message || "LIFF initialization failed");
        }
      }
    };

    // initLiff();
  }, []);

  return (
    <>
      <Head>
        <title>不動産 chatbot</title>
      </Head>
      <Component {...pageProps} liff={liffObject} liffError={liffError} />
    </>
  );
}

export default MyApp;
