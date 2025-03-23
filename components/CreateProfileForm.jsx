// components/CreateProfileForm.jsx
import React, { useState } from "react";
import styles from "../styles/create.module.css";

const CreateProfileForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChef, setIsChef] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Is Chef:", isChef);

    try {
      const response = await fetch(`/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, isChef }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log("Response data:", data);
      setResponseData(data);
      setUsername("");
      setEmail("");
      setPassword("");
      setIsChef(false);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Error registering user:", error);
      setResponseData({ message: "Failed to register user" });
    }
  };

  return (
    <div>
      <h2 className={styles.createProfileTitle}>Create Your Profile</h2>
      <form className={styles.createContainer} onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <label className={styles.create}>Username</label>
          <input
            className={styles.inputCreate}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputContainer}>
          <label className={styles.create}>Email</label>
          <input
            className={styles.inputCreate}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputContainer}>
          <label className={styles.create}>Password</label>
          <input
            className={styles.inputCreate}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputContainer}>
          <label className={styles.create}>
            <input
              type="checkbox"
              checked={isChef}
              onChange={(e) => setIsChef(e.target.checked)}
            />{" "}
            I am a chef
          </label>
        </div>

        <button type="submit" className={styles.createSubmit}>
          Submit
        </button>
        {registrationSuccess && (
          <div>
            <h3>Thank you for registering!</h3>
          </div>
        )}
        {responseData && (
          <div>
            <h3>Response from server:</h3>
            <pre className={styles.return}>{responseData.message}</pre>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateProfileForm;