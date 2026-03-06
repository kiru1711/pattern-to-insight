import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    const endpoint = isLogin ? "/admin/login" : "/admin/register";

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (isLogin) {
        // Login flow
        if (data.authenticated) {
          // Store admin info in localStorage
          localStorage.setItem("admin", JSON.stringify(data.admin));
          navigate("/analysis/admin");
        } else {
          setError(data.message || "Login failed");
        }
      } else {
        // Registration flow
        if (data.success) {
          setSuccessMessage(data.message);
          // Switch to login after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage("");
          }, 2000);
        } else {
          setError(data.message || "Registration failed");
        }
      }
    } catch (error) {
      setError("Error connecting to server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <button className="back-button" onClick={() => navigate("/role-selection")}>
          ← Back to Role Selection
        </button>

        <div className="login-card">
          <div className="login-icon">👨‍💼</div>
          <h1>{isLogin ? "Admin Login" : "Admin Registration"}</h1>
          <p className="login-subtitle">
            {isLogin 
              ? "Enter your credentials to access the admin dashboard" 
              : "Create an admin account to access the dashboard"}
          </p>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Email Address</label>
              <input
                type="email"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "Min 8 chars, 1 uppercase, 1 digit, 1 special char"}
                required
              />
              {!isLogin && (
                <small className="password-hint">
                  Password must contain: 8+ characters, 1 uppercase, 1 digit, 1 special character
                </small>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <div className="toggle-mode">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button onClick={() => { setIsLogin(false); setError(""); setSuccessMessage(""); }}>
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button onClick={() => { setIsLogin(true); setError(""); setSuccessMessage(""); }}>
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
