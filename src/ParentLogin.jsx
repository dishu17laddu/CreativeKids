
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ParentLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your details."
        );
      }

      if (!data.token) {
        throw new Error(
          "The server did not return a login token. Please check your backend login route."
        );
      }

      if (!data.parent) {
        throw new Error(
          "Parent details were not returned by the server."
        );
      }

      // Save login token
      localStorage.setItem("parentToken", data.token);

      // Save parent name and email
      localStorage.setItem(
        "parentInfo",
        JSON.stringify(data.parent)
      );

      setMessage("Login successful! Welcome to CreativeKids.");

      navigate("/");
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <Link to="/" style={styles.logo}>
          🎨 CreativeKids
        </Link>

        <Link to="/" style={styles.homeLink}>
          ← Back to Home
        </Link>
      </nav>

      <main style={styles.main}>
        <section style={styles.card}>
          <div style={styles.icon}>👨‍👩‍👧</div>

          <h1 style={styles.heading}>Parent Login</h1>

          <p style={styles.subtitle}>
            Welcome back! Sign in to continue your creative journey.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="parent-email" style={styles.label}>
              Email Address
            </label>

            <input
              id="parent-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              style={styles.input}
              disabled={loading}
            />

            <label htmlFor="parent-password" style={styles.label}>
              Password
            </label>

            <div style={styles.passwordBox}>
              <input
                id="parent-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                style={styles.passwordInput}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                style={styles.showButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <p role="alert" style={styles.error}>
                {error}
              </p>
            )}

            {message && (
              <div role="status" style={styles.success}>
                {message}
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <p style={styles.registerText}>
            Don't have a parent account?{" "}
            <Link to="/parent-register" style={styles.link}>
              Sign Up
            </Link>
          </p>

          <p style={styles.note}>
            Parent login is verified by the CreativeKids backend.
          </p>

          <p style={styles.footerText}>
            Want to explore the artwork?{" "}
            <Link to="/" style={styles.link}>
              Visit Gallery
            </Link>
          </p>
        </section>

        <p style={styles.bottomText}>
          💛 A happy place for little artists and their families.
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fff8ed, #f1f5ff)",
    fontFamily: "Arial, sans-serif",
    color: "#25304a",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    padding: "20px 7%",
    background: "#ffffff",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  logo: {
    color: "#5844b5",
    fontSize: "22px",
    fontWeight: "bold",
    textDecoration: "none",
  },
  homeLink: {
    color: "#5844b5",
    textDecoration: "none",
    fontWeight: "bold",
  },
  main: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "35px 16px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(54, 50, 100, 0.12)",
  },
  icon: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "10px",
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    margin: "8px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "#697386",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "26px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "8px",
    marginTop: "16px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #d9deea",
    borderRadius: "9px",
    fontSize: "15px",
    outlineColor: "#7663d8",
  },
  passwordBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d9deea",
    borderRadius: "9px",
    overflow: "hidden",
  },
  passwordInput: {
    width: "100%",
    minWidth: 0,
    padding: "13px",
    border: "none",
    outline: "none",
    fontSize: "15px",
  },
  showButton: {
    border: "none",
    background: "#ffffff",
    color: "#5844b5",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  loginButton: {
    width: "100%",
    marginTop: "22px",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    background: "#6551c7",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },
  registerText: {
    textAlign: "center",
    fontSize: "14px",
    marginTop: "22px",
  },
  error: {
    background: "#fff0f0",
    color: "#b42318",
    borderRadius: "7px",
    padding: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  success: {
    background: "#ecfdf3",
    color: "#18794e",
    borderRadius: "7px",
    padding: "12px",
    marginTop: "15px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  note: {
    color: "#697386",
    fontSize: "12px",
    lineHeight: 1.5,
    textAlign: "center",
    marginTop: "18px",
  },
  footerText: {
    textAlign: "center",
    fontSize: "14px",
    marginTop: "22px",
  },
  link: {
    color: "#5844b5",
    fontWeight: "bold",
    textDecoration: "none",
  },
  bottomText: {
    textAlign: "center",
    color: "#697386",
    fontSize: "13px",
    marginTop: "22px",
  },
};
