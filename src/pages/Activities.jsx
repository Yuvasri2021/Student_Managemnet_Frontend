import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MdEvent, 
  MdLocationOn, 
  MdPeople,
  MdSearch,
  MdFilterList,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdCalendarToday,
  MdEmojiEvents,
  MdTrendingUp,
  MdViewModule,
  MdViewList,
  MdRefresh,
  MdDownload,
  MdVisibility,
} from 'react-icons/md';

const Activities = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    venue: "",
    conductedBy: "",
    maxParticipants: "",
    status: "Upcoming",
  });
  const [participationForm, setParticipationForm] = useState({
    level: "",
    achievement: "",
    activityDate: "",
    certificate: null,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await API.get('/activities');
      setActivities(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/activities/${currentActivity}`, form);
        alert("Activity updated successfully!");
      } else {
        await API.post("/activities", form);
        alert("Activity created successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving activity");
    }
  };

  const handleEdit = (activity) => {
    setEditMode(true);
    setCurrentActivity(activity._id);
    setForm({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : "",
      venue: activity.venue || "",
      conductedBy: activity.conductedBy || "",
      maxParticipants: activity.maxParticipants || "",
      status: activity.status || "Upcoming",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await API.delete(`/activities/${id}`);
        alert("Activity deleted successfully!");
        fetchActivities();
      } catch (error) {
        alert("Error deleting activity");
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      date: "",
      venue: "",
      conductedBy: "",
      maxParticipants: "",
      status: "Upcoming",
    });
    setEditMode(false);
    setCurrentActivity(null);
  };

  const handleExport = () => {
    const csvContent = [
      ["Title", "Category", "Date", "Venue", "Conducted By", "Max Participants", "Status"],
      ...filteredActivities.map(a => [
        a.title,
        a.category,
        a.date ? new Date(a.date).toLocaleDateString() : "TBA",
        a.venue || "TBA",
        a.conductedBy || "N/A",
        a.maxParticipants || "Unlimited",
        a.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.csv";
    a.click();
  };

  const handleJoinActivity = (activity) => {
    setSelectedActivity(activity);
    setParticipationForm({
      level: "",
      achievement: "",
      activityDate: activity.date ? new Date(activity.date).toISOString().split('T')[0] : "",
      certificate: null,
    });
    setShowParticipationModal(true);
  };

  const handleParticipationSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, get or create the student record for the current user
      const studentsRes = await API.get("/students");
      let studentRecord = studentsRes.data.find(s => s.email === user?.email);
      
      // If no student record exists, create one
      if (!studentRecord) {
        console.log("No student record found, creating one...");
        try {
          const newStudentData = {
            studentId: `STU${Date.now().toString().slice(-6)}`,
            name: user?.name || "Student",
            email: user?.email,
            department: "Not Set",
            year: 1,
            phone: "",
            rollNumber: ""
          };
          const createRes = await API.post("/students", newStudentData);
          studentRecord = createRes.data;
          console.log("Created student record:", studentRecord);
        } catch (createError) {
          console.error("Error creating student record:", createError);
          alert("Error creating student profile. Please contact admin.");
          return;
        }
      }

      const participationData = {
        student: studentRecord._id,
        activity: selectedActivity._id,
        level: participationForm.level,
        achievement: participationForm.achievement,
        date: participationForm.activityDate,
        status: 'Pending',
      };

      console.log("Submitting participation:", participationData);
      const response = await API.post("/participations", participationData);
      console.log("Participation created:", response.data);
      
      alert("Participation submitted successfully! Waiting for approval.");
      setShowParticipationModal(false);
      setSelectedActivity(null);
      setParticipationForm({
        level: "",
        achievement: "",
        activityDate: "",
        certificate: null,
      });
      
      // Refresh activities to update the UI
      fetchActivities();
    } catch (error) {
      console.error("Error submitting participation:", error);
      console.error("Error details:", error.response?.data);
      alert(error.response?.data?.message || "Error submitting participation. Please try again.");
    }
  };

  // Get unique categories
  const categories = ["All", ...new Set(activities.map(a => a.category))];
  const statuses = ["All", "Upcoming", "Ongoing", "Completed"];

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || activity.category === filterCategory;
    const matchesStatus = filterStatus === "All" || activity.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: activities.length,
    upcoming: activities.filter(a => a.status === "Upcoming").length,
    ongoing: activities.filter(a => a.status === "Ongoing").length,
    completed: activities.filter(a => a.status === "Completed").length,
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Activities</h1>
          <p style={styles.pageSubtitle}>{filteredActivities.length} activities available</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchActivities}>
            <MdRefresh size={18} />
          </button>
          <button style={styles.exportBtn} onClick={handleExport}>
            <MdDownload size={18} />
            Export
          </button>
          {(user?.role === "admin" || user?.role === "faculty") && (
            <button
              style={styles.addBtn}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <MdAdd size={18} />
              Add Activity
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEmojiEvents size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Activities</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdCalendarToday size={28} color="#4FACFE" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Upcoming</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.upcoming}</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdTrendingUp size={28} color="#10B981" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Ongoing</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.ongoing}</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEvent size={28} color="#F5576C" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Completed</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.completed}</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Activities Section */}
        <div style={styles.activitiesSection}>
          {/* Toolbar */}
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
            
            <div style={styles.toolbarRight}>
              <select 
                style={styles.filterSelect} 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select 
                style={styles.filterSelect} 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
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
                    ...(viewMode === "list" ? styles.viewBtnActive : {})
                  }}
                  onClick={() => setViewMode("list")}
                >
                  <MdViewList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Activities Display */}
          {loading ? (
            <div style={styles.loadingState}>Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div style={styles.emptyState}>
              <MdEmojiEvents size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No activities found</p>
              <p style={styles.emptySubtext}>Try adjusting your filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={styles.activitiesGrid}>
              {filteredActivities.map((activity) => (
                <ActivityCard 
                  key={activity._id} 
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onJoin={handleJoinActivity}
                  userRole={user?.role}
                />
              ))}
            </div>
          ) : (
            <div style={styles.activitiesList}>
              {filteredActivities.map((activity) => (
                <ActivityListItem 
                  key={activity._id} 
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  userRole={user?.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Category Distribution</h3>
            <div style={styles.categoryList}>
              {categories.filter(c => c !== "All").map(category => {
                const count = activities.filter(a => a.category === category).length;
                return (
                  <div key={category} style={styles.categoryItem}>
                    <span style={styles.categoryName}>{category}</span>
                    <span style={styles.categoryCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Status Overview</h3>
            <div style={styles.statusList}>
              <div style={styles.statusItem}>
                <div style={styles.statusDot} style={{ backgroundColor: "#4FACFE" }}></div>
                <span style={styles.statusLabel}>Upcoming</span>
                <span style={styles.statusValue}>{stats.upcoming}</span>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusDot} style={{ backgroundColor: "#10B981" }}></div>
                <span style={styles.statusLabel}>Ongoing</span>
                <span style={styles.statusValue}>{stats.ongoing}</span>
              </div>
              <div style={styles.statusItem}>
                <div style={styles.statusDot} style={{ backgroundColor: "#71717A" }}></div>
                <span style={styles.statusLabel}>Completed</span>
                <span style={styles.statusValue}>{stats.completed}</span>
              </div>
            </div>
          </div>

          {(user?.role === "admin" || user?.role === "faculty") && (
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Quick Actions</h3>
              <div style={styles.quickActions}>
                <button style={styles.quickActionBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                  <MdAdd size={18} color="#667EEA" />
                  <span>Create Activity</span>
                </button>
                <button style={styles.quickActionBtn} onClick={handleExport}>
                  <MdDownload size={18} color="#10B981" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      {showModal && (
        <ActivityModal
          form={form}
          setForm={setForm}
          editMode={editMode}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        />
      )}

      {/* Participation Modal */}
      {showParticipationModal && (
        <ParticipationModal
          activity={selectedActivity}
          form={participationForm}
          setForm={setParticipationForm}
          onSubmit={handleParticipationSubmit}
          onClose={() => {
            setShowParticipationModal(false);
            setSelectedActivity(null);
          }}
        />
      )}
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
    margin: 0,
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  activityCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    padding: "16px",
    transition: "all 0.2s ease",
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
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
    paddingBottom: "14px",
    borderBottom: "1px solid #3A3A3A",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#A1A1AA",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conductedBy: {
    fontSize: "12px",
    color: "#71717A",
    fontWeight: "500",
  },
  cardActions: {
    display: "flex",
    gap: "6px",
  },
  editIconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#4FACFE",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
  },
  listItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
  },
  listItemIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  listItemDescription: {
    fontSize: "12px",
    color: "#A1A1AA",
    marginBottom: "8px",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  listItemMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "11px",
    color: "#71717A",
  },
  listItemRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  listItemCategory: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#667EEA20",
    color: "#667EEA",
  },
  listItemStatus: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  listItemActions: {
    display: "flex",
    gap: "6px",
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
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  categoryName: {
    fontSize: "13px",
    color: "#E5E5E5",
    fontWeight: "500",
  },
  categoryCount: {
    fontSize: "14px",
    color: "#FFFFFF",
    fontWeight: "700",
  },
  statusList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  statusItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  statusLabel: {
    flex: 1,
    fontSize: "13px",
    color: "#E5E5E5",
    fontWeight: "500",
  },
  statusValue: {
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#0F0F0F",
    padding: "28px",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    border: "1px solid #2A2A2A",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    fontSize: "24px",
    padding: "4px",
  },
  modalTitle: {
    color: "#FFFFFF",
    marginBottom: "24px",
    fontWeight: "600",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  joinBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#10B981",
    border: "none",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activityPreview: {
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #3A3A3A",
  },
  previewTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "6px",
  },
  previewCategory: {
    fontSize: "13px",
    color: "#667EEA",
    margin: 0,
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "8px",
    fontWeight: "600",
  },
  fileInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  fileHint: {
    fontSize: "11px",
    color: "#71717A",
    marginTop: "6px",
    margin: 0,
  },
};

// Activity Card Component
const ActivityCard = ({ activity, onEdit, onDelete, onJoin, userRole }) => {
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
      <p style={styles.cardDescription}>{activity.description}</p>

      <div style={styles.cardInfo}>
        <div style={styles.infoRow}>
          <MdCalendarToday size={16} color="#71717A" />
          <span>{activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}</span>
        </div>
        <div style={styles.infoRow}>
          <MdLocationOn size={16} color="#71717A" />
          <span>{activity.venue || 'TBA'}</span>
        </div>
        <div style={styles.infoRow}>
          <MdPeople size={16} color="#71717A" />
          <span>{activity.maxParticipants || 'Unlimited'} participants</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.conductedBy}>By: {activity.conductedBy || "N/A"}</span>
        <div style={styles.cardActions}>
          {userRole === "student" && (activity.status === "Upcoming" || activity.status === "Ongoing") && (
            <button style={styles.joinBtn} onClick={() => onJoin(activity)}>
              <MdAdd size={16} />
              Join
            </button>
          )}
          {(userRole === "admin" || userRole === "faculty") && (
            <>
              <button style={styles.editIconBtn} onClick={() => onEdit(activity)}>
                <MdEdit size={16} />
              </button>
              <button style={styles.deleteIconBtn} onClick={() => onDelete(activity._id)}>
                <MdDelete size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Activity List Item Component
const ActivityListItem = ({ activity, onEdit, onDelete, userRole }) => {
  const getStatusColor = (status) => {
    const colors = {
      "Upcoming": "#4FACFE",
      "Ongoing": "#10B981",
      "Completed": "#71717A",
    };
    return colors[status] || "#A1A1AA";
  };

  return (
    <div style={styles.listItem}>
      <div style={styles.listItemLeft}>
        <div style={styles.listItemIcon}>
          <MdEmojiEvents size={24} color="#667EEA" />
        </div>
        <div style={styles.listItemContent}>
          <h4 style={styles.listItemTitle}>{activity.title}</h4>
          <p style={styles.listItemDescription}>{activity.description}</p>
          <div style={styles.listItemMeta}>
            <span><MdCalendarToday size={14} /> {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}</span>
            <span><MdLocationOn size={14} /> {activity.venue || 'TBA'}</span>
            <span><MdPeople size={14} /> {activity.maxParticipants || 'Unlimited'}</span>
          </div>
        </div>
      </div>
      <div style={styles.listItemRight}>
        <span style={styles.listItemCategory}>{activity.category}</span>
        <span style={{
          ...styles.listItemStatus,
          backgroundColor: `${getStatusColor(activity.status)}20`,
          color: getStatusColor(activity.status),
        }}>
          {activity.status}
        </span>
        {(userRole === "admin" || userRole === "faculty") && (
          <div style={styles.listItemActions}>
            <button style={styles.editIconBtn} onClick={() => onEdit(activity)}>
              <MdEdit size={16} />
            </button>
            <button style={styles.deleteIconBtn} onClick={() => onDelete(activity._id)}>
              <MdDelete size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ form, setForm, editMode, onSubmit, onClose }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <MdClose size={24} />
        </button>
        <h2 style={styles.modalTitle}>
          {editMode ? "Edit Activity" : "Create New Activity"}
        </h2>
        <form onSubmit={onSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Activity Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={styles.input}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Category</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Technical">Technical</option>
            <option value="Academic">Academic</option>
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Conducted By"
            value={form.conductedBy}
            onChange={(e) => setForm({ ...form, conductedBy: e.target.value })}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Max Participants"
            value={form.maxParticipants}
            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
            style={styles.input}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
            style={styles.input}
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="submit" style={styles.submitBtn}>
            {editMode ? "Update Activity" : "Create Activity"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Participation Modal Component
const ParticipationModal = ({ activity, form, setForm, onSubmit, onClose }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <MdClose size={24} />
        </button>
        <h2 style={styles.modalTitle}>Join Activity</h2>
        <div style={styles.activityPreview}>
          <h3 style={styles.previewTitle}>{activity?.title}</h3>
          <p style={styles.previewCategory}>{activity?.category}</p>
        </div>
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Level *</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
              style={styles.input}
            >
              <option value="">Select Level</option>
              <option value="College">College Level</option>
              <option value="Inter-College">Inter-College Level</option>
              <option value="State">State Level</option>
              <option value="National">National Level</option>
              <option value="International">International Level</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Achievement/Position *</label>
            <textarea
              placeholder="Describe your achievement (e.g., Won 1st Prize, Participated, etc.)"
              value={form.achievement}
              onChange={(e) => setForm({ ...form, achievement: e.target.value })}
              required
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Activity Date *</label>
            <input
              type="date"
              value={form.activityDate}
              onChange={(e) => setForm({ ...form, activityDate: e.target.value })}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Certificate (Optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setForm({ ...form, certificate: e.target.files[0] })}
              style={styles.fileInput}
            />
            <p style={styles.fileHint}>Upload certificate or proof (Image or PDF, max 5MB)</p>
          </div>
          <button type="submit" style={styles.submitBtn}>
            Submit Participation
          </button>
        </form>
      </div>
    </div>
  );
};

export default Activities;
