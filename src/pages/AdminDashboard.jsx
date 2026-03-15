import { useState, useEffect } from "react";
import {
  MdPeople,
  MdEvent,
  MdEmojiEvents,
  MdAssignment,
  MdArrowForward,
  MdCalendarToday,
  MdBarChart,
  MdTrendingUp,
  MdAccessTime,
  MdLocationOn,
  MdSearch,
  MdAdd,
  MdMoreVert,
  MdNotifications,
  MdRefresh,
  MdDownload,
  MdSchool,
  MdCheckCircle,
  MdPieChart,
} from "react-icons/md";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, getPadding, getFontSize } = useResponsive();
  const [stats, setStats] = useState({
    students: 0,
    activities: 0,
    participations: 0,
    pending: 0,
    faculty: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentParticipations, setRecentParticipations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    categoryDistribution: {},
    monthlyTrends: [],
    topStudents: [],
  });
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("This Week");

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/my-notifications");
      const notifs = res.data.notifications || [];
      setNotifications(notifs.slice(0, 5));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getDateRangeStart = (filter) => {
    const now = new Date();
    const start = new Date(now);
    if (filter === "Today") {
      start.setHours(0, 0, 0, 0);
    } else if (filter === "This Week") {
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
    } else if (filter === "This Month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (filter === "This Year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }
    return start;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, activitiesRes, participationsRes, facultyRes] = await Promise.all([
        API.get("/students"),
        API.get("/activities"),
        API.get("/participations"),
        API.get("/faculty").catch(() => ({ data: [] })),
      ]);

      const pending = participationsRes.data.filter(p => p.status === "Pending").length;
      const approved = participationsRes.data.filter(p => p.status === "Approved").length;
      const rejected = participationsRes.data.filter(p => p.status === "Rejected").length;

      setStats({
        students: studentsRes.data.length,
        activities: activitiesRes.data.length,
        participations: participationsRes.data.length,
        faculty: facultyRes.data.length,
        pending,
        approved,
        rejected,
      });

      // Calculate analytics
      const categoryDist = {};
      activitiesRes.data.forEach(a => {
        categoryDist[a.category] = (categoryDist[a.category] || 0) + 1;
      });

      // Get top students by participation count
      const studentParticipations = {};
      participationsRes.data.forEach(p => {
        if (p.student?.name) {
          studentParticipations[p.student.name] = (studentParticipations[p.student.name] || 0) + 1;
        }
      });
      const topStudents = Object.entries(studentParticipations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setAnalytics({
        categoryDistribution: categoryDist,
        topStudents,
      });

      setRecentActivities(activitiesRes.data);
      setRecentParticipations(participationsRes.data.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleActivityClick = () => {
    navigate(`/dashboard/admin/activities`);
  };

  const handleParticipationClick = () => {
    navigate(`/dashboard/admin/participations`);
  };

  // Filter activities
  const filteredActivities = recentActivities.filter(activity => {
    const matchesCategory = filterCategory === "All" || activity.category === filterCategory;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const dateStart = getDateRangeStart(timeFilter);
    const activityDate = new Date(activity.createdAt || activity.date);
    const matchesTime = activityDate >= dateStart;
    return matchesCategory && matchesSearch && matchesTime;
  });

  const categories = ["All", "Sports", "Cultural", "Technical", "Academic"];

  return (
    <div style={{...styles.container, padding: getPadding()}}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={{...styles.pageTitle, fontSize: getFontSize('28px', '24px', '22px')}}>Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back! Here's your overview</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={fetchData} title="Refresh">
            <MdRefresh size={20} />
          </button>
          <button style={styles.iconBtn} onClick={() => navigate("/dashboard/admin/reports")} title="Download Report">
            <MdDownload size={20} />
          </button>
          <div style={styles.notificationWrapper}>
            <button 
              style={styles.iconBtn} 
              onClick={() => navigate("/dashboard/admin/notifications")}
              title="Notifications"
            >
              <MdNotifications size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span style={styles.notificationBadge}>{notifications.filter(n => !n.isRead).length}</span>
              )}
            </button>
          </div>
          <select style={styles.timeFilter} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button style={styles.addBtn} onClick={() => navigate("/dashboard/admin/activities")}>
            <MdAdd size={20} />
            New Activity
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        ...styles.statsContainer,
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
      }}>
        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
            transform: hoveredStat === 'students' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/students")}
          onMouseEnter={() => setHoveredStat('students')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdPeople size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Students</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.students}</h2>
            <div style={styles.statTrend}>
              <MdTrendingUp size={16} />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #F093FB 0%, #F5576C 100%)",
            transform: hoveredStat === 'activities' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/activities")}
          onMouseEnter={() => setHoveredStat('activities')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdEvent size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Activities</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.activities}</h2>
            <div style={styles.statTrend}>
              <MdTrendingUp size={16} />
              <span>+8% from last month</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
            transform: hoveredStat === 'participations' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/participations")}
          onMouseEnter={() => setHoveredStat('participations')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdEmojiEvents size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Participations</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.participations}</h2>
            <div style={styles.statTrend}>
              <MdTrendingUp size={16} />
              <span>+23% from last month</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)",
            transform: hoveredStat === 'pending' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/participations")}
          onMouseEnter={() => setHoveredStat('pending')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdAssignment size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Pending Approvals</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.pending}</h2>
            <div style={styles.statTrend}>
              <MdAccessTime size={16} />
              <span>Requires attention</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #30CFD0 0%, #330867 100%)",
            transform: hoveredStat === 'faculty' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/faculty")}
          onMouseEnter={() => setHoveredStat('faculty')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdSchool size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Faculty</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.faculty}</h2>
            <div style={styles.statTrend}>
              <MdTrendingUp size={16} />
              <span>Active members</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",
            transform: hoveredStat === 'approved' ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => navigate("/dashboard/admin/participations")}
          onMouseEnter={() => setHoveredStat('approved')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div style={styles.statIcon}>
            <MdCheckCircle size={32} />
          </div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Approved</p>
            <h2 style={styles.statValue}>{loading ? "..." : stats.approved}</h2>
            <div style={styles.statTrend}>
              <MdTrendingUp size={16} />
              <span>Success rate: {stats.participations > 0 ? Math.round((stats.approved / stats.participations) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div style={styles.analyticsSection}>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsHeader}>
            <div>
              <h3 style={styles.analyticsTitle}>Category Distribution</h3>
              <p style={styles.analyticsSubtitle}>Activities by category</p>
            </div>
            <MdPieChart size={24} color="#667EEA" />
          </div>
          <div style={styles.categoryBars}>
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => {
              const total = Object.values(analytics.categoryDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={category} style={styles.categoryBarItem}>
                  <div style={styles.categoryBarLabel}>
                    <span style={styles.categoryBarName}>{category}</span>
                    <span style={styles.categoryBarValue}>{count}</span>
                  </div>
                  <div style={styles.categoryBarTrack}>
                    <div style={{
                      ...styles.categoryBarFill,
                      width: `${percentage}%`,
                      backgroundColor: 
                        category === "Sports" ? "#3B82F6" :
                        category === "Cultural" ? "#EC4899" :
                        category === "Technical" ? "#10B981" : "#F59E0B"
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <div style={styles.analyticsHeader}>
            <div>
              <h3 style={styles.analyticsTitle}>Top Performers</h3>
              <p style={styles.analyticsSubtitle}>Most active students</p>
            </div>
            <MdBarChart size={24} color="#10B981" />
          </div>
          <div style={styles.topStudentsList}>
            {analytics.topStudents.length === 0 ? (
              <p style={styles.emptyText}>No data available</p>
            ) : (
              analytics.topStudents.map((student, index) => (
                <div key={index} style={styles.topStudentItem}>
                  <div style={styles.topStudentRank}>#{index + 1}</div>
                  <div style={styles.topStudentInfo}>
                    <p style={styles.topStudentName}>{student.name}</p>
                    <p style={styles.topStudentCount}>{student.count} participations</p>
                  </div>
                  <div style={styles.topStudentBadge}>
                    <MdEmojiEvents size={20} color={
                      index === 0 ? "#FFD700" :
                      index === 1 ? "#C0C0C0" :
                      index === 2 ? "#CD7F32" : "#667EEA"
                    } />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        ...styles.mainContent,
        gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 360px',
      }}>
        {/* Activities Section */}
        <div style={styles.activitiesSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Activities</h2>
              <p style={styles.sectionSubtitle}>{filteredActivities.length} activities found</p>
            </div>
            <button style={styles.viewAllLink} onClick={() => navigate("/dashboard/admin/activities")}>
              View All <MdArrowForward size={16} />
            </button>
          </div>

          {/* Search and Filters */}
          <div style={styles.filtersBar}>
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
            <div style={styles.categoryTabs}>
              {categories.map((category) => (
                <button
                  key={category}
                  style={{
                    ...styles.categoryTab,
                    ...(filterCategory === category ? styles.categoryTabActive : {}),
                  }}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Activities Grid */}
          {loading ? (
            <div style={styles.loadingState}>Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <MdEvent size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No activities found</p>
            </div>
          ) : (
            <div style={styles.activitiesGrid}>
              {filteredActivities.map((activity) => (
                <div 
                  key={activity._id} 
                  style={{
                    ...styles.activityCard,
                    transform: hoveredCard === activity._id ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: hoveredCard === activity._id ? '0 12px 24px rgba(0, 0, 0, 0.5)' : '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onClick={handleActivityClick}
                  onMouseEnter={() => setHoveredCard(activity._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.activityHeader}>
                    <span style={{
                      ...styles.categoryPill,
                      backgroundColor: 
                        activity.category === "Sports" ? "#3B82F6" :
                        activity.category === "Cultural" ? "#EC4899" :
                        activity.category === "Technical" ? "#10B981" : "#F59E0B"
                    }}>
                      {activity.category}
                    </span>
                    <button style={styles.moreBtn}>
                      <MdMoreVert size={18} />
                    </button>
                  </div>
                  <h3 style={styles.activityTitle}>{activity.title}</h3>
                  <p style={styles.activityDesc}>
                    {activity.description?.substring(0, 80) || "No description available"}...
                  </p>
                  <div style={styles.activityMeta}>
                    <div style={styles.metaItem}>
                      <MdCalendarToday size={16} color="#71717A" />
                      <span>{activity.date ? new Date(activity.date).toLocaleDateString() : "TBA"}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <MdLocationOn size={16} color="#71717A" />
                      <span>{activity.venue || "TBA"}</span>
                    </div>
                  </div>
                  <div style={styles.activityFooter}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: 
                        activity.status === "Completed" ? "#064E3B" :
                        activity.status === "Ongoing" ? "#1E3A8A" :
                        activity.status === "Upcoming" ? "#451A03" : "#27272A",
                      color:
                        activity.status === "Completed" ? "#10B981" :
                        activity.status === "Ongoing" ? "#3B82F6" :
                        activity.status === "Upcoming" ? "#F59E0B" : "#A1A1AA",
                    }}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Participations */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Recent Participations</h3>
              <button style={styles.iconButton} onClick={() => navigate("/dashboard/admin/participations")}>
                <MdArrowForward size={18} />
              </button>
            </div>
            
            {loading ? (
              <div style={styles.loadingState}>Loading...</div>
            ) : recentParticipations.length === 0 ? (
              <div style={styles.emptyState}>
                <MdAssignment size={32} style={{ color: "#52525B" }} />
                <p style={styles.emptyText}>No participations</p>
              </div>
            ) : (
              <div style={styles.participationList}>
                {recentParticipations.map((p) => (
                  <div 
                    key={p._id} 
                    style={{
                      ...styles.participationItem,
                      backgroundColor: hoveredCard === `p-${p._id}` ? '#141414' : '#0A0A0A',
                    }}
                    onClick={handleParticipationClick}
                    onMouseEnter={() => setHoveredCard(`p-${p._id}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={styles.participationLeft}>
                      <div style={{
                        ...styles.statusIndicator,
                        backgroundColor: 
                          p.status === "Approved" ? "#10B981" :
                          p.status === "Rejected" ? "#EF4444" : "#F59E0B"
                      }}></div>
                      <div style={styles.participationInfo}>
                        <p style={styles.participationName}>{p.student?.name || "Unknown"}</p>
                        <p style={styles.participationActivity}>{p.activity?.title || "Unknown Activity"}</p>
                      </div>
                    </div>
                    <span style={{
                      ...styles.participationStatus,
                      color: 
                        p.status === "Approved" ? "#10B981" :
                        p.status === "Rejected" ? "#EF4444" : "#F59E0B"
                    }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => navigate("/dashboard/admin/students")}>
                <MdPeople size={20} color="#667EEA" />
                <span>Manage Students</span>
              </button>
              <button style={styles.quickActionBtn} onClick={() => navigate("/dashboard/admin/reports")}>
                <MdBarChart size={20} color="#10B981" />
                <span>View Reports</span>
              </button>
            </div>
          </div>
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
    flexWrap: "wrap",
    gap: "16px",
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
    flexWrap: "wrap",
  },
  timeFilter: {
    padding: "8px 14px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
  },
  addBtn: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
    '@media (max-width: 768px)': {
      gridTemplateColumns: "1fr",
    },
  },
  statBox: {
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid transparent",
  },
  statIcon: {
    color: "#FFFFFF",
    marginBottom: "12px",
    opacity: 1,
  },
  statContent: {},
  statLabel: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "6px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "10px",
  },
  statTrend: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "20px",
    '@media (max-width: 1024px)': {
      gridTemplateColumns: "1fr",
    },
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
    alignItems: "flex-start",
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
    color: "#A1A1AA",
  },
  viewAllLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
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
  filtersBar: {
    marginBottom: "20px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "10px",
    marginBottom: "14px",
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
  categoryTabs: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  categoryTab: {
    padding: "8px 16px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#A1A1AA",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  categoryTabActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "600",
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
    fontSize: "13px",
  },
  activitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  activityCard: {
    backgroundColor: "#1A1A1A",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  categoryPill: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  moreBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  activityTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "10px",
    lineHeight: "1.4",
  },
  activityDesc: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  activityMeta: {
    display: "flex",
    gap: "14px",
    marginBottom: "14px",
    paddingTop: "14px",
    borderTop: "1px solid #3A3A3A",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "#A1A1AA",
  },
  activityFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
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
    margin: 0,
  },
  iconButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  participationList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "500px",
    overflowY: "auto",
  },
  participationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  participationLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0,
  },
  statusIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  participationInfo: {
    flex: 1,
    minWidth: 0,
  },
  participationName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  participationActivity: {
    fontSize: "11px",
    color: "#A1A1AA",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  participationStatus: {
    fontSize: "11px",
    fontWeight: "600",
    flexShrink: 0,
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "14px",
  },
  quickActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px",
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
  iconBtn: {
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
    position: "relative",
  },
  notificationWrapper: {
    position: "relative",
  },
  notificationBadge: {
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
  analyticsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  analyticsCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  analyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  analyticsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  analyticsSubtitle: {
    fontSize: "13px",
    color: "#A1A1AA",
  },
  categoryBars: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  categoryBarItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryBarLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBarName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#E5E5E5",
  },
  categoryBarValue: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryBarTrack: {
    width: "100%",
    height: "8px",
    backgroundColor: "#1A1A1A",
    borderRadius: "4px",
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  topStudentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  topStudentItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  topStudentRank: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#667EEA",
    flexShrink: 0,
  },
  topStudentInfo: {
    flex: 1,
    minWidth: 0,
  },
  topStudentName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  topStudentCount: {
    fontSize: "12px",
    color: "#A1A1AA",
    margin: 0,
  },
  topStudentBadge: {
    flexShrink: 0,
  },
};

export default AdminDashboard;
