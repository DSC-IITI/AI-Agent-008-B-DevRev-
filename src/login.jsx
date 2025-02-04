import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import "./App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      console.log("Login successful:", data);
      // Handle successful login (e.g., store token, redirect)
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }

    setLoading(false);
  };

  return (
    <div className="app-container" style={{ width: '40%', margin: 'auto', fontSize: '2rem'}}>
      <div className="content-wrapper">
        <div className="card">
          <div className="header">
            <LogIn className="header-icon" />
            <h1>Login</h1>
            <p className="header-subtitle">Access your account</p>
          </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'column', gap: '1rem', padding: '3rem', width: '70%', margin: 'auto' }}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />

                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />

                <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <Loader2 className="loading-icon" /> : "Login"}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
           </div>
        </div>
    </div>
  );
}
