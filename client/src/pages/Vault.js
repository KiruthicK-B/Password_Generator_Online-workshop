import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Vault.css";

const Vault = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.userEmail;

  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    website: "",
    username: "",
    password: "",
  });
  const [showPasswords, setShowPasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullName, setFullName] = useState("User");
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Professional alert system
  const showAlert = (message, type = 'info', duration = 4000) => {
    setAlert({ message, type, id: Date.now() });
    setTimeout(() => setAlert(null), duration);
  };

  // Fetch saved vault entries and user info
  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    
    // Get saved passwords
    fetch(`http://localhost:5000/vault/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries([]);
        }
      })
      .catch(() => {
        showAlert("Failed to load vault data", "error");
      });

    // Get full name
    fetch("http://localhost:5000/userinfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    })
      .then((res) => res.json())
      .then((data) => setFullName(data.fullName || "User"))
      .catch(() => {
        showAlert("Failed to load user information", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userEmail, navigate]);

  const generatePassword = async () => {
    setIsGenerating(true);
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let generated = "";

    await new Promise((resolve) => setTimeout(resolve, 800));

    for (let i = 0; i < 16; i++) {
      generated += charset[Math.floor(Math.random() * charset.length)];
    }
    setFormData({ ...formData, password: generated });
    setIsGenerating(false);
    showAlert("Strong password generated successfully", "success");
  };

  const handleSave = () => {
    if (!formData.website || !formData.username || !formData.password) {
      showAlert("Please fill in all required fields", "warning");
      return;
    }

    const payload = {
      ...formData,
      userEmail: userEmail,
    };

    fetch("http://localhost:5000/vault", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((updatedEntry) => {
        setEntries((prev) => {
          const existingIndex = prev.findIndex(
            (e) =>
              e.website === updatedEntry.website &&
              e.username === updatedEntry.username
          );
          const newList = [...prev];
          if (existingIndex >= 0) {
            newList[existingIndex] = updatedEntry;
            showAlert("Password updated successfully", "success");
          } else {
            newList.push(updatedEntry);
            showAlert("Password saved successfully", "success");
          }
          return newList;
        });
        setFormData({ website: "", username: "", password: "" });
        setShowAddForm(false);
      })
      .catch(() => {
        showAlert("Failed to save password", "error");
      });
  };

  const handleDelete = async (id, website) => {
    if (!window.confirm(`Are you sure you want to delete the password for ${website}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/vault/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry._id !== id));
        showAlert("Password deleted successfully", "success");
      } else {
        showAlert("Failed to delete password", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("An error occurred while deleting", "error");
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert(`${type} copied to clipboard`, "success", 2000);
    } catch (err) {
      showAlert("Failed to copy to clipboard", "error");
    }
  };

  const handleLogout = () => {
    showAlert("Logging out...", "info", 1500);
    setTimeout(() => navigate("/"), 1500);
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWebsiteIcon = (website) => {
    const domain = website.toLowerCase();
    if (domain.includes('google') || domain.includes('gmail')) return '🔍';
    if (domain.includes('facebook')) return '📘';
    if (domain.includes('twitter')) return '🐦';
    if (domain.includes('instagram')) return '📸';
    if (domain.includes('github')) return '🐙';
    if (domain.includes('netflix')) return '🎬';
    if (domain.includes('spotify')) return '🎵';
    if (domain.includes('amazon')) return '📦';
    return website.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="vault-loading">
        <div className="loading-spinner"></div>
        <p>Loading your vault...</p>
      </div>
    );
  }

  return (
    <div className="vault-container">
      {/* Professional Alert System */}
      {alert && (
        <div className={`alert alert-${alert.type}`} key={alert.id}>
          <div className="alert-content">
            <div className="alert-icon">
              {alert.type === 'success' && '✓'}
              {alert.type === 'error' && '✕'}
              {alert.type === 'warning' && '⚠'}
              {alert.type === 'info' && 'ℹ'}
            </div>
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="alert-close">
            ✕
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="vault-header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-avatar">
              <div className="avatar-circle">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="user-status"></div>
            </div>
            <div className="user-info">
              <h1 className="welcome-text">Welcome back, {fullName}</h1>
              <p className="user-email">{userEmail}</p>
              <div className="vault-stats">
                <span className="stat-item">
                  <span className="stat-number">{entries.length}</span>
                  <span className="stat-label">Passwords</span>
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddForm(!showAddForm)} 
              className="add-password-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="vault-main">
        {/* Enhanced Add Password Form */}
        {showAddForm && (
          <section className="add-password-section">
            <div className="form-header">
              <h2>Add New Password</h2>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="close-form-btn"
              >
                ✕
              </button>
            </div>
            <form className="password-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="website">Website/Service</label>
                  <input
                    id="website"
                    type="text"
                    placeholder="e.g., gmail.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username/Email</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username or email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type="text"
                    placeholder="Enter password or generate one"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input password-input"
                  />
                  <button 
                    type="button"
                    onClick={generatePassword} 
                    className="generate-password-btn"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="spinner"></div>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Password
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Enhanced Password List */}
        <section className="passwords-section">
          <div className="section-header">
            <div className="header-info">
              <h2>Your Passwords</h2>
              <span className="password-count">{filteredEntries.length} passwords</span>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")} 
                    className="clear-search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>No passwords found</h3>
              <p>{searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first password'}</p>
              {!searchTerm && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="add-first-password-btn"
                >
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <div className="passwords-grid">
              {filteredEntries.map((entry) => (
                <div key={entry._id} className="password-card">
                  <div className="card-header">
                    <div className="website-info">
                      <div className="website-icon">
                        {getWebsiteIcon(entry.website)}
                      </div>
                      <div className="website-details">
                        <h3 className="website-name">{entry.website}</h3>
                        <p className="username">{entry.username}</p>
                      </div>
                    </div>
                    <div className="card-menu">
                      <button
                        onClick={() => handleDelete(entry._id, entry.website)}
                        className="delete-btn"
                        title="Delete password"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="password-field">
                    <div className="password-display">
                      <input
                        type={showPasswords[entry._id] ? "text" : "password"}
                        value={entry.password}
                        readOnly
                        className="password-input"
                      />
                    </div>
                    <div className="password-actions">
                      <button
                        onClick={() => togglePasswordVisibility(entry._id)}
                        className="action-btn"
                        title={showPasswords[entry._id] ? "Hide password" : "Show password"}
                      >
                        {showPasswords[entry._id] ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C3.24389 9.68192 5.231 7.81663 7.62 6.69L17.94 17.94Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.5768 14.1515 19.6 15L9.9 4.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S4 4 12 4S23 12 23 12S20 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(entry.password, 'Password')}
                        className="action-btn copy-btn"
                        title="Copy password"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Vault;







// import "../styles/Vault.css";
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const Vault = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const userEmail = location.state?.userEmail;

//   const [entries, setEntries] = useState([]);
//   const [formData, setFormData] = useState({ website: "", username: "", password: "" });
//   const [showPasswords, setShowPasswords] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [fullName, setFullName] = useState("User");
//   const [notification, setNotification] = useState({ show: false, message: '', type: '' });
//   const [isLoading, setIsLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);

//   const showNotification = (message, type = 'success') => {
//     setNotification({ show: true, message, type });
//     setTimeout(() => {
//       setNotification({ show: false, message: '', type: '' });
//     }, 4000);
//   };

//   useEffect(() => {
//     if (!userEmail) {
//       navigate('/');
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const [vaultResponse, userResponse] = await Promise.all([
//           fetch(`/api/vault/${userEmail}`),
//           fetch("/api/userinfo", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: userEmail }),
//           }),
//         ]);

//         const vaultData = vaultResponse.ok ? await vaultResponse.json() : [];
//         const userData = userResponse.ok ? await userResponse.json() : { fullName: "User" };

//         setEntries(Array.isArray(vaultData) ? vaultData : []);
//         setFullName(userData.fullName || "User");
//       } catch (error) {
//         console.error("Fetch error:", error);
//         showNotification("Failed to load data. Please try again.", "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [userEmail, navigate]);

//   const generatePassword = async () => {
//     setIsGenerating(true);
//     const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
//     let generated = "";

//     await new Promise(resolve => setTimeout(resolve, 800));
//     for (let i = 0; i < 16; i++) {
//       generated += charset[Math.floor(Math.random() * charset.length)];
//     }

//     setFormData({ ...formData, password: generated });
//     setIsGenerating(false);
//     showNotification("Secure password generated successfully!");
//   };

//   const handleSave = async () => {
//     if (!formData.website || !formData.username || !formData.password) {
//       showNotification("Please fill in all required fields", "error");
//       return;
//     }

//     try {
//       const response = await fetch("/api/vault", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, userEmail }),
//       });

//       if (!response.ok) throw new Error("Save failed");
//       const updatedEntry = await response.json();

//       setEntries(prev => {
//         const existingIndex = prev.findIndex(
//           e => e.website === updatedEntry.website && e.username === updatedEntry.username
//         );
//         const newList = [...prev];
//         if (existingIndex >= 0) {
//           newList[existingIndex] = updatedEntry;
//           showNotification("Password updated successfully!");
//         } else {
//           newList.push(updatedEntry);
//           showNotification("Password saved successfully!");
//         }
//         return newList;
//       });

//       setFormData({ website: "", username: "", password: "" });
//       setShowForm(false);
//     } catch (error) {
//       console.error("Save error:", error);
//       showNotification("Failed to save password. Please try again.", "error");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!id || !window.confirm("Are you sure you want to delete this entry?")) return;

//     try {
//       const response = await fetch(`/api/vault/${id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) throw new Error("Server responded with failure");

//       setEntries(prev => prev.filter(entry => entry._id !== id));
//       showNotification("Password deleted successfully!");
//     } catch (error) {
//       console.error("Delete failed:", error);
//       showNotification("Failed to delete password. Please try again.", "error");
//     }
//   };

//   const togglePasswordVisibility = (id) => {
//     setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
//   };

//   const copyToClipboard = async (text, label) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       showNotification(`${label} copied to clipboard!`);
//     } catch (error) {
//       showNotification(`Failed to copy ${label.toLowerCase()}`, "error");
//     }
//   };

//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       navigate("/");
//     }
//   };

//   const filteredEntries = entries.filter(entry =>
//     entry.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     entry.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (isLoading) {
//     return (
//       <div className="vault-container">
//         <div className="loading-screen">
//           <div className="loading-spinner" />
//           <p>Loading your secure vault...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="vault-container">
//       {/* Professional Notification System */}
//       {notification.show && (
//         <div className={`notification ${notification.type}`}>
//           <div className="notification-content">
//             <div className="notification-icon">
//               {notification.type === 'success' ? (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
//                 </svg>
//               ) : (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
//                   <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
//                   <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
//                 </svg>
//               )}
//             </div>
//             <span>{notification.message}</span>
//             <button 
//               onClick={() => setNotification({ show: false, message: '', type: '' })}
//               className="notification-close"
//             >
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                 <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
//                 <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Enhanced Header */}
//       <header className="vault-header">
//         <div className="header-content">
//           <div className="brand-section">
//             <div className="brand-logo">
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//                 <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
//                 <circle cx="12" cy="16" r="1" fill="currentColor"/>
//                 <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//             <div className="brand-info">
//               <h1>SecureVault</h1>
//               <p>Your personal password manager</p>
//             </div>
//           </div>
          
//           <div className="user-section">
//             <div className="user-info">
//               <div className="user-avatar">
//                 {fullName.charAt(0).toUpperCase()}
//               </div>
//               <div className="user-details">
//                 <span className="user-name">{fullName}</span>
//                 <span className="user-email">{userEmail}</span>
//               </div>
//             </div>
//             <button onClick={handleLogout} className="logout-btn">
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                 <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="vault-main">
//         <div className="vault-content">
//           {/* Stats Section */}
//           <div className="stats-section">
//             <div className="stat-card">
//               <div className="stat-icon">
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                   <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
//                   <circle cx="12" cy="16" r="1" fill="currentColor"/>
//                 </svg>
//               </div>
//               <div className="stat-info">
//                 <h3>{entries.length}</h3>
//                 <p>Stored Passwords</p>
//               </div>
//             </div>
            
//             <div className="stat-card">
//               <div className="stat-icon">
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                   <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
//                 </svg>
//               </div>
//               <div className="stat-info">
//                 <h3>100%</h3>
//                 <p>Encrypted</p>
//               </div>
//             </div>
//           </div>

//           {/* Action Bar */}
//           <div className="action-bar">
//             <div className="search-container">
//               <div className="search-box">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
//                   <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search your passwords..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="search-input"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="search-clear"
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
//                       <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             </div>
            
//             <button 
//               onClick={() => setShowForm(!showForm)} 
//               className={`add-btn ${showForm ? 'active' : ''}`}
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
//                 <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
//               </svg>
//               Add Password
//             </button>
//           </div>

//           {/* Add Password Form */}
//           {showForm && (
//             <div className="add-password-section">
//               <div className="form-header">
//                 <h3>Add New Password</h3>
//                 <button
//                   onClick={() => {
//                     setShowForm(false);
//                     setFormData({ website: "", username: "", password: "" });
//                   }}
//                   className="form-close"
//                 >
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                     <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
//                     <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
//                   </svg>
//                 </button>
//               </div>
              
//               <form className="password-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label htmlFor="website">Website/Service *</label>
//                     <input
//                       id="website"
//                       type="text"
//                       placeholder="e.g., gmail.com, facebook.com"
//                       value={formData.website}
//                       onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//                       className="form-input"
//                       required
//                     />
//                   </div>
                  
//                   <div className="form-group">
//                     <label htmlFor="username">Username/Email *</label>
//                     <input
//                       id="username"
//                       type="text"
//                       placeholder="Enter username or email"
//                       value={formData.username}
//                       onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                       className="form-input"
//                       required
//                     />
//                   </div>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="password">Password *</label>
//                   <div className="password-input-group">
//                     <input
//                       id="password"
//                       type="text"
//                       placeholder="Enter password or generate a secure one"
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="form-input"
//                       required
//                     />
//                     <button 
//                       type="button"
//                       onClick={generatePassword} 
//                       className="generate-btn"
//                       disabled={isGenerating}
//                     >
//                       {isGenerating ? (
//                         <div className="spinner-small"></div>
//                       ) : (
//                         <>
//                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                             <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                           Generate Secure Password
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="form-actions">
//                   <button 
//                     type="button" 
//                     onClick={() => {
//                       setShowForm(false);
//                       setFormData({ website: "", username: "", password: "" });
//                     }}
//                     className="cancel-btn"
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="save-btn">
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                       <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                       <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                     Save Password
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {/* Passwords Grid */}
//           <div className="passwords-section">
//             <div className="section-header">
//               <h3>Your Passwords</h3>
//               <span className="entries-count">{filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}</span>
//             </div>

//             {filteredEntries.length === 0 ? (
//               <div className="empty-state">
//                 <div className="empty-icon">
//                   <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
//                     <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
//                     <circle cx="12" cy="16" r="1" fill="currentColor"/>
//                     <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </div>
//                 <h4>{searchTerm ? 'No matching passwords found' : 'No passwords stored yet'}</h4>
//                 <p>
//                   {searchTerm 
//                     ? 'Try adjusting your search terms or clear the search to see all passwords.' 
//                     : 'Get started by adding your first password using the form above.'
//                   }
//                 </p>
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="clear-search-btn">
//                     Clear Search
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="passwords-grid">
//                 {filteredEntries.map((entry) => (
//                   <div key={entry.id || entry._id} className="password-card">
//                     <div className="card-header">
//                       <div className="site-info">
//                         <div className="site-favicon">
//                           {entry.website?.charAt(0).toUpperCase() || 'W'}
//                         </div>
//                         <div className="site-details">
//                           <h4 className="site-name">{entry.website}</h4>
//                           <p className="site-username">{entry.username}</p>
//                         </div>
//                       </div>
                      
//                       <div className="card-actions-header">
//                         <button
//                           onClick={() => copyToClipboard(entry.username, 'Username')}
//                           className="action-btn-small"
//                           title="Copy username"
//                         >
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                             <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
//                             <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                         </button>
                        
//                         <button
//                           onClick={() => handleDelete(entry._id || entry.id)}
//                           className="action-btn-small delete"
//                           title="Delete password"
//                         >
//                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                             <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                             <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="password-field">
//                       <div className="password-input-wrapper">
//                         <input
//                           type={showPasswords[entry.id || entry._id] ? "text" : "password"}
//                           value={entry.password}
//                           readOnly
//                           className="password-display"
//                         />
//                         <div className="password-actions">
//                           <button
//                             onClick={() => togglePasswordVisibility(entry.id || entry._id)}
//                             className="action-btn"
//                             title={showPasswords[entry.id || entry._id] ? "Hide password" : "Show password"}
//                           >
//                             {showPasswords[entry.id || entry._id] ? (
//                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                 <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C3.24389 9.68192 5.231 7.81663 7.62 6.69L17.94 17.94Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.5768 14.1515 19.6 15L9.9 4.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                               </svg>
//                             ) : (
//                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                                 <path d="M1 12S4 4 12 4S23 12 23 12S20 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
//                               </svg>
//                             )}
//                           </button>
//                           <button
//                             onClick={() => copyToClipboard(entry.password, 'Password')}
//                             className="action-btn primary"
//                             title="Copy password"
//                           >
//                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                               <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
//                               <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Vault;