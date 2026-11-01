
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth/register";

export default function ParentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSuccess("Registration successful! Redirecting to login...");

      // Give React time to display the success message.
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
        background: "linear-gradient(135deg, #f0f5ff, #fff1f7)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          boxSizing: "border-box",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "0 12px 35px rgba(0,0,0,0.10)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ fontSize: "44px" }}>🎨</div>

          <h1 style={{ margin: "10px 0", color: "#263b70" }}>
            Parent Sign Up
          </h1>

          <p style={{ color: "#667085", lineHeight: 1.5 }}>
            Create an account to support your little artist.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="name"
            style={labelStyle}
          >
            Parent Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            maxLength={60}
            autoComplete="name"
            required
            style={inputStyle}
          />

          <label
            htmlFor="email"
            style={labelStyle}
          >
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            maxLength={254}
            autoComplete="email"
            required
            style={inputStyle}
          />

          <label
            htmlFor="password"
            style={labelStyle}
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
            style={inputStyle}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0 18px",
              fontSize: "14px",
              color: "#475467"
            }}
          >
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) =>
                setShowPassword(event.target.checked)
              }
            />
            Show password
          </label>

          {error && (
            <p
              role="alert"
              style={{
                padding: "10px",
                background: "#fff0f0",
                color: "#b42318",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                padding: "10px",
                background: "#ecfdf3",
                color: "#18794e",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "9px",
              background: loading ? "#8798c4" : "#3457c5",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "#475467"
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#3457c5",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            Sign In
          </Link>
        </p>

        <p style={{ textAlign: "center", marginBottom: 0 }}>
          <Link
            to="/"
            style={{
              color: "#667085",
              fontSize: "13px",
              textDecoration: "none"
            }}
          >
            ← Back to CreativeKids
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginTop: "15px",
  marginBottom: "7px",
  fontWeight: "bold",
  fontSize: "14px",
  color: "#344054"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #d0d5dd",
  borderRadius: "8px",
  fontSize: "15px",
  outlineColor: "#3457c5"
};
