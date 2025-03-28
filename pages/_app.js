// pages/_app.js
import React, { useEffect } from "react";
import Script from "next/script";
import "../styles/global.css";
import Header from "../components/Header";
import { AuthProvider } from "../AuthContext";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    console.log("App Component Mounted");
  }, []);

  return (
    <>
      {/* Load Google Maps API with Places library using API key from .env */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <SessionProvider session={session}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <AnimatePresence exitBeforeEnter>
              <motion.div
                key={router.route}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </CartProvider>
        </AuthProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;