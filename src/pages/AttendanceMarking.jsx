import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdCheckCircle, MdCancel, MdSearch, MdSave } from 'react-icons/md';

const AttendanceMarking = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [participations, setParticipations] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      fetchParticipations();
    }
  }, [selectedActivity]);

  const fetchActivities = async () => {
    try {
      const res = await API.get('/activities');
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/participations?activityId=${selectedActivity}`);
      const approved = res.data.filter(p => p.status === 'Approved');
      setParticipations(approved);
      
      // Initialize attendance state
      const attendanceMap = {};
      approved.forEach(p => {
        attendanceMap[p._id] = p.attendance || 'not-marked';
      });
      setAttendance(attendanceMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participations:', error);
      setLoading(false);
    }
  };

  const handleAttendanceChange = (participationId, status) => {
    setAttendance({ ...attendance, [participationId]: status });
  };

  const handleSaveAttendance = async () => {
    try {
      const updates = Object.entries(attendance).map(([id, status]) => ({
        participationId: id,
        attendance: status
      }));

      await Promise.all(
        updates.map(({ participationId, attendance }) =>
          API.put(`/participations/${participationId}`, { attendance })
        )
      );

      alert('Attendance saved successfully!');
      fetchParticipations();
    } catch (error) {
      alert('Error saving attendance');
    }
  };

  const filteredParticipations = participations.filter(p =>
    p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>✅ Attendance Marking</h1>
          <p style={styles.pageSubtitle}>Mark attendance for approved participations</p>
        </div>
      </div>

      {/* Activity Selection */}
      <div style={styles.selectionSection}>
        <label style={styles.label}>Select Activity</label>
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Select Activity --</option>
          {activities.map(activity => (
            <option key={activity._id} value={activity._id}>
              {activity.title} - {activity.category}
            </option>
          ))}
        </select>
      </div>

      {selectedActivity && (
        <>
          {/* Search */}
          <div style={styles.searchSection}>
            <MdSearch size={20} color="#71717A" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Attendance Table */}
          <div style={styles.tableContainer}>
            {loading ? (
              <div style={styles.loadingState}>Loading participations...</div>
            ) : filteredParticipations.length === 0 ? (
              <div style={styles.emptyState}>No approved participations found</div>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Roll Number</th>
                      <th style={styles.th}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipations.map((participation) => (
                      <tr key={participation._id} style={styles.tableRow}>
                        <td style={styles.td}>{participation.student?.name || 'Unknown'}</td>
                        <td style={styles.td}>{participation.student?.email || 'N/A'}</td>
                        <td style={styles.td}>{participation.student?.rollNumber || 'N/A'}</td>
                        <td style={styles.td}>
                          <div style={styles.attendanceButtons}>
                            <button
                              onClick={() => handleAttendanceChange(participation._id, 'present')}
                              style={{
                                ...styles.attendanceBtn,
                                ...(attendance[participation._id] === 'present' ? styles.presentActive : {})
                              }}
                            >
                              <MdCheckCircle size={18} />
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(participation._id, 'absent')}
                              style={{
                                ...styles.attendanceBtn,
                                ...(attendance[participation._id] === 'absent' ? styles.absentActive : {})
                              }}
                            >
                              <MdCancel size={18} />
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.saveSection}>
                  <div style={styles.attendanceSummary}>
                    <span style={{ color: '#10B981' }}>
                      Present: {Object.values(attendance).filter(v => v === 'present').length}
                    </span>
                    <span style={{ color: '#EF4444' }}>
                      Absent: {Object.values(attendance).filter(v => v === 'absent').length}
                    </span>
                    <span style={{ color: '#71717A' }}>
                      Not Marked: {Object.values(attendance).filter(v => v === 'not-marked').length}
                    </span>
                  </div>
                  <button style={styles.saveBtn} onClick={handleSaveAttendance}>
                    <MdSave size={18} />
                    Save Attendance
                  </button>
                </div>
              </>
            )}
          </div>
        </>
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
  selectionSection: {
    marginBottom: "24px",
    backgroundColor: "#0F0F0F",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#E5E5E5",
    marginBottom: "10px",
    fontWeight: "500",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  searchSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  },
  tableContainer: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    overflow: "hidden",
  },
  loadingState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px",
  },
  emptyState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#1A1A1A",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#A1A1AA",
    borderBottom: "1px solid #2A2A2A",
  },
  tableRow: {
    borderBottom: "1px solid #2A2A2A",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#E5E5E5",
  },
  attendanceButtons: {
    display: "flex",
    gap: "8px",
  },
  attendanceBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#A1A1AA",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  presentActive: {
    backgroundColor: "#064E3B",
    borderColor: "#10B981",
    color: "#10B981",
  },
  absentActive: {
    backgroundColor: "#450A0A",
    borderColor: "#EF4444",
    color: "#EF4444",
  },
  saveSection: {
    padding: "20px",
    borderTop: "1px solid #2A2A2A",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  attendanceSummary: {
    display: "flex",
    gap: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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

export default AttendanceMarking;
