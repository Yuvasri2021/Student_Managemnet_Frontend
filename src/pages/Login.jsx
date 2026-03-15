import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdSchool,
} from "react-icons/md";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { token, role, user: userData } = response.data;
      const email = userData?.gmail || form.email;
      const userId = userData?._id || userData?.id;
      const name = userData?.name;
      
      login(token, role, name, email, userId);

      // Navigate based on role
      if (role === "admin") {
        navigate("/dashboard/admin");
      } else if (role === "faculty") {
        navigate("/dashboard/faculty");
      } else if (role === "student") {
        navigate("/dashboard/student");
      } else {
        navigate("/dashboard/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      {/* Login Card */}
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <MdSchool size={40} />
          </div>
          <h1 style={styles.brandTitle}>Student Activity Portal</h1>
          <p style={styles.brandSubtitle}>Extra-Curricular Management System</p>
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <h2 style={styles.formTitle}>Welcome Back</h2>
          <p style={styles.formSubtitle}>Sign in to continue to your dashboard</p>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <MdEmail style={styles.inputIcon} size={20} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <MdLock style={styles.inputIcon} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  style={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                <span style={styles.checkboxText}>Remember me</span>
              </label>
              <a href="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Sign In
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <p style={styles.signupText}>
            Don't have an account?{" "}
            <a href="/register" style={styles.signupLink}>
              Create Account
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 Student Activity Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    padding: isMobile ? "16px" : "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  bgAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
    top: "-250px",
    left: "-250px",
    animation: "float 20s ease-in-out infinite",
  },
  circle2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
    bottom: "-200px",
    right: "-200px",
    animation: "float 15s ease-in-out infinite reverse",
  },
  circle3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    animation: "pulse 10s ease-in-out infinite",
  },
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: isMobile ? "16px" : "24px",
    padding: isMobile ? "24px" : isTablet ? "36px" : "48px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
    border: "1px solid #27272A",
    position: "relative",
    zIndex: 1,
  },
  logoSection: {
    textAlign: "center",
    marginBottom: isMobile ? "28px" : "40px",
  },
  logoIcon: {
    width: isMobile ? "64px" : "80px",
    height: isMobile ? "64px" : "80px",
    margin: isMobile ? "0 auto 16px" : "0 auto 20px",
    background: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
    borderRadius: isMobile ? "16px" : "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
  },
  brandTitle: {
    fontSize: isMobile ? "22px" : isTablet ? "24px" : "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  brandSubtitle: {
    fontSize: isMobile ? "12px" : "14px",
    color: "#71717A",
  },
  formSection: {
    marginTop: "32px",
  },
  formTitle: {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "8px",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: isMobile ? "13px" : "14px",
    color: "#A1A1AA",
    marginBottom: isMobile ? "24px" : "32px",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#2D1515",
    border: "1px solid #EF4444",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "24px",
  },
  errorText: {
    color: "#EF4444",
    fontSize: "14px",
    fontWeight: "500",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "16px" : "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#A1A1AA",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    color: "#71717A",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: isMobile ? "12px 16px 12px 44px" : "14px 16px 14px 48px",
    fontSize: isMobile ? "14px" : "15px",
    border: "1px solid #27272A",
    borderRadius: isMobile ? "10px" : "12px",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    color: "#FFFFFF",
    backgroundColor: "#141414",
  },
  togglePassword: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    color: "#71717A",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  formOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: isMobile ? "wrap" : "nowrap",
    gap: isMobile ? "12px" : "0",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  checkboxText: {
    fontSize: isMobile ? "13px" : "14px",
    color: "#A1A1AA",
  },
  forgotLink: {
    fontSize: isMobile ? "13px" : "14px",
    color: "#818CF8",
    textDecoration: "none",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%",
    padding: isMobile ? "12px" : "14px",
    fontSize: isMobile ? "15px" : "16px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
    border: "none",
    borderRadius: isMobile ? "10px" : "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
    marginTop: "8px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "12px" : "16px",
    margin: isMobile ? "24px 0" : "32px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#27272A",
  },
  dividerText: {
    color: "#71717A",
    fontSize: "14px",
  },
  signupText: {
    textAlign: "center",
    fontSize: "15px",
    color: "#A1A1AA",
    margin: 0,
  },
  signupLink: {
    color: "#818CF8",
    textDecoration: "none",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: isMobile ? "12px" : "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1,
    width: isMobile ? "90%" : "auto",
    textAlign: "center",
  },
  footerText: {
    fontSize: isMobile ? "11px" : "13px",
    color: "#52525B",
    margin: 0,
  },
};

export default Login;
