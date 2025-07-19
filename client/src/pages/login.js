import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      // Navigate to vault if login is successful
      navigate("/vault", { state: { userEmail: data.email } });
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Login failed");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="lock-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 11H6C4.9 11 4 11.9 4 13V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V13C20 11.9 19.1 11 18 11ZM12 16C11.4 16 11 15.6 11 15C11 14.4 11.4 14 12 14C12.6 14 13 14.4 13 15C13 15.6 12.6 16 12 16ZM15.5 11V9.5C15.5 7.6 14 6 12 6C10 6 8.5 7.6 8.5 9.5V11H10V9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5V11H15.5Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your password vault</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 7C6.48 7 2 9.24 2 12C2 14.76 6.48 17 12 17C17.52 17 22 14.76 22 12C22 9.24 17.52 7 12 7ZM12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5ZM12 12.5C11.72 12.5 11.5 12.72 11.5 13C11.5 13.28 11.72 13.5 12 13.5C12.28 13.5 12.5 13.28 12.5 13C12.5 12.72 12.28 12.5 12 12.5Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 7C2 7 2 12 2 12C2 12 2 17 12 17C22 17 22 12 22 12C22 12 22 7 12 7ZM12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5Z" fill="currentColor"/>
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <span>Sign In</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? 
            <Link to="/signup" className="signup-link">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;