import { useState, useEffect } from "react";
import API from "../api/axios";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClose, 
  MdSearch,
  MdEvent,
  MdEmojiEvents,
  MdPeople,
  MdCalendarToday,
  MdLocationOn,
  MdMoreVert,
  MdTrendingUp,
  MdViewModule,
  MdViewList,
  MdFilterList,
  MdDownload,
} from "react-icons/md";

const ActivitiesManagement = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "Sports",
    level: "College",
    description: "",
    conductedBy: "",
    date: "",
    venue: "",
    maxParticipants: "",
    status: "Upcoming",
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await API.get("/activities");
      
      // Update activities with automatic status based on date
      const updatedActivities = res.data.map(activity => ({
        ...activity,
        status: activity.status === "Cancelled" ? "Cancelled" : getActivityStatus(activity.date)
      }));
      
      setActivities(updatedActivities);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Automatically set status based on date (unless manually set to "Cancelled")
      const activityData = {
        ...form,
        status: form.status === "Cancelled" ? "Cancelled" : getActivityStatus(form.date)
      };

      if (editMode) {
        await API.put(`/activities/${currentActivity}`, activityData);
        alert("Activity updated successfully!");
      } else {
        await API.post("/activities", activityData);
        alert("Activity added successfully!");
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
      category: activity.category,
      level: activity.level || "College",
      description: activity.description,
      conductedBy: activity.conductedBy,
      date: activity.date ? activity.date.split("T")[0] : "",
      venue: activity.venue || "",
      maxParticipants: activity.maxParticipants || "",
      status: activity.status,
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
      category: "Sports",
      level: "College",
      description: "",
      conductedBy: "",
      date: "",
      venue: "",
      maxParticipants: "",
      status: "Upcoming",
    });
    setEditMode(false);
    setCurrentActivity(null);
  };

  // Function to automatically determine status based on date
  const getActivityStatus = (activityDate) => {
    if (!activityDate) return "Upcoming";
    
    const today = new Date();
    const actDate = new Date(activityDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    actDate.setHours(0, 0, 0, 0);
    
    if (actDate > today) {
      return "Upcoming";
    } else if (actDate.getTime() === today.getTime()) {
      return "Ongoing";
    } else {
      return "Completed";
    }
  };

  // Export function
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = filteredActivities.map(activity => ({
        Title: activity.title,
        Description: activity.description,
        Category: activity.category,
        Level: activity.level || 'College',
        Date: activity.date ? new Date(activity.date).toLocaleDateString() : 'Not Set',
        Venue: activity.venue || 'Not Set',
        'Max Participants': activity.maxParticipants || 'Not Set',
        Status: activity.status,
        'Created Date': activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Not Set'
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            `"${(row[header] || '').toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activities_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Activities report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    byCategory: {
      Sports: activities.filter(a => a.category === "Sports").length,
      Cultural: activities.filter(a => a.category === "Cultural").length,
      Technical: activities.filter(a => a.category === "Technical").length,
      "Social Service": activities.filter(a => a.category === "Social Service").length,
    },
  };

  const categories = ["All", "Sports", "Cultural", "Technical", "Social Service"];
  const statuses = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Activities Management</h1>
          <p style={styles.pageSubtitle}>{filteredActivities.length} activities found</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.exportBtn} onClick={handleExport}>
            <MdDownload size={18} />
            Export
          </button>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEvent size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Activities</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>All Time</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdCalendarToday size={28} color="#F5576C" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Upcoming</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.upcoming}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Scheduled</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEmojiEvents size={28} color="#4FACFE" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Ongoing</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.ongoing}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Active</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdPeople size={28} color="#FA709A" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Completed</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.completed}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Finished</span>
            </div>
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
              <MdEvent size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No activities found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={styles.activitiesGrid}>
              {filteredActivities.map((activity) => (
                <div 
                  key={activity._id} 
                  style={{
                    ...styles.activityCard,
                    transform: hoveredCard === activity._id ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredCard === activity._id ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={() => setHoveredCard(activity._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.cardHeader}>
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
                    {activity.description?.substring(0, 100) || "No description"}...
                  </p>

                  <div style={styles.activityInfo}>
                    <div style={styles.infoItem}>
                      <MdPeople size={16} color="#71717A" />
                      <span>{activity.conductedBy}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <MdCalendarToday size={16} color="#71717A" />
                      <span>{activity.date ? new Date(activity.date).toLocaleDateString() : "TBA"}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <MdLocationOn size={16} color="#71717A" />
                      <span>{activity.venue || "TBA"}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
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
                    <div style={styles.cardActions}>
                      <button style={styles.editIconBtn} onClick={() => handleEdit(activity)}>
                        <MdEdit size={16} />
                      </button>
                      <button style={styles.deleteIconBtn} onClick={() => handleDelete(activity._id)}>
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listView}>
              {filteredActivities.map((activity) => (
                <div key={activity._id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <span style={{
                      ...styles.categoryDot,
                      backgroundColor: 
                        activity.category === "Sports" ? "#3B82F6" :
                        activity.category === "Cultural" ? "#EC4899" :
                        activity.category === "Technical" ? "#10B981" : "#F59E0B"
                    }}></span>
                    <div style={styles.listItemInfo}>
                      <h4 style={styles.listItemTitle}>{activity.title}</h4>
                      <p style={styles.listItemSubtitle}>
                        {activity.conductedBy} • {activity.date ? new Date(activity.date).toLocaleDateString() : "TBA"}
                      </p>
                    </div>
                  </div>
                  <div style={styles.listItemRight}>
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
                    <div style={styles.cardActions}>
                      <button style={styles.editIconBtn} onClick={() => handleEdit(activity)}>
                        <MdEdit size={16} />
                      </button>
                      <button style={styles.deleteIconBtn} onClick={() => handleDelete(activity._id)}>
                        <MdDelete size={16} />
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
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Category Distribution</h3>
            <div style={styles.statsList}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
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
            <h3 style={styles.sidebarTitle}>Status Overview</h3>
            <div style={styles.statsList}>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Upcoming</span>
                <span style={styles.statsValue}>{stats.upcoming}</span>
              </div>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Ongoing</span>
                <span style={styles.statsValue}>{stats.ongoing}</span>
              </div>
              <div style={styles.statsItem}>
                <span style={styles.statsLabel}>Completed</span>
                <span style={styles.statsValue}>{stats.completed}</span>
              </div>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                <MdAdd size={18} color="#667EEA" />
                <span>Create Activity</span>
              </button>
              <button style={styles.quickActionBtn} onClick={handleExport}>
                <MdDownload size={18} color="#10B981" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={handleCloseModal}>
              <MdClose size={24} />
            </button>
            <h2 style={styles.modalTitle}>
              {editMode ? "Edit Activity" : "Add New Activity"}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Activity Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={styles.input}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                style={styles.input}
              >
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Technical">Technical</option>
                <option value="Social Service">Social Service</option>
              </select>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                required
                style={styles.input}
              >
                <option value="College">College</option>
                <option value="Inter-College">Inter-College</option>
                <option value="State">State</option>
                <option value="National">National</option>
                <option value="International">International</option>
              </select>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              />
              <input
                type="text"
                placeholder="Conducted By"
                value={form.conductedBy}
                onChange={(e) => setForm({ ...form, conductedBy: e.target.value })}
                required
                style={styles.input}
              />
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
                type="number"
                placeholder="Max Participants"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                style={styles.input}
              />
              <div style={styles.statusSection}>
                <label style={styles.statusLabel}>
                  Status (Auto-calculated based on date, except Cancelled)
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={styles.input}
                >
                  <option value="Upcoming">Auto: Upcoming (Future Date)</option>
                  <option value="Ongoing">Auto: Ongoing (Today)</option>
                  <option value="Completed">Auto: Completed (Past Date)</option>
                  <option value="Cancelled">Manual: Cancelled</option>
                </select>
                <p style={styles.statusNote}>
                  Status is automatically set based on activity date. Only "Cancelled" can be manually selected.
                </p>
              </div>
              <button type="submit" style={styles.submitBtn}>
                {editMode ? "Update Activity" : "Add Activity"}
              </button>
            </form>
          </div>
        </div>
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
  activitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  activityCard: {
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
  activityInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "14px",
    paddingTop: "14px",
    borderTop: "1px solid #3A3A3A",
  },
  infoItem: {
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
    paddingTop: "12px",
    borderTop: "1px solid #3A3A3A",
  },
  statusBadge: {
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
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
  listView: {
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
    transition: "all 0.2s ease",
  },
  listItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: 0,
  },
  categoryDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  listItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  listItemTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  listItemSubtitle: {
    fontSize: "12px",
    color: "#A1A1AA",
    margin: 0,
  },
  listItemRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
  categoryIndicator: {
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
  statusSection: {
    marginBottom: "16px",
  },
  statusLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#E5E5E5",
    marginBottom: "8px",
  },
  statusNote: {
    fontSize: "12px",
    color: "#A1A1AA",
    marginTop: "6px",
    fontStyle: "italic",
    lineHeight: "1.4",
  },
};

export default ActivitiesManagement;
