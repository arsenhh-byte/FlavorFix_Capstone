// components/Header.jsx
import Link from "next/link";
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SearchBar from "./SearchBar";
import FavoritesList from "./FavoritesList";
import { useCart } from "../context/CartContext"; // import cart context
import styles from "../styles/favorites.module.css";

const Header = ({ onSearch }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems } = useCart(); // get cart items

  const [showMenu, setShowMenu] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const toggleMenu = () => setShowMenu(!showMenu);
  const scrollToAbout = () =>
    document.querySelector(".body-content").scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () =>
    document.querySelector(".footer-text").scrollIntoView({ behavior: "smooth" });
  const toggleLoginForm = () => setShowLoginForm(!showLoginForm);
  const handleLogoClick = () => onSearch([""]);

  // Handle login using NextAuth's signIn
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
    });
    console.log("signIn result:", result);
    if (result.error) {
      setLoginError("Invalid credentials");
    } else {
      setShowLoginForm(false);
      window.location.reload();
    }
  };

  // Handle logout using NextAuth's signOut
  const handleLogout = () => signOut();

  const handleFavoritesClick = () => {
    if (!session) {
      alert("Please log in to view favorites");
      return;
    }
    setShowFavorites((prev) => !prev);
  };

  return (
    <header className="header" style={{ backgroundImage: "url('/bg1.png')" }}>
      <div>
        <label className="hamburger-menu" onClick={toggleMenu}>
          &#9776;
        </label>
        <div
          className={`header-buttons ${showMenu ? "header-buttons-active" : ""}`}
          id="hamburger-buttons"
        >
          <button className="button-ind" onClick={scrollToAbout}>
            About
          </button>
          <button className="button-ind" onClick={scrollToContact}>
            Contact
          </button>
          {session ? (
            <button className="button-ind" onClick={handleLogout}>
              Log Out
            </button>
          ) : (
            <button className="button-ind" onClick={toggleLoginForm}>
              Log In
            </button>
          )}
          {/* Updated Link usage */}
          <Link href="/cart" className="button-ind">
            Cart ({cartItems.length})
          </Link>
          <button onClick={handleFavoritesClick} className="button-ind">
            {showFavorites ? "Hide Favorites" : "My Favorites"}
          </button>
        </div>
      </div>

      <div className="logo-container">
        <Link href="/">
          <span onClick={handleLogoClick}>
            <img src="/logo.png" alt="Logo" className="header-logo" />
          </span>
        </Link>
      </div>

      <section className="search-section">
        <SearchBar onSearch={onSearch} />
      </section>

      {session && (
        <p>
          <strong>You are logged in as {session.user.email}.</strong>
        </p>
      )}

      {!session && showLoginForm && (
        <div className="login-modal">
          <div className="login-container">
            <button className="closeButton" onClick={() => setShowLoginForm(false)}>
              X
            </button>
            <form onSubmit={handleLoginSubmit}>
              <label className="login">Email:</label>
              <input
                className="inputLogin"
                type="email"
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <label className="login">Password:</label>
              <input
                className="inputLogin"
                type="password"
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && <p style={{ color: "red" }}>{loginError}</p>}
              <button className="loginSubmit" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {session && showFavorites && <FavoritesList />}
    </header>
  );
};

export default Header;