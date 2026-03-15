import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import API from "../api/axios";
import {
  MdDashboard,
  MdEvent,
  MdEmojiEvents,
  MdLogout,
  MdSettings,
  MdPerson,
  MdAssignment,
  MdMenu,
  MdAnalytics,
  MdSchool,
  MdClose,
  MdLeaderboard,
  MdCampaign,
  MdNotifications,
  MdSend,
} from "react-icons/md";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { collapsed, toggleSidebar, mobileOpen, isMobile, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread count for all roles
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get('/notifications/my-notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavClick = (path) => {
    navigate(path);
    closeMobileSidebar();
  };

  /* ================= ROLE BASED MENUS ================= */

  const adminMenu = [
    { name: "Dashboard", path: "/dashboard/admin", icon: <MdDashboard />, color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, transparent 100%)" },
    { name: "Send Notification", path: "/dashboard/admin/send-notification", icon: <MdSend />, color: "#3B82F6", gradient: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, transparent 100%)" },
    { name: "User Management", path: "/dashboard/admin/user-management", icon: <MdPerson />, color: "#EC4899", gradient: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, transparent 100%)" },
    { name: "Students", path: "/dashboard/admin/students", icon: <MdSchool />, color: "#F5576C", gradient: "linear-gradient(135deg, rgba(245,87,108,0.2) 0%, transparent 100%)" },
    { name: "Faculty", path: "/dashboard/admin/faculty", icon: <MdPerson />, color: "#FEE140", gradient: "linear-gradient(135deg, rgba(254,225,64,0.2) 0%, transparent 100%)" },
    { name: "Departments", path: "/dashboard/admin/departments", icon: <MdSchool />, color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, transparent 100%)" },
    { name: "Activities", path: "/dashboard/admin/activities", icon: <MdEvent />, color: "#4FACFE", gradient: "linear-gradient(135deg, rgba(79,172,254,0.2) 0%, transparent 100%)" },
    { name: "Participations", path: "/dashboard/admin/participations", icon: <MdAssignment />, color: "#FA709A", gradient: "linear-gradient(135deg, rgba(250,112,154,0.2) 0%, transparent 100%)" },
    { name: "Leaderboard", path: "/dashboard/admin/leaderboard", icon: <MdLeaderboard />, color: "#FFD700", gradient: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, transparent 100%)" },
    { name: "Announcements", path: "/dashboard/admin/announcements", icon: <MdCampaign />, color: "#EC4899", gradient: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, transparent 100%)" },
    { name: "Points Config", path: "/dashboard/admin/points-config", icon: <MdEmojiEvents />, color: "#10B981", gradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)" },
    { name: "Reports", path: "/dashboard/admin/reports", icon: <MdAnalytics />, color: "#10B981", gradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)" },
  ];

  const facultyMenu = [
    { name: "Dashboard", path: "/dashboard/faculty", icon: <MdDashboard />, color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, transparent 100%)" },
    { name: "Activities", path: "/dashboard/faculty/activities", icon: <MdEvent />, color: "#4FACFE", gradient: "linear-gradient(135deg, rgba(79,172,254,0.2) 0%, transparent 100%)" },
    { name: "Participations", path: "/dashboard/faculty/participations", icon: <MdAssignment />, color: "#FA709A", gradient: "linear-gradient(135deg, rgba(250,112,154,0.2) 0%, transparent 100%)" },
    { name: "Attendance", path: "/dashboard/faculty/attendance", icon: <MdAssignment />, color: "#10B981", gradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)" },
    { name: "Results", path: "/dashboard/faculty/results", icon: <MdEmojiEvents />, color: "#FFD700", gradient: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, transparent 100%)" },
    { name: "Performance", path: "/dashboard/faculty/performance", icon: <MdAnalytics />, color: "#EC4899", gradient: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, transparent 100%)" },
    { name: "Communication", path: "/dashboard/faculty/communication", icon: <MdNotifications />, color: "#4FACFE", gradient: "linear-gradient(135deg, rgba(79,172,254,0.2) 0%, transparent 100%)" },
    { name: "Announcements", path: "/dashboard/faculty/announcements", icon: <MdCampaign />, color: "#EC4899", gradient: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, transparent 100%)" },
    { name: "Reports", path: "/dashboard/faculty/reports", icon: <MdAnalytics />, color: "#10B981", gradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)" },
  ];

  const studentMenu = [
    { name: "Dashboard", path: "/dashboard/student", icon: <MdDashboard />, color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, transparent 100%)" },
    { name: "Apply Activities", path: "/dashboard/student/apply", icon: <MdEvent />, color: "#4FACFE", gradient: "linear-gradient(135deg, rgba(79,172,254,0.2) 0%, transparent 100%)" },
    { name: "My Participations", path: "/dashboard/student/participations", icon: <MdAssignment />, color: "#FA709A", gradient: "linear-gradient(135deg, rgba(250,112,154,0.2) 0%, transparent 100%)" },
    { name: "Certificates", path: "/dashboard/student/certificates", icon: <MdEmojiEvents />, color: "#10B981", gradient: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, transparent 100%)" },
    { name: "Skill Badges", path: "/dashboard/student/badges", icon: <MdEmojiEvents />, color: "#FFD700", gradient: "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, transparent 100%)" },
    { name: "Leaderboard", path: "/dashboard/student/leaderboard", icon: <MdLeaderboard />, color: "#EC4899", gradient: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, transparent 100%)" },
    { name: "Feedback", path: "/dashboard/student/feedback", icon: <MdCampaign />, color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, transparent 100%)" },
  ];

  let menu = [];
  if (user?.role === "admin") menu = adminMenu;
  else if (user?.role === "faculty") menu = facultyMenu;
  else if (user?.role === "student") menu = studentMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div 
          style={styles.mobileOverlay}
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: isMobile ? "280px" : (collapsed ? "88px" : "280px"),
        height: isMobile ? "100vh" : "calc(100vh - 40px)",
        left: isMobile ? 0 : "20px",
        top: isMobile ? 0 : "20px",
        borderRadius: isMobile ? 0 : "24px",
        transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
      }}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        {!collapsed && !isMobile && (
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <MdSchool size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={styles.brandName}>Activity Portal</div>
              <div style={styles.roleTag}>
                <span style={styles.roleDot}></span>
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        )}
        {(collapsed || isMobile) && (
          <div style={styles.collapsedHeader}>
            <div style={styles.logoIconCollapsed}>
              <MdSchool size={22} color="#FFFFFF" />
            </div>
          </div>
        )}
        {!collapsed && (
          <button 
            style={styles.toggleBtn}
            onClick={toggleSidebar}
          >
            <MdClose size={18} />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed - separate position */}
      {collapsed && (
        <div style={styles.collapsedToggleContainer}>
          <button 
            style={styles.toggleBtnCollapsed}
            onClick={toggleSidebar}
          >
            <MdMenu size={20} />
          </button>
        </div>
      )}

      {/* ================= USER INFO ================= */}
      {!collapsed && (
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name || "User"}</p>
            <p style={styles.userRole}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Role"}</p>
          </div>
        </div>
      )}

      {/* ================= MENU ================= */}
      <nav style={styles.nav}>
        {!collapsed && <div style={styles.menuLabel}>MENU</div>}
        {menu.map((item) => {
          const active = location.pathname === item.path;
          const isHovered = hoveredItem === item.name;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => handleNavClick(item.path)}
              style={{
                ...styles.navItem,
                ...(active ? styles.activeItem : {}),
                ...(isHovered && !active ? styles.hoveredItem : {}),
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "14px" : "12px 16px",
                background: active 
                  ? item.gradient 
                  : isHovered 
                  ? "rgba(255, 255, 255, 0.03)" 
                  : "transparent",
                borderLeft: active ? `3px solid ${item.color}` : "3px solid transparent",
              }}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{
                ...styles.icon,
                color: active ? item.color : isHovered ? item.color : "var(--text-secondary)",
                filter: active ? `drop-shadow(0 0 8px ${item.color}50)` : "none"
              }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span style={{
                  color: active ? "#FFFFFF" : isHovered ? "#FFFFFF" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 500,
                  letterSpacing: "0.5px"
                }}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ================= BOTTOM SECTION ================= */}
      <div style={styles.bottom}>
        {!collapsed && <div style={styles.menuLabel}>ACCOUNT</div>}

        {/* Notification Bell - all roles */}
        <button
            onClick={() => handleNavClick(`/dashboard/${user?.role}/notifications`)}
            style={{
              ...styles.notifBtn,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "14px" : "12px 16px",
              background: location.pathname.includes('/notifications') 
                ? "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, transparent 100%)" 
                : hoveredItem === "notifications" 
                ? "rgba(255, 255, 255, 0.03)" 
                : "transparent",
              borderLeft: location.pathname.includes('/notifications') ? '3px solid #3B82F6' : '3px solid transparent',
            }}
            onMouseEnter={() => setHoveredItem("notifications")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{
                ...styles.icon,
                color: location.pathname.includes('/notifications') ? '#3B82F6' : hoveredItem === "notifications" ? "#3B82F6" : "var(--text-secondary)",
                filter: location.pathname.includes('/notifications') ? "drop-shadow(0 0 8px rgba(59,130,246,0.5))" : "none"
              }}>
                <MdNotifications size={20} />
              </span>
              {unreadCount > 0 && (
                <span style={styles.bellBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </span>
            {!collapsed && (
              <span style={{ 
                color: location.pathname.includes('/notifications') ? '#FFFFFF' : hoveredItem === "notifications" ? "#FFFFFF" : "var(--text-secondary)", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontWeight: location.pathname.includes('/notifications') ? 600 : 500,
              }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={styles.inlineBadge}>{unreadCount}</span>
                )}
              </span>
            )}
          </button>

        <Link
          to={`/dashboard/${user?.role}/profile`}
          onClick={() => handleNavClick(`/dashboard/${user?.role}/profile`)}
          style={{
            ...styles.navItem,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "14px" : "12px 16px",
            backgroundColor: hoveredItem === "profile" ? "rgba(255, 255, 255, 0.03)" : "transparent",
          }}
          onMouseEnter={() => setHoveredItem("profile")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <span style={{
            ...styles.icon,
            color: hoveredItem === "profile" ? "var(--accent-primary)" : "var(--text-secondary)"
          }}>
            <MdPerson />
          </span>
          {!collapsed && (
            <span style={{
              color: hoveredItem === "profile" ? "#FFFFFF" : "var(--text-secondary)",
              fontWeight: 500
            }}>
              Profile
            </span>
          )}
        </Link>

        <Link
          to={`/dashboard/${user?.role}/settings`}
          onClick={() => handleNavClick(`/dashboard/${user?.role}/settings`)}
          style={{
            ...styles.navItem,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "14px" : "12px 16px",
            backgroundColor: hoveredItem === "settings" ? "rgba(255, 255, 255, 0.03)" : "transparent",
          }}
          onMouseEnter={() => setHoveredItem("settings")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <span style={{
            ...styles.icon,
            color: hoveredItem === "settings" ? "var(--accent-primary)" : "var(--text-secondary)"
          }}>
            <MdSettings />
          </span>
          {!collapsed && (
            <span style={{
              color: hoveredItem === "settings" ? "#FFFFFF" : "var(--text-secondary)",
              fontWeight: 500
            }}>
              Settings
            </span>
          )}
        </Link>

        <button 
          onClick={handleLogout} 
          style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "14px" : "12px 16px",
            backgroundColor: hoveredItem === "logout" ? "rgba(239, 68, 68, 0.1)" : "transparent",
            color: hoveredItem === "logout" ? "#EF4444" : "var(--text-secondary)",
          }}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <MdLogout size={20} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

/* ================= STYLES ================= */

const styles = {
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
  },
  sidebar: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    color: "var(--text-secondary)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    transition: "width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
    overflow: "hidden",
    zIndex: 1000,
  },
  header: {
    padding: "24px 20px 16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "85px",
  },
  collapsedHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingTop: "12px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px var(--accent-glow)",
  },
  logoIconCollapsed: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px var(--accent-glow)",
  },
  brandName: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: "2px",
    letterSpacing: "0.5px",
  },
  roleTag: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  roleDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-primary)",
    boxShadow: "0 0 10px var(--accent-glow)",
  },
  toggleBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  collapsedToggleContainer: {
    padding: "0 16px 16px 16px",
    display: "flex",
    justifyContent: "center",
  },
  toggleBtnCollapsed: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  userCard: {
    margin: "0 20px 16px 20px",
    padding: "14px",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#FFFFFF",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: 0,
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  nav: {
    flex: 1,
    padding: "10px 16px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    overflowY: "auto",
  },
  menuLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "1.5px",
    marginBottom: "6px",
    marginTop: "12px",
    paddingLeft: "12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
    position: "relative",
  },
  hoveredItem: {
    transform: "translateX(4px)",
  },
  icon: {
    fontSize: "20px",
    transition: "all 0.3s ease",
    display: "flex",
  },
  bottom: {
    padding: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    background: "rgba(0,0,0,0.1)",
  },
  logoutBtn: {
    border: "none",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    borderLeft: "3px solid transparent",
  },
  notifBtn: {
    border: "none",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    width: "100%",
    textAlign: "left",
  },
  bellBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    color: "#FFFFFF",
    fontSize: "9px",
    fontWeight: "800",
    padding: "2px 5px",
    borderRadius: "8px",
    minWidth: "16px",
    textAlign: "center",
    lineHeight: "12px",
    boxShadow: "0 2px 8px rgba(255, 65, 108, 0.4)",
  },
  inlineBadge: {
    background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "800",
    padding: "2px 8px",
    borderRadius: "10px",
    minWidth: "18px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(255, 65, 108, 0.4)",
  },
};
