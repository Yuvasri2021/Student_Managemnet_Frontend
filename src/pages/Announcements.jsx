import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MdCampaign,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdPriorityHigh,
  MdRefresh,
} from 'react-icons/md';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    targetAudience: "all",
    priority: 0,
    expiryDate: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/announcements');
      setAnnouncements(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        alert("User context not available. Please log in again.");
        return;
      }

      // createdBy is set server-side from the auth token - no need to send from frontend
      const announcementData = { ...form };

      if (editMode) {
        await API.put(`/announcements/${currentAnnouncement}`, announcementData);
        alert("Announcement updated successfully!");
      } else {
        const res = await API.post("/announcements", announcementData);
        const announcement = res.data;

        // Send notifications to target audience
        const targetRole = form.targetAudience;
        const notifPayload = {
          type: 'announcement',
          title: `📢 ${form.title}`,
          message: form.message,
          priority: form.type === 'urgent' ? 'urgent' : form.type === 'warning' ? 'high' : 'medium',
          metadata: { announcementId: announcement._id, announcementType: form.type }
        };

        if (targetRole === 'all') {
          await Promise.allSettled([
            API.post("/notifications", { ...notifPayload, recipientRole: 'student', link: '/dashboard/student/notifications' }),
            API.post("/notifications", { ...notifPayload, recipientRole: 'faculty', link: '/dashboard/faculty/notifications' }),
          ]);
        } else {
          await API.post("/notifications", {
            ...notifPayload,
            recipientRole: targetRole,
            link: `/dashboard/${targetRole}/notifications`,
          }).catch(() => {});
        }

        alert(`Announcement created and notifications sent to ${targetRole === 'all' ? 'all users' : targetRole + 's'}!`);
      }
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || error.message || "Error saving announcement");
    }
  };

  const handleEdit = (announcement) => {
    setEditMode(true);
    setCurrentAnnouncement(announcement._id);
    setForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      targetAudience: announcement.targetAudience,
      priority: announcement.priority,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await API.delete(`/announcements/${id}`);
        alert("Announcement deleted successfully!");
        fetchAnnouncements();
      } catch (error) {
        alert("Error deleting announcement");
      }
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      type: "info",
      targetAudience: "all",
      priority: 0,
      expiryDate: "",
    });
    setEditMode(false);
    setCurrentAnnouncement(null);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <MdCheckCircle size={24} />;
      case 'warning': return <MdWarning size={24} />;
      case 'urgent': return <MdPriorityHigh size={24} />;
      default: return <MdInfo size={24} />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return { bg: '#064E3B', color: '#10B981' };
      case 'warning': return { bg: '#451A03', color: '#F59E0B' };
      case 'urgent': return { bg: '#450A0A', color: '#EF4444' };
      default: return { bg: '#1E3A8A', color: '#3B82F6' };
    }
  };

  // Filter announcements based on user role
  const filteredAnnouncements = announcements.filter(a => 
    a.targetAudience === 'all' || a.targetAudience === user?.role
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>📢 Announcements</h1>
          <p style={styles.pageSubtitle}>{filteredAnnouncements.length} active announcements</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchAnnouncements}>
            <MdRefresh size={18} />
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
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div style={styles.announcementsSection}>
        {loading ? (
          <div style={styles.loadingState}>Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div style={styles.emptyState}>
            <MdCampaign size={48} style={{ color: "#52525B" }} />
            <p style={styles.emptyText}>No announcements available</p>
          </div>
        ) : (
          <div style={styles.announcementsList}>
            {filteredAnnouncements.map((announcement) => {
              const typeStyle = getTypeColor(announcement.type);
              return (
                <div key={announcement._id} style={styles.announcementCard}>
                  <div style={{
                    ...styles.announcementIcon,
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                  }}>
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div style={styles.announcementContent}>
                    <div style={styles.announcementHeader}>
                      <h3 style={styles.announcementTitle}>{announcement.title}</h3>
                      <div style={styles.announcementMeta}>
                        <span style={{
                          ...styles.typeBadge,
                          backgroundColor: typeStyle.bg,
                          color: typeStyle.color,
                        }}>
                          {announcement.type}
                        </span>
                        <span style={styles.audienceBadge}>
                          {announcement.targetAudience}
                        </span>
                      </div>
                    </div>
                    <p style={styles.announcementMessage}>{announcement.message}</p>
                    <div style={styles.announcementFooter}>
                      <span style={styles.announcementDate}>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      {(user?.role === "admin" || user?.role === "faculty") && (
                        <div style={styles.announcementActions}>
                          <button style={styles.editBtn} onClick={() => handleEdit(announcement)}>
                            <MdEdit size={16} />
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(announcement._id)}>
                            <MdDelete size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
              <MdClose size={24} />
            </button>
            <h2 style={styles.modalTitle}>
              {editMode ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={styles.input}
              />
              <textarea
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                style={{ ...styles.input, minHeight: "100px", resize: "vertical" }}
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={styles.input}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                style={styles.input}
              >
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="admin">Admin Only</option>
              </select>
              <input
                type="number"
                placeholder="Priority (0-10)"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                min="0"
                max="10"
                style={styles.input}
              />
              <input
                type="date"
                placeholder="Expiry Date (Optional)"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                style={styles.input}
              />
              <button type="submit" style={styles.submitBtn}>
                {editMode ? "Update Announcement" : "Create Announcement"}
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
  announcementsSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
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
  announcementsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  announcementCard: {
    display: "flex",
    gap: "16px",
    padding: "20px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  announcementIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  announcementContent: {
    flex: 1,
    minWidth: 0,
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  announcementTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "0",
  },
  announcementMeta: {
    display: "flex",
    gap: "8px",
  },
  typeBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  audienceBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#667EEA20",
    color: "#667EEA",
    textTransform: "capitalize",
  },
  announcementMessage: {
    fontSize: "14px",
    color: "#E5E5E5",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  announcementFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #3A3A3A",
  },
  announcementDate: {
    fontSize: "12px",
    color: "#A1A1AA",
  },
  announcementActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "6px 10px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#4FACFE",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    padding: "6px 10px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
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
};

export default Announcements;
