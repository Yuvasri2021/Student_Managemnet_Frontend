import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdDownload, MdEmojiEvents, MdVerified, MdSearch } from 'react-icons/md';

const CertificateDownload = () => {
  const { user } = useContext(AuthContext);
  const [participations, setParticipations] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/participations?studentEmail=${user.email}`);
      const approved = res.data.filter(p => p.status === 'Approved');
      setParticipations(approved);
      // Get student name from participation data, fallback to user context, then email
      const name = approved[0]?.student?.name || user.name || user.email || 'Student';
      setStudentName(name);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participations:', error);
      setStudentName(user.name || user.email || 'Student');
      setLoading(false);
    }
  };

  const generateCertificate = (participation) => {
    // Create a simple certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Georgia', serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            width: 800px;
            padding: 60px;
            background: white;
            border: 20px solid #667eea;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .title {
            font-size: 48px;
            color: #667eea;
            margin: 0;
            font-weight: bold;
          }
          .subtitle {
            font-size: 20px;
            color: #666;
            margin: 10px 0;
          }
          .content {
            text-align: center;
            margin: 40px 0;
          }
          .recipient {
            font-size: 36px;
            color: #333;
            margin: 20px 0;
            font-weight: bold;
            border-bottom: 2px solid #667eea;
            display: inline-block;
            padding-bottom: 10px;
          }
          .achievement {
            font-size: 18px;
            color: #666;
            line-height: 1.8;
            margin: 20px 0;
          }
          .details {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #eee;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
          }
          .detail-value {
            font-size: 16px;
            color: #333;
            font-weight: bold;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <h1 class="title">CERTIFICATE</h1>
            <p class="subtitle">of Achievement</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #666;">This is to certify that</p>
            <div class="recipient">${studentName}</div>
            <p class="achievement">
              has successfully participated in<br/>
              <strong style="font-size: 24px; color: #667eea;">${participation.activity?.title}</strong><br/>
              ${participation.rank ? `and secured <strong>${participation.rank}</strong> position` : ''}
              ${participation.achievementLevel ? `with <strong>${participation.achievementLevel}</strong> level achievement` : ''}
            </p>
          </div>
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${participation.activity?.category}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Level</div>
              <div class="detail-value">${participation.activity?.level}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date</div>
              <div class="detail-value">${new Date(participation.activity?.date).toLocaleDateString()}</div>
            </div>
            ${participation.points ? `
            <div class="detail-item">
              <div class="detail-label">Points Earned</div>
              <div class="detail-value">${participation.points}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const filteredParticipations = participations.filter(p =>
    p.activity?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.activity?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>📜 Download Certificates</h1>
          <p style={styles.pageSubtitle}>Download participation and achievement certificates</p>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <MdSearch size={20} color="#71717A" />
        <input
          type="text"
          placeholder="Search by activity name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Certificates List */}
      <div style={styles.certificatesGrid}>
        {loading ? (
          <div style={styles.loadingState}>Loading certificates...</div>
        ) : filteredParticipations.length === 0 ? (
          <div style={styles.emptyState}>
            <MdEmojiEvents size={48} color="#52525B" />
            <p style={styles.emptyText}>No certificates available yet</p>
            <p style={styles.emptyHint}>Participate in activities to earn certificates!</p>
          </div>
        ) : (
          filteredParticipations.map(participation => (
            <div key={participation._id} style={styles.certificateCard}>
              <div style={styles.cardIcon}>
                <MdVerified size={32} color="#10B981" />
              </div>
              
              <h3 style={styles.activityName}>{participation.activity?.title}</h3>
              
              <div style={styles.certificateDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Category:</span>
                  <span style={styles.detailValue}>{participation.activity?.category}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Level:</span>
                  <span style={styles.detailValue}>{participation.activity?.level}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Date:</span>
                  <span style={styles.detailValue}>
                    {new Date(participation.activity?.date).toLocaleDateString()}
                  </span>
                </div>
                {participation.rank && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Rank:</span>
                    <span style={{
                      ...styles.detailValue,
                      color: '#FFD700',
                      fontWeight: '600'
                    }}>
                      {participation.rank}
                    </span>
                  </div>
                )}
                {participation.achievementLevel && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Achievement:</span>
                    <span style={{
                      ...styles.detailValue,
                      color: participation.achievementLevel === 'Gold' ? '#FFD700' :
                            participation.achievementLevel === 'Silver' ? '#C0C0C0' :
                            participation.achievementLevel === 'Bronze' ? '#CD7F32' : '#10B981',
                      fontWeight: '600'
                    }}>
                      {participation.achievementLevel}
                    </span>
                  </div>
                )}
                {participation.points > 0 && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Points:</span>
                    <span style={styles.detailValue}>{participation.points}</span>
                  </div>
                )}
              </div>

              <button 
                style={styles.downloadBtn}
                onClick={() => generateCertificate(participation)}
              >
                <MdDownload size={18} />
                Download Certificate
              </button>
            </div>
          ))
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
  certificatesGrid: {
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
    padding: "50px",
    gridColumn: "1 / -1",
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
  certificateCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  cardIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    backgroundColor: "#064E3B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  activityName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "20px",
  },
  certificateDetails: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  detailLabel: {
    color: "#A1A1AA",
  },
  detailValue: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  downloadBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default CertificateDownload;
