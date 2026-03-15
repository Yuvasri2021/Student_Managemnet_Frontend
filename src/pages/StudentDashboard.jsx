import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useResponsive } from "../hooks/useResponsive";
import { 
  MdEmojiEvents, 
  MdCheckCircle, 
  MdPending, 
  MdCancel,
  MdEvent,
  MdLocationOn,
  MdCalendarToday,
  MdArrowForward,
  MdAdd,
  MdTrendingUp,
  MdRefresh,
  MdNotifications,
  MdSearch,
  MdFilterList,
  MdBarChart,
  MdSchool,
  MdStar,
  MdTimer,
} from "react-icons/md";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isMobile, getPadding, getFontSize } = useResponsive();
  const [participations, setParticipations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [participationsRes, activitiesRes] = await Promise.all([
        API.get("/participations"),
        API.get("/activities"),
      ]);

      // Filter participations for current student
      const myParticipations = participationsRes.data.filter(p => 
        p.student?._id === user?._id || 
        p.student?.email === user?.email
      );

      setParticipations(myParticipations);
      setActivities(activitiesRes.data);

      const approved = myParticipations.filter(p => p.status === "Approved").length;
      const pending = myParticipations.filter(p => p.status === "Pending").length;
      const rejected = myParticipations.filter(p => p.status === "Rejected").length;

      setStats({
        total: myParticipations.length,
        approved,
        pending,
        rejected,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ["All", ...new Set(activities.map(a => a.category))];

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || activity.category === filterCategory;
    const isUpcoming = activity.status === "Upcoming" || activity.status === "Ongoing";
    return matchesSearch && matchesCategory && isUpcoming;
  });

  // Calculate achievement rate
  const achievementRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div style={{...styles.container, padding: getPadding()}}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={{...styles.pageTitle, fontSize: getFontSize('28px', '24px', '22px')}}>Welcome back, {user?.name || "Student"}!</h1>
          <p style={styles.pageSubtitle}>Track your activities and achievements</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchData}>
            <MdRefresh size={18} />
          </button>
          <button style={styles.notificationBtn} onClick={() => navigate("/dashboard/student/notifications")}>
            <MdNotifications size={20} />
            {stats.pending > 0 && <span style={styles.badge}>{stats.pending}</span>}
          </button>
          <button style={styles.primaryBtn} onClick={() => navigate("/dashboard/student/activities")}>
            <MdAdd size={18} />
            {!isMobile && "Browse Activities"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        ...styles.statsContainer,
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      }}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEmojiEvents size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Participations</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>All Time</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdCheckCircle size={28} color="#10B981" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Approved</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.approved}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#10B981" }}>{achievementRate}% success rate</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdPending size={28} color="#F59E0B" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Pending Review</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.pending}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#F59E0B" }}>Under review</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdStar size={28} color="#FEE140" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Achievement Score</p>
            <h2 style={styles.statNumber}>{loading ? "..." : achievementRate}%</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Available Activities Section */}
        <div style={styles.activitiesSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Available Activities</h2>
              <p style={styles.sectionSubtitle}>{filteredActivities.length} activities available</p>
            </div>
            <button style={styles.viewAllBtn} onClick={() => navigate("/dashboard/student/activities")}>
              View All <MdArrowForward size={16} />
            </button>
          </div>

          {/* Search and Filter */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <MdSearch size={20} color="#71717A" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <select 
              style={styles.filterSelect} 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Activities Grid */}
          {loading ? (
            <div style={styles.loadingState}>Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <MdEvent size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No activities available</p>
              <p style={styles.emptySubtext}>Check back later for new opportunities</p>
            </div>
          ) : (
            <div style={styles.activitiesGrid}>
              {filteredActivities.slice(0, 6).map((activity) => (
                <ActivityCard key={activity._id} activity={activity} navigate={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* My Participations */}
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>My Participations</h3>
              <button style={styles.linkBtn} onClick={() => navigate("/dashboard/student/participations")}>
                View All <MdArrowForward size={14} />
              </button>
            </div>

            {loading ? (
              <div style={styles.loadingState}>Loading...</div>
            ) : participations.length === 0 ? (
              <div style={styles.emptyState}>
                <MdEmojiEvents size={32} style={{ color: "#52525B" }} />
                <p style={styles.emptyText}>No participations yet</p>
              </div>
            ) : (
              <div style={styles.participationList}>
                {participations.slice(0, 5).map((p) => (
                  <div key={p._id} style={styles.participationItem}>
                    <div style={{
                      ...styles.participationIcon,
                      backgroundColor: 
                        p.status === "Approved" ? "#064E3B" :
                        p.status === "Rejected" ? "#450A0A" : "#451A03"
                    }}>
                      {p.status === "Approved" ? 
                        <MdCheckCircle size={16} color="#10B981" /> :
                        p.status === "Rejected" ?
                        <MdCancel size={16} color="#EF4444" /> :
                        <MdPending size={16} color="#F59E0B" />
                      }
                    </div>
                    <div style={styles.participationContent}>
                      <h4 style={styles.participationTitle}>{p.activity?.title || "N/A"}</h4>
                      <p style={styles.participationMeta}>{p.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Overview */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Performance Overview</h3>
            <div style={styles.performanceList}>
              <div style={styles.performanceItem}>
                <div style={styles.performanceIcon}>
                  <MdBarChart size={20} color="#667EEA" />
                </div>
                <div>
                  <p style={styles.performanceLabel}>Success Rate</p>
                  <p style={styles.performanceValue}>{achievementRate}%</p>
                </div>
              </div>
              <div style={styles.performanceItem}>
                <div style={styles.performanceIcon}>
                  <MdCheckCircle size={20} color="#10B981" />
                </div>
                <div>
                  <p style={styles.performanceLabel}>Approved</p>
                  <p style={styles.performanceValue}>{stats.approved}</p>
                </div>
              </div>
              <div style={styles.performanceItem}>
                <div style={styles.performanceIcon}>
                  <MdTimer size={20} color="#F59E0B" />
                </div>
                <div>
                  <p style={styles.performanceLabel}>Pending</p>
                  <p style={styles.performanceValue}>{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => navigate("/dashboard/student/activities")}>
                <MdEvent size={18} color="#667EEA" />
                <span>Browse Activities</span>
              </button>
              <button style={styles.quickActionBtn} onClick={() => navigate("/dashboard/student/participations")}>
                <MdEmojiEvents size={18} color="#10B981" />
                <span>My Submissions</span>
              </button>
              <button style={styles.quickActionBtn} onClick={() => navigate("/dashboard/student/profile")}>
                <MdSchool size={18} color="#F5576C" />
                <span>View Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Card Component
const ActivityCard = ({ activity, navigate }) => {
  const [hovered, setHovered] = useState(false);
  
  const getCategoryColor = (category) => {
    const colors = {
      "Sports": "#667EEA",
      "Cultural": "#F5576C",
      "Technical": "#4FACFE",
      "Academic": "#10B981",
    };
    return colors[category] || "#A1A1AA";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Upcoming": "#4FACFE",
      "Ongoing": "#10B981",
      "Completed": "#71717A",
    };
    return colors[status] || "#A1A1AA";
  };

  return (
    <div 
      style={{
        ...styles.activityCard,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate("/dashboard/student/activities")}
    >
      <div style={styles.cardHeader}>
        <span style={{
          ...styles.categoryBadge,
          backgroundColor: `${getCategoryColor(activity.category)}20`,
          color: getCategoryColor(activity.category),
        }}>
          {activity.category}
        </span>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: `${getStatusColor(activity.status)}20`,
          color: getStatusColor(activity.status),
        }}>
          {activity.status}
        </span>
      </div>

      <h3 style={styles.cardTitle}>{activity.title}</h3>
      <p style={styles.cardDescription}>
        {activity.description?.substring(0, 80) || "No description"}...
      </p>

      <div style={styles.cardInfo}>
        <div style={styles.infoRow}>
          <MdCalendarToday size={14} color="#71717A" />
          <span>{activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}</span>
        </div>
        <div style={styles.infoRow}>
          <MdLocationOn size={14} color="#71717A" />
          <span>{activity.venue || 'TBA'}</span>
        </div>
      </div>
    </div>
  );
};

/* Styles */
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
  headerRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  refreshBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    color: "#E5E5E5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  notificationBtn: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    color: "#E5E5E5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "10px",
    minWidth: "18px",
    textAlign: "center",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "#0F0F0F",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    backgroundColor: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#A1A1AA",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "6px",
  },
  statChange: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
  },
  activitiesSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "#71717A",
  },
  viewAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    flex: 1,
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
  },
  loadingState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px 20px",
    fontSize: "13px",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyText: {
    color: "#71717A",
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#52525B",
    margin: 0,
    fontSize: "12px",
  },
  activitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  activityCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    padding: "16px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  categoryBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  cardDescription: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#A1A1AA",
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
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sidebarTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  linkBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    color: "#667EEA",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },
  participationList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  participationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  participationIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  participationContent: {
    flex: 1,
    minWidth: 0,
  },
  participationTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  participationMeta: {
    fontSize: "11px",
    color: "#71717A",
    margin: 0,
  },
  performanceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  performanceItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  performanceIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  performanceLabel: {
    fontSize: "12px",
    color: "#71717A",
    marginBottom: "4px",
    fontWeight: "500",
  },
  performanceValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  quickActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
};

export default StudentDashboard;
