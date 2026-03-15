import { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
  MdEmojiEvents,
  MdTrendingUp,
  MdStar,
  MdFilterList,
  MdRefresh,
} from 'react-icons/md';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const [participationsRes, studentsRes] = await Promise.all([
        API.get('/participations'),
        API.get('/students'),
      ]);

      // Calculate points for each student
      const studentPoints = {};
      participationsRes.data.forEach(p => {
        if (p.status === 'Approved' && p.student?.email) {
          const email = p.student.email;
          if (!studentPoints[email]) {
            studentPoints[email] = {
              name: p.student.name || p.student.email,
              email: p.student.email,
              points: 0,
              participations: 0,
              levels: {
                International: 0,
                National: 0,
                State: 0,
                'Inter-College': 0,
                College: 0,
              }
            };
          }
          
          // Award points based on level
          const levelPoints = {
            'International': 100,
            'National': 75,
            'State': 50,
            'Inter-College': 30,
            'College': 20,
          };
          
          studentPoints[email].points += levelPoints[p.level] || 10;
          studentPoints[email].participations += 1;
          studentPoints[email].levels[p.level] = (studentPoints[email].levels[p.level] || 0) + 1;
        }
      });

      // Convert to array and sort
      const leaderboardData = Object.values(studentPoints)
        .sort((a, b) => b.points - a.points)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter(student => {
    if (filterLevel === "All") return true;
    return student.levels[filterLevel] > 0;
  });

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#667EEA';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>🏆 Leaderboard</h1>
          <p style={styles.pageSubtitle}>Top performers ranked by achievements</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchLeaderboard}>
            <MdRefresh size={18} />
          </button>
          <select 
            style={styles.filterSelect} 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="International">International</option>
            <option value="National">National</option>
            <option value="State">State</option>
            <option value="Inter-College">Inter-College</option>
            <option value="College">College</option>
          </select>
          <select 
            style={styles.filterSelect} 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="All Time">All Time</option>
            <option value="This Year">This Year</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && filteredLeaderboard.length >= 3 && (
        <div style={styles.podiumSection}>
          {/* 2nd Place */}
          <div style={styles.podiumCard}>
            <div style={{...styles.podiumRank, backgroundColor: '#C0C0C0'}}>🥈</div>
            <div style={styles.podiumAvatar}>
              {filteredLeaderboard[1].name.charAt(0).toUpperCase()}
            </div>
            <h3 style={styles.podiumName}>{filteredLeaderboard[1].name}</h3>
            <p style={styles.podiumPoints}>{filteredLeaderboard[1].points} pts</p>
            <p style={styles.podiumParticipations}>{filteredLeaderboard[1].participations} participations</p>
          </div>

          {/* 1st Place */}
          <div style={{...styles.podiumCard, ...styles.podiumFirst}}>
            <div style={{...styles.podiumRank, backgroundColor: '#FFD700'}}>🥇</div>
            <div style={{...styles.podiumAvatar, ...styles.podiumAvatarFirst}}>
              {filteredLeaderboard[0].name.charAt(0).toUpperCase()}
            </div>
            <h3 style={styles.podiumName}>{filteredLeaderboard[0].name}</h3>
            <p style={styles.podiumPoints}>{filteredLeaderboard[0].points} pts</p>
            <p style={styles.podiumParticipations}>{filteredLeaderboard[0].participations} participations</p>
          </div>

          {/* 3rd Place */}
          <div style={styles.podiumCard}>
            <div style={{...styles.podiumRank, backgroundColor: '#CD7F32'}}>🥉</div>
            <div style={styles.podiumAvatar}>
              {filteredLeaderboard[2].name.charAt(0).toUpperCase()}
            </div>
            <h3 style={styles.podiumName}>{filteredLeaderboard[2].name}</h3>
            <p style={styles.podiumPoints}>{filteredLeaderboard[2].points} pts</p>
            <p style={styles.podiumParticipations}>{filteredLeaderboard[2].participations} participations</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div style={styles.leaderboardSection}>
        <h2 style={styles.sectionTitle}>Full Rankings</h2>
        {loading ? (
          <div style={styles.loadingState}>Loading leaderboard...</div>
        ) : filteredLeaderboard.length === 0 ? (
          <div style={styles.emptyState}>
            <MdEmojiEvents size={48} style={{ color: "#52525B" }} />
            <p style={styles.emptyText}>No data available</p>
          </div>
        ) : (
          <div style={styles.leaderboardList}>
            {filteredLeaderboard.map((student) => (
              <div key={student.email} style={styles.leaderboardItem}>
                <div style={styles.rankBadge} style={{ color: getRankColor(student.rank) }}>
                  {getRankBadge(student.rank)}
                </div>
                <div style={styles.studentAvatar}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.studentInfo}>
                  <h4 style={styles.studentName}>{student.name}</h4>
                  <p style={styles.studentEmail}>{student.email}</p>
                </div>
                <div style={styles.statsSection}>
                  <div style={styles.statItem}>
                    <MdEmojiEvents size={16} color="#667EEA" />
                    <span>{student.participations}</span>
                  </div>
                  <div style={styles.statItem}>
                    <MdStar size={16} color="#FFD700" />
                    <span>{student.points} pts</span>
                  </div>
                </div>
                <div style={styles.levelBadges}>
                  {student.levels.International > 0 && (
                    <span style={{...styles.levelBadge, backgroundColor: '#EC4899'}}>
                      Int: {student.levels.International}
                    </span>
                  )}
                  {student.levels.National > 0 && (
                    <span style={{...styles.levelBadge, backgroundColor: '#3B82F6'}}>
                      Nat: {student.levels.National}
                    </span>
                  )}
                  {student.levels.State > 0 && (
                    <span style={{...styles.levelBadge, backgroundColor: '#10B981'}}>
                      State: {student.levels.State}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
  },
  podiumSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr 1fr",
    gap: "20px",
    marginBottom: "40px",
    alignItems: "end",
  },
  podiumCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
    textAlign: "center",
    position: "relative",
    transition: "all 0.2s ease",
  },
  podiumFirst: {
    transform: "scale(1.1)",
    border: "2px solid #FFD700",
  },
  podiumRank: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  podiumAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "20px auto 16px",
  },
  podiumAvatarFirst: {
    width: "100px",
    height: "100px",
    fontSize: "40px",
  },
  podiumName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  podiumPoints: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: "4px",
  },
  podiumParticipations: {
    fontSize: "13px",
    color: "#A1A1AA",
    margin: 0,
  },
  leaderboardSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "20px",
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
  leaderboardList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  rankBadge: {
    fontSize: "24px",
    fontWeight: "700",
    minWidth: "50px",
    textAlign: "center",
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
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  studentEmail: {
    fontSize: "12px",
    color: "#A1A1AA",
    margin: 0,
  },
  statsSection: {
    display: "flex",
    gap: "16px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#E5E5E5",
  },
  levelBadges: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  levelBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
};

export default Leaderboard;
