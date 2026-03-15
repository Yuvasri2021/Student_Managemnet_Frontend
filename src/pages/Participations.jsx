import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { 
  MdCheckCircle, 
  MdPending, 
  MdCancel,
  MdSearch,
  MdFilterList,
  MdDownload,
  MdPerson,
  MdEvent,
  MdEmojiEvents,
  MdTrendingUp,
  MdMoreVert,
  MdCheck,
  MdClose,
  MdViewModule,
  MdViewList,
} from 'react-icons/md';

const Participations = () => {
  const { user } = useContext(AuthContext);
  const { isMobile, getPadding, getFontSize } = useResponsive();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (user) {
      fetchParticipations();
    }
  }, [user]);

  const fetchParticipations = async () => {
    try {
      const res = await API.get('/participations');
      
      console.log('=== PARTICIPATION DEBUG ===');
      console.log('Fetched participations:', res.data);
      console.log('Current user:', user);
      console.log('User email:', user?.email);
      
      // Filter participations based on user role
      let filteredData = res.data;
      if (user?.role === "student") {
        // Show only the student's own participations by matching email
        filteredData = res.data.filter(p => {
          const studentEmail = p.student?.email;
          const userEmail = user?.email;
          console.log('Participation:', p._id);
          console.log('  Student:', p.student);
          console.log('  Student email:', studentEmail);
          console.log('  User email:', userEmail);
          console.log('  Match:', studentEmail === userEmail);
          return studentEmail === userEmail;
        });
        console.log('Filtered participations for student:', filteredData);
        console.log('Total filtered:', filteredData.length);
      }
      
      setRecords(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participations:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/participations/${id}`, { status: 'Approved' });
      alert('Participation approved!');
      fetchParticipations();
    } catch (error) {
      alert('Error approving participation');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this participation?')) {
      try {
        await API.put(`/participations/${id}`, { status: 'Rejected' });
        alert('Participation rejected!');
        fetchParticipations();
      } catch (error) {
        alert('Error rejecting participation');
      }
    }
  };

  // Filter participations
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.activity?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || record.status === filterStatus;
    const matchesLevel = filterLevel === "All" || record.level === filterLevel;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Calculate stats
  const stats = {
    total: records.length,
    approved: records.filter(r => r.status === "Approved").length,
    pending: records.filter(r => r.status === "Pending").length,
    rejected: records.filter(r => r.status === "Rejected").length,
    byLevel: {
      College: records.filter(r => r.level === "College").length,
      University: records.filter(r => r.level === "University").length,
      State: records.filter(r => r.level === "State").length,
      National: records.filter(r => r.level === "National").length,
      International: records.filter(r => r.level === "International").length,
    },
  };

  const statuses = ["All", "Pending", "Approved", "Rejected"];
  const levels = ["All", "College", "University", "State", "National", "International"];

  return (
    <div style={{...styles.container, padding: getPadding()}}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={{...styles.pageTitle, fontSize: getFontSize('28px', '24px', '22px')}}>
            {user?.role === "student" ? "My Participations" : "Participation Records"}
          </h1>
          <p style={styles.pageSubtitle}>{filteredRecords.length} records found</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.exportBtn}>
            <MdDownload size={18} />
            {!isMobile && "Export"}
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
            <p style={styles.statLabel}>Total Records</p>
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
              <span style={{ color: "#A1A1AA" }}>Verified</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdPending size={28} color="#F59E0B" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Pending</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.pending}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Awaiting Review</span>
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
        {/* Participations Section */}
        <div style={styles.participationsSection}>
          {/* Toolbar */}
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
            
            <div style={styles.toolbarRight}>
              <select 
                style={styles.filterSelect} 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select 
                style={styles.filterSelect} 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <div style={styles.viewToggle}>
                <button 
                  style={{
                    ...styles.viewBtn,
                    ...(viewMode === "grid" ? styles.viewBtnActive : {})
                  }}
                  onClick={() => setViewMode("grid")}
                >
                  <MdViewModule size={18} />
                </button>
                <button 
                  style={{
                    ...styles.viewBtn,
                    ...(viewMode === "table" ? styles.viewBtnActive : {})
                  }}
                  onClick={() => setViewMode("table")}
                >
                  <MdViewList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Participations Display */}
          {loading ? (
            <div style={styles.loadingState}>Loading participations...</div>
          ) : filteredRecords.length === 0 ? (
            <div style={styles.emptyState}>
              <MdEmojiEvents size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No participation records found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{
              ...styles.participationsGrid,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            }}>
              {filteredRecords.map((record) => (
                <div 
                  key={record._id} 
                  style={{
                    ...styles.participationCard,
                    transform: hoveredCard === record._id ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredCard === record._id ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={() => setHoveredCard(record._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.levelBadge,
                      backgroundColor: 
                        record.level === "International" ? "#EC4899" :
                        record.level === "National" ? "#3B82F6" :
                        record.level === "State" ? "#10B981" :
                        record.level === "University" ? "#F59E0B" : "#667EEA"
                    }}>
                      {record.level}
                    </span>
                    <button style={styles.moreBtn}>
                      <MdMoreVert size={18} />
                    </button>
                  </div>

                  <div style={styles.studentInfo}>
                    <div style={styles.studentAvatar}>
                      {(record.student?.name || record.student?.email)?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 style={styles.studentName}>{record.student?.name || record.student?.email || "Unknown"}</h3>
                      <p style={styles.activityName}>{record.activity?.title || "Unknown Activity"}</p>
                      {record.student?.email && (
                        <p style={styles.studentEmail}>{record.student.email}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.recordInfo}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Achievement:</span>
                      <span style={styles.infoValue}>{record.achievement || "N/A"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Date:</span>
                      <span style={styles.infoValue}>
                        {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: 
                        record.status === "Approved" ? "#064E3B" :
                        record.status === "Rejected" ? "#450A0A" : "#451A03",
                      color:
                        record.status === "Approved" ? "#10B981" :
                        record.status === "Rejected" ? "#EF4444" : "#F59E0B",
                    }}>
                      {record.status === "Approved" && <MdCheckCircle size={14} />}
                      {record.status === "Pending" && <MdPending size={14} />}
                      {record.status === "Rejected" && <MdCancel size={14} />}
                      {record.status}
                    </span>
                    {(user?.role === "admin" || user?.role === "faculty") && record.status === "Pending" && (
                      <div style={styles.cardActions}>
                        <button style={styles.approveBtn} onClick={() => handleApprove(record._id)}>
                          <MdCheck size={16} />
                        </button>
                        <button style={styles.rejectBtn} onClick={() => handleReject(record._id)}>
                          <MdClose size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              ...styles.tableContainer,
              overflowX: isMobile ? 'auto' : 'visible',
            }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Activity</th>
                    <th style={styles.th}>Level</th>
                    <th style={styles.th}>Achievement</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    {user?.role === "admin" && <th style={styles.th}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div>
                          <div>{record.student?.name || record.student?.email || 'N/A'}</div>
                          {record.student?.email && record.student?.name && (
                            <div style={{ fontSize: '11px', color: '#71717A' }}>{record.student.email}</div>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>{record.activity?.title || 'N/A'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.levelBadge,
                          backgroundColor: 
                            record.level === "International" ? "#EC4899" :
                            record.level === "National" ? "#3B82F6" :
                            record.level === "State" ? "#10B981" :
                            record.level === "University" ? "#F59E0B" : "#667EEA"
                        }}>
                          {record.level}
                        </span>
                      </td>
                      <td style={styles.td}>{record.achievement || 'N/A'}</td>
                      <td style={styles.td}>
                        {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: 
                            record.status === "Approved" ? "#064E3B" :
                            record.status === "Rejected" ? "#450A0A" : "#451A03",
                          color:
                            record.status === "Approved" ? "#10B981" :
                            record.status === "Rejected" ? "#EF4444" : "#F59E0B",
                        }}>
                          {record.status === "Approved" && <MdCheckCircle size={14} />}
                          {record.status === "Pending" && <MdPending size={14} />}
                          {record.status === "Rejected" && <MdCancel size={14} />}
                          {record.status}
                        </span>
                      </td>
                      {user?.role === "admin" && (
                        <td style={styles.td}>
                          {(user?.role === "admin" || user?.role === "faculty") && record.status === "Pending" && (
                            <div style={styles.actionBtns}>
                              <button style={styles.approveTableBtn} onClick={() => handleApprove(record._id)}>
                                <MdCheck size={16} />
                              </button>
                              <button style={styles.rejectTableBtn} onClick={() => handleReject(record._id)}>
                                <MdClose size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Level Distribution</h3>
            <div style={styles.statsList}>
              {Object.entries(stats.byLevel).map(([level, count]) => (
                <div key={level} style={styles.statsItem}>
                  <div style={styles.statsItemLeft}>
                    <span style={{
                      ...styles.levelIndicator,
                      backgroundColor: 
                        level === "International" ? "#EC4899" :
                        level === "National" ? "#3B82F6" :
                        level === "State" ? "#10B981" :
                        level === "University" ? "#F59E0B" : "#667EEA"
                    }}></span>
                    <span style={styles.statsLabel}>{level}</span>
                  </div>
                  <span style={styles.statsValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Status Overview</h3>
            <div style={styles.statsList}>
              <div style={styles.statsItem}>
                <div style={styles.statsItemLeft}>
                  <MdCheckCircle size={16} color="#10B981" />
                  <span style={styles.statsLabel}>Approved</span>
                </div>
                <span style={styles.statsValue}>{stats.approved}</span>
              </div>
              <div style={styles.statsItem}>
                <div style={styles.statsItemLeft}>
                  <MdPending size={16} color="#F59E0B" />
                  <span style={styles.statsLabel}>Pending</span>
                </div>
                <span style={styles.statsValue}>{stats.pending}</span>
              </div>
              <div style={styles.statsItem}>
                <div style={styles.statsItemLeft}>
                  <MdCancel size={16} color="#EF4444" />
                  <span style={styles.statsLabel}>Rejected</span>
                </div>
                <span style={styles.statsValue}>{stats.rejected}</span>
              </div>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn}>
                <MdDownload size={18} color="#10B981" />
                <span>Export Report</span>
              </button>
              <button style={styles.quickActionBtn}>
                <MdFilterList size={18} color="#667EEA" />
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  participationsSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
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
    minWidth: "250px",
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
  toolbarRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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
  viewToggle: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#1A1A1A",
    padding: "4px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  viewBtn: {
    padding: "6px 10px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  viewBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
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
  participationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  participationCard: {
    backgroundColor: "#1A1A1A",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  levelBadge: {
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
  },
  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #3A3A3A",
  },
  studentAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 0,
  },
  studentName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  activityName: {
    fontSize: "13px",
    color: "#A1A1AA",
    margin: 0,
  },
  studentEmail: {
    fontSize: "11px",
    color: "#71717A",
    margin: 0,
    marginTop: "2px",
  },
  recordInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  infoLabel: {
    color: "#A1A1AA",
    fontWeight: "500",
  },
  infoValue: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #3A3A3A",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  cardActions: {
    display: "flex",
    gap: "6px",
  },
  approveBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#064E3B",
    border: "1px solid #10B981",
    color: "#10B981",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  rejectBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    borderBottom: "2px solid #3A3A3A",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    color: "#A1A1AA",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  td: {
    padding: "14px 12px",
    fontSize: "13px",
    color: "#E5E5E5",
  },
  actionBtns: {
    display: "flex",
    gap: "6px",
  },
  approveTableBtn: {
    padding: "6px 10px",
    backgroundColor: "#064E3B",
    border: "1px solid #10B981",
    borderRadius: "6px",
    color: "#10B981",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  rejectTableBtn: {
    padding: "6px 10px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
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
  statsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statsItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  statsItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  levelIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  statsLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
    fontWeight: "500",
  },
  statsValue: {
    fontSize: "14px",
    color: "#FFFFFF",
    fontWeight: "700",
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

export default Participations;
