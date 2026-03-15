import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdSave, MdRefresh, MdEmojiEvents } from 'react-icons/md';

const PointsConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const levels = [
    { key: 'College', label: 'College Level', color: '#4FACFE' },
    { key: 'Inter-College', label: 'Inter-College', color: '#667EEA' },
    { key: 'State', label: 'State Level', color: '#FEE140' },
    { key: 'National', label: 'National Level', color: '#FA709A' },
    { key: 'International', label: 'International Level', color: '#10B981' }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/points-config');
      const configMap = {};
      res.data.forEach(c => {
        configMap[c.level] = c;
      });
      
      // Initialize with existing or default values
      const initialized = levels.map(level => {
        if (configMap[level.key]) {
          return configMap[level.key];
        }
        return {
          level: level.key,
          points: 0,
          description: '',
          isActive: true
        };
      });
      
      setConfigs(initialized);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching configs:', error);
      setLoading(false);
    }
  };

  const handlePointsChange = (level, value) => {
    setConfigs(configs.map(c => 
      c.level === level ? { ...c, points: parseInt(value) || 0 } : c
    ));
  };

  const handleDescriptionChange = (level, value) => {
    setConfigs(configs.map(c => 
      c.level === level ? { ...c, description: value } : c
    ));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Save each config
      for (const config of configs) {
        await API.post('/points-config', config);
      }
      
      alert("Points configuration saved successfully!");
      fetchConfigs();
      setSaving(false);
    } catch (error) {
      alert("Error saving configuration");
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>⚙️ Points Configuration</h1>
          <p style={styles.pageSubtitle}>Configure points for each activity level</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={fetchConfigs}>
            <MdRefresh size={18} />
          </button>
          <button 
            style={styles.saveBtn} 
            onClick={handleSaveAll}
            disabled={saving}
          >
            <MdSave size={18} />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingState}>Loading configuration...</div>
      ) : (
        <div style={styles.configGrid}>
          {configs.map((config, index) => {
            const levelInfo = levels.find(l => l.key === config.level);
            return (
              <div key={config.level} style={styles.configCard}>
                <div style={{
                  ...styles.levelIcon,
                  backgroundColor: `${levelInfo?.color}20`,
                  color: levelInfo?.color
                }}>
                  <MdEmojiEvents size={28} />
                </div>
                <h3 style={styles.levelTitle}>{levelInfo?.label}</h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Points</label>
                  <input
                    type="number"
                    value={config.points}
                    onChange={(e) => handlePointsChange(config.level, e.target.value)}
                    style={styles.pointsInput}
                    min="0"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description (Optional)</label>
                  <textarea
                    value={config.description || ''}
                    onChange={(e) => handleDescriptionChange(config.level, e.target.value)}
                    style={styles.textarea}
                    placeholder="Add description..."
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <div style={styles.infoSection}>
        <h3 style={styles.infoTitle}>ℹ️ How Points Work</h3>
        <ul style={styles.infoList}>
          <li>Points are automatically calculated based on participation level</li>
          <li>Higher level activities earn more points</li>
          <li>Points contribute to the leaderboard rankings</li>
          <li>Changes take effect immediately for new participations</li>
        </ul>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
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
  headerActions: {
    display: "flex",
    gap: "10px",
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
  },
  saveBtn: {
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
  },
  loadingState: {
    textAlign: "center",
    color: "#71717A",
    padding: "50px",
  },
  configGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  configCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  levelIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  levelTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "8px",
    fontWeight: "500",
  },
  pointsInput: {
    width: "94%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
  },
  textarea: {
    width: "94%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    minHeight: "60px",
    resize: "vertical",
  },
  infoSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#E5E5E5",
    fontSize: "14px",
    lineHeight: "1.8",
  },
};

export default PointsConfiguration;
