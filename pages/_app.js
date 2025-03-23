// pages/_app.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/global.css";
import Header from "../components/Header";
import { AuthProvider } from "../AuthContext";
import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "../context/CartContext";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <CartProvider>
          {/* Redirect chef users from the homepage */}
          <RedirectIfChef />
          <Header />
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

function RedirectIfChef() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait until session is loaded
    if (status === "loading") return;

    // Only redirect if on the homepage and the user is a chef
    if (router.pathname === "/" && session?.user?.isChef) {
      router.push("/chef/dashboard");
    }
  }, [router, session, status]);

  return null;
}

export default MyApp;