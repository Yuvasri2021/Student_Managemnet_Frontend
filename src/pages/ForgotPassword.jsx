import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  MdEmail,
  MdLock,
  MdSchool,
  MdArrowBack,
  MdCheckCircle,
} from "react-icons/md";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log('Requesting OTP for email:', email);

    try {
      const response = await API.post("/forgot-password/request-otp", { email });
      console.log('OTP Response:', response.data);
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      console.error('OTP Request Error:', err);
      console.error('Error Response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.post("/forgot-password/verify-otp", {
        email,
        otp,
      });
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/forgot-password/reset-password", {
        email,
        newPassword,
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await API.post("/forgot-password/resend-otp", { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
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

      {/* Card */}
      <div style={styles.card}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate("/login")}>
          <MdArrowBack size={20} />
          Back to Login
        </button>

        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <MdSchool size={40} />
          </div>
          <h1 style={styles.brandTitle}>Reset Password</h1>
          <p style={styles.brandSubtitle}>
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressSteps}>
          <div style={{ ...styles.step, ...(step >= 1 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>1</div>
            <span style={styles.stepLabel}>Email</span>
          </div>
          <div style={styles.stepLine}></div>
          <div style={{ ...styles.step, ...(step >= 2 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>2</div>
            <span style={styles.stepLabel}>OTP</span>
          </div>
          <div style={styles.stepLine}></div>
          <div style={{ ...styles.step, ...(step >= 3 ? styles.stepActive : {}) }}>
            <div style={styles.stepNumber}>3</div>
            <span style={styles.stepLabel}>Reset</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <MdCheckCircle size={20} />
            <p style={styles.successText}>{success}</p>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <MdEmail style={styles.inputIcon} size={20} />
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength="6"
                style={{ ...styles.input, textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
              />
              <p style={styles.helperText}>
                Check your email for the OTP. It will expire in 10 minutes.
              </p>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              style={styles.resendBtn}
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <MdLock style={styles.inputIcon} size={20} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <MdLock style={styles.inputIcon} size={20} />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
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
  },
  circle2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
    bottom: "-200px",
    right: "-200px",
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
  backBtn: {
    background: "none",
    border: "none",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: isMobile ? "13px" : "14px",
    marginBottom: isMobile ? "20px" : "24px",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: isMobile ? "24px" : "32px",
  },
  logoIcon: {
    width: isMobile ? "64px" : "80px",
    height: isMobile ? "64px" : "80px",
    margin: isMobile ? "0 auto 16px" : "0 auto 20px",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    borderRadius: isMobile ? "16px" : "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
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
  progressSteps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isMobile ? "24px" : "32px",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "6px" : "8px",
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: isMobile ? "36px" : "40px",
    height: isMobile ? "36px" : "40px",
    borderRadius: "50%",
    backgroundColor: "#27272A",
    color: "#71717A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: isMobile ? "14px" : "16px",
  },
  stepLabel: {
    fontSize: isMobile ? "11px" : "12px",
    color: "#71717A",
  },
  stepLine: {
    width: isMobile ? "40px" : "60px",
    height: "2px",
    backgroundColor: "#27272A",
    margin: "0 8px",
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
  successBox: {
    backgroundColor: "#064E3B",
    border: "1px solid #10B981",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  successText: {
    color: "#10B981",
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
  helperText: {
    fontSize: "12px",
    color: "#71717A",
    marginTop: "4px",
  },
  submitBtn: {
    width: "100%",
    padding: isMobile ? "12px" : "14px",
    fontSize: isMobile ? "15px" : "16px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    border: "none",
    borderRadius: isMobile ? "10px" : "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
    marginTop: "8px",
  },
  resendBtn: {
    width: "100%",
    padding: isMobile ? "10px" : "12px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "500",
    color: "#A1A1AA",
    background: "transparent",
    border: "1px solid #27272A",
    borderRadius: isMobile ? "10px" : "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
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

export default ForgotPassword;
