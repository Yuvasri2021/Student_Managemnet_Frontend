import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdSearch, MdPerson, MdEmojiEvents, MdTrendingUp } from 'react-icons/md';

const StudentPerformance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentPerformance = async (studentEmail) => {
    try {
      setLoading(true);
      const res = await API.get(`/participations?studentEmail=${studentEmail}`);
      setParticipations(res.data);
      
      // Calculate stats
      const total = res.data.length;
      const approved = res.data.filter(p => p.status === 'approved').length;
      const pending = res.data.filter(p => p.status === 'pending').length;
      const rejected = res.data.filter(p => p.status === 'rejected').length;
      const totalPoints = res.data.reduce((sum, p) => sum + (p.points || 0), 0);
      
      setStats({ total, approved, pending, rejected, totalPoints });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentPerformance(student.email);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>📊 Student Performance Tracking</h1>
          <p style={styles.pageSubtitle}>View student participation history and achievements</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Students List */}
        <div style={styles.studentsPanel}>
          <div style={styles.searchSection}>
            <MdSearch size={20} color="#71717A" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.studentsList}>
            {filteredStudents.map(student => (
              <div
                key={student._id}
                onClick={() => handleStudentSelect(student)}
                style={{
                  ...styles.studentCard,
                  ...(selectedStudent?._id === student._id ? styles.studentCardActive : {})
                }}
              >
                <div style={styles.studentAvatar}>
                  {student.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div style={styles.studentInfo}>
                  <div style={styles.studentName}>{student.name}</div>
                  <div style={styles.studentEmail}>{student.rollNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Details */}
        <div style={styles.performancePanel}>
          {!selectedStudent ? (
            <div style={styles.emptyState}>
              <MdPerson size={48} color="#52525B" />
              <p style={styles.emptyText}>Select a student to view performance</p>
            </div>
          ) : (
            <>
              {/* Student Header */}
              <div style={styles.studentHeader}>
                <div style={styles.studentHeaderAvatar}>
                  {selectedStudent.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 style={styles.studentHeaderName}>{selectedStudent.name}</h2>
                  <p style={styles.studentHeaderEmail}>{selectedStudent.email}</p>
                  <p style={styles.studentHeaderRoll}>Roll: {selectedStudent.rollNumber}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon} style={{ backgroundColor: '#667EEA20', color: '#667EEA' }}>
                    <MdEmojiEvents size={24} />
                  </div>
                  <div>
                    <div style={styles.statValue}>{stats.total || 0}</div>
                    <div style={styles.statLabel}>Total Participations</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon} style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                    <MdTrendingUp size={24} />
                  </div>
                  <div>
                    <div style={styles.statValue}>{stats.approved || 0}</div>
                    <div style={styles.statLabel}>Approved</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon} style={{ backgroundColor: '#F59E0B20', color: '#F59E0B' }}>
                    <MdEmojiEvents size={24} />
                  </div>
                  <div>
                    <div style={styles.statValue}>{stats.totalPoints || 0}</div>
                    <div style={styles.statLabel}>Total Points</div>
                  </div>
                </div>
              </div>

              {/* Participation History */}
              <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>Participation History</h3>
                {loading ? (
                  <div style={styles.loadingState}>Loading...</div>
                ) : participations.length === 0 ? (
                  <div style={styles.emptyState}>No participations found</div>
                ) : (
                  <div style={styles.historyList}>
                    {participations.map(p => (
                      <div key={p._id} style={styles.historyCard}>
                        <div style={styles.historyHeader}>
                          <span style={styles.activityName}>{p.activity?.name || 'Unknown Activity'}</span>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: p.status === 'approved' ? '#064E3B' : p.status === 'pending' ? '#451A03' : '#450A0A',
                            color: p.status === 'approved' ? '#10B981' : p.status === 'pending' ? '#F59E0B' : '#EF4444'
                          }}>
                            {p.status}
                          </span>
                        </div>
                        <div style={styles.historyDetails}>
                          <span>Category: {p.activity?.category}</span>
                          <span>Level: {p.activity?.level}</span>
                          {p.rank && <span>Rank: {p.rank}</span>}
                          {p.points > 0 && <span>Points: {p.points}</span>}
                        </div>
                        <div style={styles.historyDate}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "24px",
  },
  studentsPanel: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    padding: "20px",
    height: "calc(100vh - 200px)",
    display: "flex",
    flexDirection: "column",
  },
  searchSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  },
  studentsList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "2px solid transparent",
  },
  studentCardActive: {
    backgroundColor: "#667EEA20",
    borderColor: "#667EEA",
  },
  studentAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    flexShrink: 0,
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "2px",
  },
  studentEmail: {
    fontSize: "12px",
    color: "#A1A1AA",
  },
  performancePanel: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    padding: "24px",
    height: "calc(100vh - 200px)",
    overflowY: "auto",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "10px",
  },
  emptyText: {
    color: "#71717A",
    margin: 0,
  },
  studentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "1px solid #2A2A2A",
  },
  studentHeaderAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  studentHeaderName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  studentHeaderEmail: {
    fontSize: "14px",
    color: "#A1A1AA",
    marginBottom: "2px",
  },
  studentHeaderRoll: {
    fontSize: "13px",
    color: "#71717A",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #2A2A2A",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#A1A1AA",
  },
  historySection: {
    marginTop: "24px",
  },
  historyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  loadingState: {
    textAlign: "center",
    color: "#71717A",
    padding: "30px",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyCard: {
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #2A2A2A",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  activityName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  historyDetails: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  historyDate: {
    fontSize: "12px",
    color: "#71717A",
  },
};

export default StudentPerformance;
