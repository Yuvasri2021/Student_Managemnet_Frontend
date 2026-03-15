import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdUpload, MdSearch, MdSave, MdEmojiEvents } from 'react-icons/md';

const ResultUpload = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [participations, setParticipations] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const achievementLevels = ['Gold', 'Silver', 'Bronze', 'Participation'];
  const ranks = ['1st', '2nd', '3rd', 'Participant'];

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
      
      // Initialize results state
      const resultsMap = {};
      approved.forEach(p => {
        resultsMap[p._id] = {
          rank: p.rank || '',
          achievementLevel: p.achievementLevel || '',
          points: p.points || 0
        };
      });
      setResults(resultsMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participations:', error);
      setLoading(false);
    }
  };

  const handleResultChange = (participationId, field, value) => {
    setResults({
      ...results,
      [participationId]: {
        ...results[participationId],
        [field]: value
      }
    });
  };

  const handleSaveResults = async () => {
    try {
      const updates = Object.entries(results).map(([id, data]) => ({
        participationId: id,
        ...data
      }));

      await Promise.all(
        updates.map(({ participationId, rank, achievementLevel, points }) =>
          API.put(`/participations/${participationId}`, { 
            rank, 
            achievementLevel, 
            points: parseInt(points) || 0 
          })
        )
      );

      alert('Results saved successfully!');
      fetchParticipations();
    } catch (error) {
      alert('Error saving results');
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
          <h1 style={styles.pageTitle}>🏆 Result Upload</h1>
          <p style={styles.pageSubtitle}>Add winners, ranks, and achievement levels</p>
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

          {/* Results Table */}
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
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Achievement Level</th>
                      <th style={styles.th}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipations.map((participation) => (
                      <tr key={participation._id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <div style={styles.studentCell}>
                            <MdEmojiEvents size={20} color="#FEE140" />
                            {participation.student?.name || 'Unknown'}
                          </div>
                        </td>
                        <td style={styles.td}>{participation.student?.email || 'N/A'}</td>
                        <td style={styles.td}>
                          <select
                            value={results[participation._id]?.rank || ''}
                            onChange={(e) => handleResultChange(participation._id, 'rank', e.target.value)}
                            style={styles.inputSelect}
                          >
                            <option value="">Select Rank</option>
                            {ranks.map(rank => (
                              <option key={rank} value={rank}>{rank}</option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <select
                            value={results[participation._id]?.achievementLevel || ''}
                            onChange={(e) => handleResultChange(participation._id, 'achievementLevel', e.target.value)}
                            style={styles.inputSelect}
                          >
                            <option value="">Select Level</option>
                            {achievementLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            value={results[participation._id]?.points || 0}
                            onChange={(e) => handleResultChange(participation._id, 'points', e.target.value)}
                            style={styles.inputNumber}
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.saveSection}>
                  <div style={styles.resultSummary}>
                    <span style={{ color: '#FFD700' }}>
                      🥇 Gold: {Object.values(results).filter(r => r.achievementLevel === 'Gold').length}
                    </span>
                    <span style={{ color: '#C0C0C0' }}>
                      🥈 Silver: {Object.values(results).filter(r => r.achievementLevel === 'Silver').length}
                    </span>
                    <span style={{ color: '#CD7F32' }}>
                      🥉 Bronze: {Object.values(results).filter(r => r.achievementLevel === 'Bronze').length}
                    </span>
                  </div>
                  <button style={styles.saveBtn} onClick={handleSaveResults}>
                    <MdSave size={18} />
                    Save Results
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
    overflow: "auto",
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
    minWidth: "800px",
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
  studentCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  inputSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "13px",
    cursor: "pointer",
    minWidth: "140px",
  },
  inputNumber: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "13px",
    width: "80px",
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
  resultSummary: {
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

export default ResultUpload;
