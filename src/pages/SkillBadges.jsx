import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdEmojiEvents, MdStar, MdTrendingUp } from 'react-icons/md';

const SkillBadges = () => {
  const { user } = useContext(AuthContext);
  const [participations, setParticipations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/participations?studentEmail=${user.email}`);
      const approved = res.data.filter(p => p.status === 'Approved');
      setParticipations(approved);
      calculateBadges(approved);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participations:', error);
      setLoading(false);
    }
  };

  const calculateBadges = (participations) => {
    const totalPoints = participations.reduce((sum, p) => sum + (p.points || 0), 0);
    const totalEvents = participations.length;
    
    // Count by category
    const categoryCount = {};
    participations.forEach(p => {
      const cat = p.activity?.category || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Count by achievement level
    const achievementCount = {
      Gold: participations.filter(p => p.achievementLevel === 'Gold').length,
      Silver: participations.filter(p => p.achievementLevel === 'Silver').length,
      Bronze: participations.filter(p => p.achievementLevel === 'Bronze').length
    };

    const earnedBadges = [];

    // Participation Milestones
    if (totalEvents >= 1) earnedBadges.push({ 
      name: 'First Step', 
      level: 'Bronze', 
      description: 'Participated in your first event',
      icon: '🎯',
      category: 'Milestone'
    });
    if (totalEvents >= 5) earnedBadges.push({ 
      name: 'Active Participant', 
      level: 'Silver', 
      description: 'Participated in 5 events',
      icon: '⭐',
      category: 'Milestone'
    });
    if (totalEvents >= 10) earnedBadges.push({ 
      name: 'Event Champion', 
      level: 'Gold', 
      description: 'Participated in 10+ events',
      icon: '🏆',
      category: 'Milestone'
    });

    // Points Milestones
    if (totalPoints >= 50) earnedBadges.push({ 
      name: 'Point Collector', 
      level: 'Bronze', 
      description: 'Earned 50+ points',
      icon: '💎',
      category: 'Achievement'
    });
    if (totalPoints >= 100) earnedBadges.push({ 
      name: 'Point Master', 
      level: 'Silver', 
      description: 'Earned 100+ points',
      icon: '💫',
      category: 'Achievement'
    });
    if (totalPoints >= 200) earnedBadges.push({ 
      name: 'Point Legend', 
      level: 'Gold', 
      description: 'Earned 200+ points',
      icon: '👑',
      category: 'Achievement'
    });

    // Category Specialist
    Object.entries(categoryCount).forEach(([cat, count]) => {
      if (count >= 3) earnedBadges.push({ 
        name: `${cat} Specialist`, 
        level: 'Silver', 
        description: `Participated in 3+ ${cat} events`,
        icon: cat === 'Sports' ? '⚽' : cat === 'Cultural' ? '🎭' : cat === 'Technical' ? '💻' : '🌟',
        category: 'Specialist'
      });
    });

    // Achievement Badges
    if (achievementCount.Gold >= 1) earnedBadges.push({ 
      name: 'Gold Winner', 
      level: 'Gold', 
      description: 'Won a Gold achievement',
      icon: '🥇',
      category: 'Winner'
    });
    if (achievementCount.Silver >= 1) earnedBadges.push({ 
      name: 'Silver Winner', 
      level: 'Silver', 
      description: 'Won a Silver achievement',
      icon: '🥈',
      category: 'Winner'
    });
    if (achievementCount.Bronze >= 1) earnedBadges.push({ 
      name: 'Bronze Winner', 
      level: 'Bronze', 
      description: 'Won a Bronze achievement',
      icon: '🥉',
      category: 'Winner'
    });

    setBadges(earnedBadges);
    setStats({
      totalPoints,
      totalEvents,
      bronzeBadges: earnedBadges.filter(b => b.level === 'Bronze').length,
      silverBadges: earnedBadges.filter(b => b.level === 'Silver').length,
      goldBadges: earnedBadges.filter(b => b.level === 'Gold').length
    });
  };

  const getBadgeColor = (level) => {
    switch(level) {
      case 'Gold': return { bg: '#FFD70020', color: '#FFD700', border: '#FFD700' };
      case 'Silver': return { bg: '#C0C0C020', color: '#C0C0C0', border: '#C0C0C0' };
      case 'Bronze': return { bg: '#CD7F3220', color: '#CD7F32', border: '#CD7F32' };
      default: return { bg: '#667EEA20', color: '#667EEA', border: '#667EEA' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>🏅 Skill Badges</h1>
          <p style={styles.pageSubtitle}>Earn badges for milestones and achievements</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#667EEA20', color: '#667EEA' }}>
            <MdEmojiEvents size={28} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.totalEvents || 0}</div>
            <div style={styles.statLabel}>Total Events</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#10B98120', color: '#10B981' }}>
            <MdTrendingUp size={28} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.totalPoints || 0}</div>
            <div style={styles.statLabel}>Total Points</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#FFD70020', color: '#FFD700' }}>
            <MdStar size={28} />
          </div>
          <div>
            <div style={styles.statValue}>{badges.length}</div>
            <div style={styles.statLabel}>Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Badge Level Summary */}
      <div style={styles.levelSummary}>
        <div style={styles.levelItem}>
          <span style={styles.levelIcon}>🥇</span>
          <span style={styles.levelCount}>{stats.goldBadges || 0}</span>
          <span style={styles.levelName}>Gold</span>
        </div>
        <div style={styles.levelItem}>
          <span style={styles.levelIcon}>🥈</span>
          <span style={styles.levelCount}>{stats.silverBadges || 0}</span>
          <span style={styles.levelName}>Silver</span>
        </div>
        <div style={styles.levelItem}>
          <span style={styles.levelIcon}>🥉</span>
          <span style={styles.levelCount}>{stats.bronzeBadges || 0}</span>
          <span style={styles.levelName}>Bronze</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={styles.badgesSection}>
        <h2 style={styles.sectionTitle}>Your Badges</h2>
        {loading ? (
          <div style={styles.loadingState}>Loading badges...</div>
        ) : badges.length === 0 ? (
          <div style={styles.emptyState}>
            <MdEmojiEvents size={48} color="#52525B" />
            <p style={styles.emptyText}>No badges earned yet</p>
            <p style={styles.emptyHint}>Participate in activities to earn badges!</p>
          </div>
        ) : (
          <div style={styles.badgesGrid}>
            {badges.map((badge, index) => {
              const colors = getBadgeColor(badge.level);
              return (
                <div key={index} style={{
                  ...styles.badgeCard,
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}>
                  <div style={styles.badgeIcon}>{badge.icon}</div>
                  <h3 style={styles.badgeName}>{badge.name}</h3>
                  <p style={styles.badgeDescription}>{badge.description}</p>
                  <div style={styles.badgeFooter}>
                    <span style={{
                      ...styles.badgeLevel,
                      color: colors.color
                    }}>
                      {badge.level}
                    </span>
                    <span style={styles.badgeCategory}>{badge.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div style={styles.progressSection}>
        <h2 style={styles.sectionTitle}>Next Milestones</h2>
        <div style={styles.progressList}>
          {stats.totalEvents < 5 && (
            <div style={styles.progressItem}>
              <div style={styles.progressInfo}>
                <span style={styles.progressName}>Active Participant Badge</span>
                <span style={styles.progressDesc}>Participate in {5 - stats.totalEvents} more event(s)</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${(stats.totalEvents / 5) * 100}%`
                }}></div>
              </div>
            </div>
          )}
          {stats.totalPoints < 100 && (
            <div style={styles.progressItem}>
              <div style={styles.progressInfo}>
                <span style={styles.progressName}>Point Master Badge</span>
                <span style={styles.progressDesc}>Earn {100 - stats.totalPoints} more point(s)</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${(stats.totalPoints / 100) * 100}%`
                }}></div>
              </div>
            </div>
          )}
          {stats.totalEvents >= 10 && stats.totalPoints >= 200 && (
            <div style={styles.congratsMessage}>
              🎉 Congratulations! You've unlocked all major milestones!
            </div>
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
  },
  statIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
  },
  levelSummary: {
    display: "flex",
    justifyContent: "space-around",
    padding: "24px",
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    marginBottom: "32px",
  },
  levelItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  levelIcon: {
    fontSize: "40px",
  },
  levelCount: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  levelName: {
    fontSize: "14px",
    color: "#A1A1AA",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  badgesSection: {
    marginBottom: "32px",
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
    padding: "50px",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyText: {
    color: "#71717A",
    fontSize: "16px",
    margin: 0,
  },
  emptyHint: {
    color: "#52525B",
    fontSize: "14px",
    margin: 0,
  },
  badgesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  badgeCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "2px solid",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  badgeIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  badgeName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  badgeDescription: {
    fontSize: "14px",
    color: "#A1A1AA",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  badgeFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #2A2A2A",
  },
  badgeLevel: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badgeCategory: {
    fontSize: "12px",
    color: "#71717A",
  },
  progressSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  progressList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  progressItem: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressDesc: {
    fontSize: "13px",
    color: "#A1A1AA",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#1A1A1A",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667EEA 0%, #764BA2 100%)",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  congratsMessage: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#064E3B",
    color: "#10B981",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
  },
};

export default SkillBadges;
