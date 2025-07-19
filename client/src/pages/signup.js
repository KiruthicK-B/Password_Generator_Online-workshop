import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: ''
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('success', 'Account created successfully!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        showNotification('error', data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="signup-container">
      {/* Professional Notification */}
      <div className={`notification ${notification.show ? 'show' : ''} ${notification.type}`}>
        <div className="notification-content">
          <div className="notification-icon">
            {notification.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={closeNotification}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <div className="user-plus-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 11L16 13M16 13L16 15M16 13L18 13M16 13L14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>Create Account</h2>
          <p>Join us to secure your passwords</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                onChange={handleChange}
                className="form-input"
                value={form.fullName}
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                onChange={handleChange}
                className="form-input"
                value={form.email}
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
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                required
                onChange={handleChange}
                className="form-input"
                value={form.password}
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

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <span>Create Account</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? 
            <Link to="/login" className="login-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;