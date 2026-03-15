import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MdEvent, 
  MdSearch, 
  MdFilterList, 
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdLocationOn,
  MdCalendarToday
} from 'react-icons/md';

const ApplyActivities = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', level: 'all', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchMyApplications();
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

  const fetchMyApplications = async () => {
    try {
      const res = await API.get(`/participations?studentEmail=${user.email}`);
      setMyApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    try {
      let proofUrl = '';
      
      // Upload proof if provided
      if (proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        const uploadRes = await API.post('/upload', formData);
        proofUrl = uploadRes.data.filePath;
      }

      // First, get the student record by email
      const studentRes = await API.get(`/students?email=${user.email}`);
      if (!studentRes.data || studentRes.data.length === 0) {
        alert('Student record not found. Please contact admin.');
        return;
      }

      const studentRecord = studentRes.data[0];

      await API.post('/participations', {
        student: studentRecord._id,
        activity: selectedActivity._id,
        level: selectedActivity.level || 'College',
        date: selectedActivity.date || new Date(),
        status: 'Pending',
        certificate: proofUrl
      });

      alert('Application submitted successfully! Waiting for approval.');
      setShowModal(false);
      setProofFile(null);
      fetchMyApplications();
    } catch (error) {
      console.error('Application error:', error);
      alert(error.response?.data?.message || 'Error submitting application');
    }
  };

  const getApplicationStatus = (activityId) => {
    const app = myApplications.find(a => a.activity?._id === activityId);
    return app?.status || null;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = filters.category === 'all' || activity.category === filters.category;
    const matchesLevel = filters.level === 'all' || activity.level === filters.level;
    const matchesSearch = activity.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>🎯 Apply for Activities</h1>
          <p style={styles.pageSubtitle}>Register for upcoming events and track your applications</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.searchBox}>
          <MdSearch size={20} color="#71717A" />
          <input
            type="text"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Categories</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="Technical">Technical</option>
          <option value="Social">Social</option>
        </select>
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Levels</option>
          <option value="College">College</option>
          <option value="Inter-College">Inter-College</option>
          <option value="State">State</option>
          <option value="National">National</option>
          <option value="International">International</option>
        </select>
      </div>

      {/* Activities Grid */}
      <div style={styles.activitiesGrid}>
        {loading ? (
          <div style={styles.loadingState}>Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div style={styles.emptyState}>No activities found</div>
        ) : (
          filteredActivities.map(activity => {
            const status = getApplicationStatus(activity._id);
            return (
              <div key={activity._id} style={styles.activityCard}>
                <div style={styles.cardHeader}>
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: activity.category === 'Sports' ? '#10B98120' : 
                                   activity.category === 'Cultural' ? '#EC489920' :
                                   activity.category === 'Technical' ? '#4FACFE20' : '#FEE14020',
                    color: activity.category === 'Sports' ? '#10B981' : 
                          activity.category === 'Cultural' ? '#EC4899' :
                          activity.category === 'Technical' ? '#4FACFE' : '#FEE140'
                  }}>
                    {activity.category}
                  </span>
                  <span style={styles.levelBadge}>{activity.level}</span>
                </div>
                
                <h3 style={styles.activityName}>{activity.title}</h3>
                <p style={styles.activityDesc}>{activity.description}</p>
                
                <div style={styles.activityDetails}>
                  <div style={styles.detailItem}>
                    <MdCalendarToday size={16} />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <MdLocationOn size={16} />
                    <span>{activity.venue || 'TBA'}</span>
                  </div>
                </div>

                {status ? (
                  <div style={{
                    ...styles.statusBtn,
                    backgroundColor: status === 'Approved' ? '#064E3B' : 
                                   status === 'Pending' ? '#451A03' : '#450A0A',
                    color: status === 'Approved' ? '#10B981' : 
                          status === 'Pending' ? '#F59E0B' : '#EF4444'
                  }}>
                    {status === 'Approved' && <MdCheckCircle size={18} />}
                    {status === 'Pending' && <MdPending size={18} />}
                    {status === 'Rejected' && <MdCancel size={18} />}
                    {status.toUpperCase()}
                  </div>
                ) : (
                  <button style={styles.applyBtn} onClick={() => handleApply(activity)}>
                    Apply Now
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Application Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Apply for {selectedActivity?.title}</h2>
            <form onSubmit={handleSubmitApplication} style={styles.form}>
              <div style={styles.infoSection}>
                <p><strong>Category:</strong> {selectedActivity?.category}</p>
                <p><strong>Level:</strong> {selectedActivity?.level}</p>
                <p><strong>Date:</strong> {new Date(selectedActivity?.date).toLocaleDateString()}</p>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Upload Proof (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p style={styles.hint}>Upload registration receipt, ID card, or any relevant document</p>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Submit Application
                </button>
              </div>
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
  },
  headerSection: {
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "2px solid #1A1A1A",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "6px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#A1A1AA",
  },
  filtersSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "250px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  },
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  activitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  loadingState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px",
    gridColumn: "1 / -1",
  },
  emptyState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px",
    gridColumn: "1 / -1",
  },
  activityCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  categoryBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  levelBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#667EEA20",
    color: "#667EEA",
  },
  activityName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "10px",
  },
  activityDesc: {
    fontSize: "14px",
    color: "#A1A1AA",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  activityDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #2A2A2A",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#E5E5E5",
  },
  applyBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  statusBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    textTransform: "uppercase",
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
    border: "1px solid #2A2A2A",
  },
  modalTitle: {
    color: "#FFFFFF",
    marginBottom: "20px",
    fontWeight: "600",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoSection: {
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#E5E5E5",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#E5E5E5",
  },
  fileInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
  },
  hint: {
    fontSize: "12px",
    color: "#71717A",
    margin: 0,
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default ApplyActivities;
