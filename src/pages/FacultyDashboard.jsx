import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useResponsive } from "../hooks/useResponsive";
import { 
  MdCheckCircle, 
  MdCancel, 
  MdPending,
  MdAssignment,
  MdPeople,
  MdArrowForward,
  MdNotifications,
  MdTrendingUp,
  MdEmojiEvents,
  MdFilterList,
  MdSearch,
  MdCalendarToday,
  MdBarChart,
  MdRefresh,
  MdDownload,
  MdVisibility,
} from "react-icons/md";

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isMobile, getPadding, getFontSize } = useResponsive();
  const [participations, setParticipations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [participationsRes, activitiesRes, studentsRes] = await Promise.all([
        API.get("/participations"),
        API.get("/activities"),
        API.get("/students"),
      ]);
      
      setParticipations(participationsRes.data);
      setActivities(activitiesRes.data);
      setStudents(studentsRes.data);
      
      const pending = participationsRes.data.filter(p => p.status === "Pending").length;
      const approved = participationsRes.data.filter(p => p.status === "Approved").length;
      const rejected = participationsRes.data.filter(p => p.status === "Rejected").length;
      
      setStats({
        total: participationsRes.data.length,
        pending,
        approved,
        rejected,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/participations/${id}`, { status });
      alert(`Participation ${status.toLowerCase()} successfully!`);
      fetchAllData();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Student", "Activity", "Level", "Achievement", "Status", "Date"],
      ...participations.map(p => [
        p.student?.name || "Unknown",
        p.activity?.title || "Unknown",
        p.level || "N/A",
        p.achievement || "N/A",
        p.status || "Pending",
        new Date(p.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participations.csv";
    a.click();
  };

  // Filter participations
  const filteredParticipations = participations.filter(p => {
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    const matchesSearch = 
      p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.activity?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingParticipations = participations.filter(p => p.status === "Pending");
  const recentParticipations = participations.slice(0, 8);

  // Calculate additional stats
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const todaySubmissions = participations.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.createdAt).toDateString() === today;
  }).length;

  return (
    <div style={{...styles.container, padding: getPadding()}}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={{...styles.pageTitle, fontSize: getFontSize('28px', '24px', '22px')}}>Faculty Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back, {user?.name || "Faculty"}</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchAllData}>
            <MdRefresh size={18} />
          </button>
          <button style={styles.exportBtn} onClick={handleExport}>
            <MdDownload size={18} />
            {!isMobile && "Export"}
          </button>
          <button style={styles.notificationBtn}>
            <MdNotifications size={20} />
            {stats.pending > 0 && <span style={styles.badge}>{stats.pending}</span>}
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
            <MdAssignment size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Submissions</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>{todaySubmissions} today</span>
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
              <span style={{ color: "#F59E0B" }}>Requires attention</span>
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
              <span style={{ color: "#10B981" }}>{approvalRate}% approval rate</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdCancel size={28} color="#EF4444" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Rejected</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.rejected}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Declined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Pending Approvals Section */}
        <div style={styles.approvalsSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Pending Approvals</h2>
              <p style={styles.sectionSubtitle}>{pendingParticipations.length} items require your review</p>
            </div>
            <button style={styles.viewAllBtn} onClick={() => navigate("/participations")}>
              View All <MdArrowForward size={16} />
            </button>
          </div>

          {/* Search and Filter */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <MdSearch size={20} color="#71717A" />
              <input
                type="text"
                placeholder="Search by student or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <select 
              style={styles.filterSelect} 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Approvals List */}
          {loading ? (
            <div style={styles.loadingState}>Loading participations...</div>
          ) : pendingParticipations.length === 0 ? (
            <div style={styles.emptyState}>
              <MdCheckCircle size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No pending approvals</p>
              <p style={styles.emptySubtext}>All submissions have been reviewed</p>
            </div>
          ) : (
            <div style={styles.approvalsList}>
              {pendingParticipations.slice(0, 6).map((p) => (
                <div key={p._id} style={styles.approvalCard}>
                  <div style={styles.approvalHeader}>
                    <div style={styles.approvalStudent}>
                      <div style={styles.studentAvatar}>
                        {p.student?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <h4 style={styles.studentName}>{p.student?.name || "Unknown Student"}</h4>
                        <p style={styles.studentEmail}>{p.student?.email || "No email"}</p>
                      </div>
                    </div>
                    <span style={styles.levelBadge}>{p.level}</span>
                  </div>

                  <div style={styles.approvalBody}>
                    <div style={styles.approvalInfo}>
                      <div style={styles.infoRow}>
                        <MdEmojiEvents size={16} color="#71717A" />
                        <span style={styles.infoLabel}>Activity:</span>
                        <span style={styles.infoValue}>{p.activity?.title || "Unknown"}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <MdCalendarToday size={16} color="#71717A" />
                        <span style={styles.infoLabel}>Date:</span>
                        <span style={styles.infoValue}>
                          {new Date(p.activityDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.achievementBox}>
                      <p style={styles.achievementLabel}>Achievement</p>
                      <p style={styles.achievementText}>{p.achievement || "No achievement specified"}</p>
                    </div>
                  </div>

                  <div style={styles.approvalFooter}>
                    {/* <button
                      style={styles.viewDetailsBtn}
                      onClick={() => navigate("/participations")}
                    >
                      <MdVisibility size={16} />
                      View Details
                    </button> */}
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleStatusChange(p._id, "Approved")}
                      >
                        <MdCheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleStatusChange(p._id, "Rejected")}
                      >
                        <MdCancel size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Recent Activity */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Recent Activity</h3>
            <div style={styles.activityList}>
              {recentParticipations.slice(0, 6).map((p) => (
                <div key={p._id} style={styles.activityItem}>
                  <div style={{
                    ...styles.activityIcon,
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
                  <div style={styles.activityContent}>
                    <h4 style={styles.activityTitle}>{p.student?.name || "Unknown"}</h4>
                    <p style={styles.activityMeta}>{p.activity?.title || "Unknown Activity"}</p>
                  </div>
                  <span
                    style={{
                      ...styles.statusPill,
                      backgroundColor:
                        p.status === "Approved" ? "#064E3B" :
                        p.status === "Rejected" ? "#450A0A" : "#451A03",
                      color:
                        p.status === "Approved" ? "#10B981" :
                        p.status === "Rejected" ? "#EF4444" : "#F59E0B",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Overview</h3>
            <div style={styles.overviewList}>
              <div style={styles.overviewItem}>
                <div style={styles.overviewIcon}>
                  <MdPeople size={20} color="#667EEA" />
                </div>
                <div>
                  <p style={styles.overviewLabel}>Total Students</p>
                  <p style={styles.overviewValue}>{students.length}</p>
                </div>
              </div>
              <div style={styles.overviewItem}>
                <div style={styles.overviewIcon}>
                  <MdEmojiEvents size={20} color="#F5576C" />
                </div>
                <div>
                  <p style={styles.overviewLabel}>Active Activities</p>
                  <p style={styles.overviewValue}>{activities.length}</p>
                </div>
              </div>
              <div style={styles.overviewItem}>
                <div style={styles.overviewIcon}>
                  <MdBarChart size={20} color="#10B981" />
                </div>
                <div>
                  <p style={styles.overviewLabel}>Approval Rate</p>
                  <p style={styles.overviewValue}>{approvalRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => navigate("/participations")}>
                <MdAssignment size={18} color="#667EEA" />
                <span>View All Submissions</span>
              </button>
              <button style={styles.quickActionBtn} onClick={() => navigate("/activities")}>
                <MdEmojiEvents size={18} color="#F5576C" />
                <span>Manage Activities</span>
              </button>
              <button style={styles.quickActionBtn} onClick={handleExport}>
                <MdDownload size={18} color="#10B981" />
                <span>Export Report</span>
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
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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
  approvalsSection: {
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
  approvalsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  approvalCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    padding: "16px",
    transition: "all 0.2s ease",
  },
  approvalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    paddingBottom: "14px",
    borderBottom: "1px solid #3A3A3A",
  },
  approvalStudent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  studentAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  studentName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "2px",
  },
  studentEmail: {
    fontSize: "11px",
    color: "#71717A",
    margin: 0,
  },
  levelBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#667EEA20",
    color: "#667EEA",
  },
  approvalBody: {
    marginBottom: "14px",
  },
  approvalInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
  },
  infoLabel: {
    color: "#71717A",
    fontWeight: "500",
  },
  infoValue: {
    color: "#E5E5E5",
    fontWeight: "600",
  },
  achievementBox: {
    padding: "10px",
    backgroundColor: "#0F0F0F",
    borderRadius: "6px",
    border: "1px solid #3A3A3A",
  },
  achievementLabel: {
    fontSize: "10px",
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
    fontWeight: "600",
  },
  achievementText: {
    fontSize: "12px",
    color: "#E5E5E5",
    margin: 0,
    lineHeight: "1.4",
  },
  approvalFooter: {
    display: "flex",
    gap: "8px",
    paddingTop: "14px",
    borderTop: "1px solid #3A3A3A",
  },
  viewDetailsBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#A1A1AA",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flex: 1,
  },
  approveBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    backgroundColor: "#064E3B",
    border: "1px solid #10B981",
    borderRadius: "6px",
    color: "#10B981",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  rejectBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    fontSize: "12px",
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
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  activityIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  activityMeta: {
    fontSize: "11px",
    color: "#71717A",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statusPill: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
    flexShrink: 0,
  },
  overviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  overviewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  overviewIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewLabel: {
    fontSize: "12px",
    color: "#71717A",
    marginBottom: "4px",
    fontWeight: "500",
  },
  overviewValue: {
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

export default FacultyDashboard;
