import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { 
  MdNotifications, 
  MdSecurity, 
  MdLock,
  MdSave,
  MdVpnKey,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      emailAlerts: false,
      activityUpdates: true,
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    // Save to localStorage immediately
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleSave = () => {
    // Save all settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      alert("Please fill in all password fields!");
      return;
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords don't match!");
      return;
    }
    
    if (passwordForm.new.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    
    try {
      setPasswordLoading(true);
      const response = await API.post('/user/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      
      if (response.data.success) {
        alert("Password changed successfully! Please use your new password for future logins.");
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert("Error changing password: " + (error.response?.data?.message || error.message));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.pageSubtitle}>Manage your account preferences and security</p>
        </div>
        <button style={styles.saveBtn} onClick={handleSave}>
          <MdSave size={18} />
          Save All Changes
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Settings Sections */}
        <div style={styles.settingsSection}>
          {/* Notifications */}
          <div style={styles.settingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <div style={styles.cardIcon}>
                  <MdNotifications size={24} color="#667EEA" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Notifications</h2>
                  <p style={styles.cardSubtitle}>Manage how you receive notifications</p>
                </div>
              </div>
            </div>
            <div style={styles.cardBody}>
              <SettingToggle
                label="Push Notifications"
                description="Receive push notifications about activities and updates"
                checked={settings.notifications}
                onChange={() => handleToggle("notifications")}
              />
              <SettingToggle
                label="Email Alerts"
                description="Get email notifications for important events"
                checked={settings.emailAlerts}
                onChange={() => handleToggle("emailAlerts")}
              />
              <SettingToggle
                label="Activity Updates"
                description="Notifications when new activities are posted"
                checked={settings.activityUpdates}
                onChange={() => handleToggle("activityUpdates")}
              />
            </div>
          </div>

          {/* Security */}
          <div style={styles.settingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <div style={styles.cardIcon}>
                  <MdSecurity size={24} color="#10B981" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Security</h2>
                  <p style={styles.cardSubtitle}>Manage your account security settings</p>
                </div>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.passwordSection}>
                <h3 style={styles.passwordTitle}>Change Password</h3>
                <div style={styles.passwordForm}>
                  <div style={styles.passwordField}>
                    <label style={styles.passwordLabel}>Current Password</label>
                    <div style={styles.passwordInputWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Enter current password"
                        style={styles.passwordInput}
                        disabled={passwordLoading}
                      />
                      <button 
                        style={styles.visibilityBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={passwordLoading}
                      >
                        {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                      </button>
                    </div>
                  </div>
                  <div style={styles.passwordField}>
                    <label style={styles.passwordLabel}>New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                      style={styles.passwordInput}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div style={styles.passwordField}>
                    <label style={styles.passwordLabel}>Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      style={styles.passwordInput}
                      disabled={passwordLoading}
                    />
                  </div>
                  <button 
                    style={{
                      ...styles.changePasswordBtn,
                      opacity: passwordLoading ? 0.6 : 1,
                      cursor: passwordLoading ? 'not-allowed' : 'pointer'
                    }} 
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                  >
                    <MdVpnKey size={18} />
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Account Info</h3>
            <div style={styles.statusList}>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Name</span>
                <span style={styles.statusValue}>{user?.name || 'Not Set'}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Email</span>
                <span style={styles.statusValue}>{user?.email || 'Not Set'}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Role</span>
                <span style={styles.statusValue}>{user?.role || 'Not Set'}</span>
              </div>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Security Tips</h3>
            <div style={styles.tipsList}>
              <div style={styles.tipItem}>
                <MdLock size={18} color="#10B981" />
                <p style={styles.tipText}>Use a strong password with at least 8 characters</p>
              </div>
              <div style={styles.tipItem}>
                <MdSecurity size={18} color="#667EEA" />
                <p style={styles.tipText}>Change your password regularly for better security</p>
              </div>
              <div style={styles.tipItem}>
                <MdNotifications size={18} color="#F5576C" />
                <p style={styles.tipText}>Enable notifications to stay updated on activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, description, checked, onChange }) => (
  <div style={styles.settingRow}>
    <div>
      <p style={styles.settingLabel}>{label}</p>
      <p style={styles.settingDesc}>{description}</p>
    </div>
    <label style={styles.switch}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{
        ...styles.slider,
        backgroundColor: checked ? "#667EEA" : "#3A3A3A",
      }}>
        <span style={{
          ...styles.sliderCircle,
          transform: checked ? "translateX(24px)" : "translateX(0)",
        }}></span>
      </span>
    </label>
  </div>
);

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#000000",
    minHeight: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "20px",
    borderBottom: "2px solid #1A1A1A",
  },
  headerLeft: {},
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#A1A1AA",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
  },
  settingsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  settingCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    overflow: "hidden",
  },
  dangerCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #450A0A",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px",
    borderBottom: "1px solid #2A2A2A",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#450A0A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  dangerTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: "4px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#71717A",
  },
  cardBody: {
    padding: "20px",
  },
  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    marginBottom: "12px",
    border: "1px solid #3A3A3A",
  },
  settingLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  settingDesc: {
    fontSize: "13px",
    color: "#A1A1AA",
    margin: 0,
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "52px",
    height: "28px",
    cursor: "pointer",
  },
  slider: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "28px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    padding: "2px",
  },
  sliderCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  select: {
    padding: "8px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
    minWidth: "150px",
  },
  passwordSection: {
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  passwordTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  passwordForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  passwordField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  passwordLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
    fontWeight: "600",
  },
  passwordInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "10px 40px 10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  visibilityBtn: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    color: "#71717A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  changePasswordBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#667EEA",
    border: "none",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.2s ease",
  },
  dangerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #450A0A",
  },
  dangerLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: "4px",
  },
  dangerDesc: {
    fontSize: "13px",
    color: "#A1A1AA",
    margin: 0,
    maxWidth: "400px",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sidebarCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
  },
  sidebarTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  tipsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  tipItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  tipText: {
    fontSize: "13px",
    color: "#A1A1AA",
    margin: 0,
    lineHeight: "1.5",
  },
  statusList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  statusLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  statusValue: {
    fontSize: "13px",
    color: "#FFFFFF",
    fontWeight: "600",
  },
};

export default Settings;
