// pages/index.js
import React, { useState } from "react";
import { signIn } from "next-auth/react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Call NextAuth signIn with credentials
    const result = await signIn("credentials", {
      redirect: false, // remain on the same page if login fails
      email,
      password
    });

    if (result.error) {
      setError("Invalid credentials");
    } else {
      // Login success => redirect or show success message
      window.location.href = "/"; 
      // Or if you prefer: router.push("/favorites") 
    }
  };

  return (
    <div>
      <h1>Welcome to Ucook</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
