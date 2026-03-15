import { useState, useEffect } from "react";
import API from "../api/axios";
import { 
  MdDownload, 
  MdPictureAsPdf, 
  MdTableChart,
  MdBarChart,
  MdPieChart,
  MdTrendingUp,
  MdPeople,
  MdEvent,
  MdEmojiEvents,
  MdCheckCircle,
  MdPending,
  MdCalendarToday,
  MdFilterList,
  MdRefresh,
} from "react-icons/md";

const Reports = () => {
  const [stats, setStats] = useState({
    students: 0,
    activities: 0,
    participations: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, activitiesRes, participationsRes] = await Promise.all([
        API.get("/students"),
        API.get("/activities"),
        API.get("/participations"),
      ]);

      const approved = participationsRes.data.filter(p => p.status === "Approved").length;
      const pending = participationsRes.data.filter(p => p.status === "Pending").length;
      const rejected = participationsRes.data.filter(p => p.status === "Rejected").length;

      setStats({
        students: studentsRes.data.length,
        activities: activitiesRes.data.length,
        participations: participationsRes.data.length,
        approved,
        pending,
        rejected,
      });
      setStudents(studentsRes.data);
      setActivities(activitiesRes.data);
      setParticipations(participationsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleDownload = (type, format) => {
    if (format === "CSV") {
      downloadCSV(type);
    } else if (format === "PDF") {
      downloadPDF(type);
    }
  };

  const downloadCSV = (type) => {
    let csvContent = "";
    let filename = "";

    if (type === "Student") {
      csvContent = [
        ["Student ID", "Name", "Department", "Year", "Email", "Phone", "Roll Number"],
        ...students.map(s => [
          s.studentId || "N/A",
          s.name || "N/A",
          s.department || "N/A",
          s.year || "N/A",
          s.email || "N/A",
          s.phone || "N/A",
          s.rollNumber || "N/A"
        ])
      ].map(row => row.join(",")).join("\n");
      filename = "students_report.csv";
    } else if (type === "Activity") {
      csvContent = [
        ["Title", "Category", "Conducted By", "Date", "Venue", "Status", "Max Participants"],
        ...activities.map(a => [
          a.title,
          a.category,
          a.conductedBy,
          a.date ? new Date(a.date).toLocaleDateString() : "N/A",
          a.venue || "N/A",
          a.status,
          a.maxParticipants || "Unlimited"
        ])
      ].map(row => row.join(",")).join("\n");
      filename = "activities_report.csv";
    } else if (type === "Participation") {
      csvContent = [
        ["Student", "Activity", "Level", "Achievement", "Date", "Status"],
        ...participations.map(p => [
          p.student?.name || "N/A",
          p.activity?.title || "N/A",
          p.level,
          p.achievement || "N/A",
          p.date ? new Date(p.date).toLocaleDateString() : "N/A",
          p.status
        ])
      ].map(row => row.join(",")).join("\n");
      filename = "participations_report.csv";
    } else if (type === "Analytics") {
      csvContent = [
        ["Metric", "Value"],
        ["Total Students", stats.students],
        ["Total Activities", stats.activities],
        ["Total Participations", stats.participations],
        ["Approved", stats.approved],
        ["Pending", stats.pending],
        ["Rejected", stats.rejected],
        [""],
        ["Category Distribution"],
        ...Object.entries(categoryStats).map(([cat, count]) => [cat, count]),
        [""],
        ["Level Distribution"],
        ...Object.entries(levelStats).map(([level, count]) => [level, count])
      ].map(row => row.join(",")).join("\n");
      filename = "analytics_report.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (type) => {
    // Create a simple HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${type} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; border-bottom: 2px solid #667EEA; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #667EEA; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667EEA; }
          .stat-label { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>${type} Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    `;

    if (type === "Student") {
      htmlContent += `
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Students</div>
            <div class="stat-value">${stats.students}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Roll Number</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td>${s.studentId || "N/A"}</td>
                <td>${s.name || "N/A"}</td>
                <td>${s.department || "N/A"}</td>
                <td>${s.year || "N/A"}</td>
                <td>${s.email || "N/A"}</td>
                <td>${s.phone || "N/A"}</td>
                <td>${s.rollNumber || "N/A"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "Activity") {
      htmlContent += `
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Activities</div>
            <div class="stat-value">${stats.activities}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Conducted By</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map(a => `
              <tr>
                <td>${a.title}</td>
                <td>${a.category}</td>
                <td>${a.conductedBy}</td>
                <td>${a.date ? new Date(a.date).toLocaleDateString() : "N/A"}</td>
                <td>${a.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "Participation") {
      htmlContent += `
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Participations</div>
            <div class="stat-value">${stats.participations}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Approved</div>
            <div class="stat-value">${stats.approved}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Pending</div>
            <div class="stat-value">${stats.pending}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Activity</th>
              <th>Level</th>
              <th>Achievement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${participations.map(p => `
              <tr>
                <td>${p.student?.name || "N/A"}</td>
                <td>${p.activity?.title || "N/A"}</td>
                <td>${p.level}</td>
                <td>${p.achievement || "N/A"}</td>
                <td>${p.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "Analytics") {
      htmlContent += `
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Students</div>
            <div class="stat-value">${stats.students}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Activities</div>
            <div class="stat-value">${stats.activities}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Participations</div>
            <div class="stat-value">${stats.participations}</div>
          </div>
        </div>
        <h2>Category Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(categoryStats).map(([cat, count]) => `
              <tr>
                <td>${cat}</td>
                <td>${count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <h2>Level Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(levelStats).map(([level, count]) => `
              <tr>
                <td>${level}</td>
                <td>${count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${type.toLowerCase()}_report.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Open in new window for printing to PDF
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  // Calculate category distribution
  const categoryStats = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate level distribution
  const levelStats = participations.reduce((acc, p) => {
    acc[p.level] = (acc[p.level] || 0) + 1;
    return acc;
  }, {});

  // Calculate monthly trend (last 6 months)
  const monthlyTrend = [
    { month: "Jan", count: 12 },
    { month: "Feb", count: 19 },
    { month: "Mar", count: 15 },
    { month: "Apr", count: 22 },
    { month: "May", count: 28 },
    { month: "Jun", count: 25 },
  ];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Reports & Analytics</h1>
          <p style={styles.pageSubtitle}>Comprehensive system insights and data exports</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchStats}>
            <MdRefresh size={18} />
            Refresh
          </button>
          <select style={styles.dateRangeSelect} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdPeople size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Students</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.students}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>+12%</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEvent size={28} color="#F5576C" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Activities</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.activities}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>+8%</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEmojiEvents size={28} color="#4FACFE" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Participations</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.participations}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>+23%</span>
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
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Reports Section */}
        <div style={styles.reportsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Export Reports</h2>
            <div style={styles.reportTypeToggle}>
              <button 
                style={{
                  ...styles.reportTypeBtn,
                  ...(reportType === "overview" ? styles.reportTypeBtnActive : {})
                }}
                onClick={() => setReportType("overview")}
              >
                Overview
              </button>
              <button 
                style={{
                  ...styles.reportTypeBtn,
                  ...(reportType === "detailed" ? styles.reportTypeBtnActive : {})
                }}
                onClick={() => setReportType("detailed")}
              >
                Detailed
              </button>
            </div>
          </div>

          <div style={styles.reportGrid}>
            <div style={styles.reportCard}>
              <div style={styles.reportCardHeader}>
                <div style={styles.reportIconBox}>
                  <MdPeople size={24} color="#667EEA" />
                </div>
                <h3 style={styles.reportCardTitle}>Student Report</h3>
              </div>
              <p style={styles.reportCardDesc}>
                Complete list of all students with department, year, and contact details
              </p>
              <div style={styles.reportCardFooter}>
                <span style={styles.reportCount}>{stats.students} records</span>
                <div style={styles.exportBtns}>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Student", "CSV")}>
                    <MdTableChart size={16} />
                    CSV
                  </button>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Student", "PDF")}>
                    <MdPictureAsPdf size={16} />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportCardHeader}>
                <div style={styles.reportIconBox}>
                  <MdEvent size={24} color="#F5576C" />
                </div>
                <h3 style={styles.reportCardTitle}>Activity Report</h3>
              </div>
              <p style={styles.reportCardDesc}>
                All activities with category, date, venue, and participation statistics
              </p>
              <div style={styles.reportCardFooter}>
                <span style={styles.reportCount}>{stats.activities} records</span>
                <div style={styles.exportBtns}>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Activity", "CSV")}>
                    <MdTableChart size={16} />
                    CSV
                  </button>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Activity", "PDF")}>
                    <MdPictureAsPdf size={16} />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportCardHeader}>
                <div style={styles.reportIconBox}>
                  <MdEmojiEvents size={24} color="#4FACFE" />
                </div>
                <h3 style={styles.reportCardTitle}>Participation Report</h3>
              </div>
              <p style={styles.reportCardDesc}>
                Student participation records with achievements, levels, and approval status
              </p>
              <div style={styles.reportCardFooter}>
                <span style={styles.reportCount}>{stats.participations} records</span>
                <div style={styles.exportBtns}>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Participation", "CSV")}>
                    <MdTableChart size={16} />
                    CSV
                  </button>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Participation", "PDF")}>
                    <MdPictureAsPdf size={16} />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportCardHeader}>
                <div style={styles.reportIconBox}>
                  <MdBarChart size={24} color="#FA709A" />
                </div>
                <h3 style={styles.reportCardTitle}>Analytics Report</h3>
              </div>
              <p style={styles.reportCardDesc}>
                Comprehensive analytics with charts, trends, and statistical insights
              </p>
              <div style={styles.reportCardFooter}>
                <span style={styles.reportCount}>Full analysis</span>
                <div style={styles.exportBtns}>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Analytics", "CSV")}>
                    <MdTableChart size={16} />
                    CSV
                  </button>
                  <button style={styles.exportBtn} onClick={() => handleDownload("Analytics", "PDF")}>
                    <MdPictureAsPdf size={16} />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={styles.quickStatsSection}>
            <h3 style={styles.quickStatsTitle}>Quick Statistics</h3>
            <div style={styles.quickStatsGrid}>
              <div style={styles.quickStatItem}>
                <MdCheckCircle size={20} color="#10B981" />
                <div>
                  <p style={styles.quickStatLabel}>Approved</p>
                  <p style={styles.quickStatValue}>{stats.approved}</p>
                </div>
              </div>
              <div style={styles.quickStatItem}>
                <MdPending size={20} color="#F59E0B" />
                <div>
                  <p style={styles.quickStatLabel}>Pending</p>
                  <p style={styles.quickStatValue}>{stats.pending}</p>
                </div>
              </div>
              <div style={styles.quickStatItem}>
                <MdCalendarToday size={20} color="#3B82F6" />
                <div>
                  <p style={styles.quickStatLabel}>This Month</p>
                  <p style={styles.quickStatValue}>{monthlyTrend[monthlyTrend.length - 1].count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Category Distribution</h3>
            <div style={styles.chartPlaceholder}>
              <MdPieChart size={48} color="#3A3A3A" />
              <p style={styles.chartText}>Chart View</p>
            </div>
            <div style={styles.statsList}>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} style={styles.statsItem}>
                  <div style={styles.statsItemLeft}>
                    <span style={{
                      ...styles.categoryIndicator,
                      backgroundColor: 
                        category === "Sports" ? "#3B82F6" :
                        category === "Cultural" ? "#EC4899" :
                        category === "Technical" ? "#10B981" : "#F59E0B"
                    }}></span>
                    <span style={styles.statsLabel}>{category}</span>
                  </div>
                  <span style={styles.statsValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Level Distribution</h3>
            <div style={styles.statsList}>
              {Object.entries(levelStats).map(([level, count]) => (
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
            <h3 style={styles.sidebarTitle}>Monthly Trend</h3>
            <div style={styles.trendChart}>
              {monthlyTrend.map((item, index) => (
                <div key={item.month} style={styles.trendBar}>
                  <div 
                    style={{
                      ...styles.trendBarFill,
                      height: `${(item.count / 30) * 100}%`
                    }}
                  ></div>
                  <span style={styles.trendLabel}>{item.month}</span>
                </div>
              ))}
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
  refreshBtn: {
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
  dateRangeSelect: {
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
  reportsSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reportTypeToggle: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#1A1A1A",
    padding: "4px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  reportTypeBtn: {
    padding: "6px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#A1A1AA",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  reportTypeBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  reportCard: {
    backgroundColor: "#1A1A1A",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  reportCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  reportIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  reportCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  reportCardDesc: {
    fontSize: "13px",
    color: "#A1A1AA",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  reportCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #3A3A3A",
  },
  reportCount: {
    fontSize: "12px",
    color: "#71717A",
    fontWeight: "600",
  },
  exportBtns: {
    display: "flex",
    gap: "6px",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#E5E5E5",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  quickStatsSection: {
    paddingTop: "24px",
    borderTop: "1px solid #3A3A3A",
  },
  quickStatsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  quickStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },
  quickStatItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  quickStatLabel: {
    fontSize: "12px",
    color: "#A1A1AA",
    margin: 0,
    marginBottom: "4px",
  },
  quickStatValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
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
  chartPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  chartText: {
    fontSize: "12px",
    color: "#71717A",
    marginTop: "8px",
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
  categoryIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
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
  trendChart: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "8px",
    height: "120px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  trendBar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    height: "100%",
  },
  trendBarFill: {
    width: "100%",
    backgroundColor: "#667EEA",
    borderRadius: "4px 4px 0 0",
    transition: "all 0.3s ease",
  },
  trendLabel: {
    fontSize: "10px",
    color: "#71717A",
    fontWeight: "600",
  },
};

export default Reports;
