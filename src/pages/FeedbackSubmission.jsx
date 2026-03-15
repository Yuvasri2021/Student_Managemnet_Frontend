import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdFeedback, MdStar, MdSend } from 'react-icons/md';

const FeedbackSubmission = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [form, setForm] = useState({
    rating: 5,
    feedback: '',
    suggestions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchMyParticipations();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await API.get('/activities');
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchMyParticipations = async () => {
    try {
      const res = await API.get(`/participations?studentEmail=${user.email}`);
      const approved = res.data.filter(p => p.status === 'Approved');
      setMyParticipations(approved);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedActivity) {
      alert('Please select an activity');
      return;
    }

    try {
      setSubmitting(true);

      const activityTitle = activities.find(a => a._id === selectedActivity)?.title;
      const notifPayload = {
        type: 'feedback',
        title: `⭐ Feedback from ${user.name}: ${activityTitle}`,
        message: `Rating: ${form.rating}/5 — ${
          form.rating === 5 ? 'Excellent' : form.rating === 4 ? 'Good' :
          form.rating === 3 ? 'Average' : form.rating === 2 ? 'Poor' : 'Very Poor'
        }\n\nFeedback: ${form.feedback}${form.suggestions ? `\n\nSuggestions: ${form.suggestions}` : ''}`,
        priority: 'medium',
        metadata: { studentEmail: user.email, studentName: user.name, activityId: selectedActivity, rating: form.rating }
      };

      // Send to both admin and faculty
      await Promise.allSettled([
        API.post('/notifications', { ...notifPayload, recipientRole: 'admin', link: '/dashboard/admin/notifications' }),
        API.post('/notifications', { ...notifPayload, recipientRole: 'faculty', link: '/dashboard/faculty/notifications' }),
      ]);

      alert('Feedback submitted successfully! Thank you for your input.');
      setForm({ rating: 5, feedback: '', suggestions: '' });
      setSelectedActivity('');
      setSubmitting(false);
    } catch (error) {
      alert('Error submitting feedback');
      setSubmitting(false);
    }
  };

  const participatedActivities = activities.filter(activity =>
    myParticipations.some(p => p.activity?._id === activity._id)
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>💬 Submit Feedback</h1>
          <p style={styles.pageSubtitle}>Rate events and submit suggestions</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Form Section */}
        <div style={styles.formSection}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Activity</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                required
                style={styles.select}
              >
                <option value="">-- Select an activity you participated in --</option>
                {participatedActivities.map(activity => (
                  <option key={activity._id} value={activity._id}>
                    {activity.title} - {activity.category}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Rating</label>
              <div style={styles.ratingSection}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    style={{
                      ...styles.starBtn,
                      transform: star <= form.rating ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <MdStar 
                      size={36} 
                      color={star <= form.rating ? '#FFD700' : '#3A3A3A'}
                    />
                  </button>
                ))}
                <span style={{
                  ...styles.ratingText,
                  color: form.rating >= 4 ? '#10B981' : form.rating >= 3 ? '#FFD700' : '#EF4444'
                }}>
                  {form.rating}/5 — {
                    form.rating === 5 ? 'Excellent' :
                    form.rating === 4 ? 'Good' :
                    form.rating === 3 ? 'Average' :
                    form.rating === 2 ? 'Poor' : 'Very Poor'
                  }
                </span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Feedback</label>
              <textarea
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                placeholder="Share your experience about the event..."
                required
                style={{ ...styles.textarea, minHeight: "120px" }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Suggestions for Improvement</label>
              <textarea
                value={form.suggestions}
                onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                placeholder="What could be improved? Any suggestions?"
                style={{ ...styles.textarea, minHeight: "100px" }}
              />
            </div>

            <button 
              type="submit" 
              style={styles.submitBtn}
              disabled={submitting}
            >
              <MdSend size={18} />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <MdFeedback size={32} color="#667EEA" />
            </div>
            <h3 style={styles.infoTitle}>Why Feedback Matters</h3>
            <p style={styles.infoText}>
              Your feedback helps us improve future events and create better experiences for all students.
            </p>
          </div>

          <div style={styles.tipsCard}>
            <h4 style={styles.tipsTitle}>Tips for Good Feedback</h4>
            <ul style={styles.tipsList}>
              <li>Be specific about what you liked or didn't like</li>
              <li>Mention the organization and management</li>
              <li>Comment on the venue and facilities</li>
              <li>Share what you learned or gained</li>
              <li>Suggest concrete improvements</li>
            </ul>
          </div>

          <div style={styles.statsCard}>
            <h4 style={styles.statsTitle}>Your Participation</h4>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{myParticipations.length}</div>
                <div style={styles.statLabel}>Events Attended</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{participatedActivities.length}</div>
                <div style={styles.statLabel}>Can Review</div>
              </div>
            </div>
          </div>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  formSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#E5E5E5",
  },
  select: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  ratingSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  starBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    transition: "transform 0.15s ease",
  },
  ratingText: {
    marginLeft: "12px",
    fontSize: "15px",
    fontWeight: "600",
  },
  textarea: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
    textAlign: "center",
  },
  infoIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    backgroundColor: "#667EEA20",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  infoTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "12px",
  },
  infoText: {
    fontSize: "14px",
    color: "#A1A1AA",
    lineHeight: "1.6",
  },
  tipsCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
  },
  tipsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "12px",
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#A1A1AA",
    fontSize: "13px",
    lineHeight: "1.8",
  },
  statsCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
  },
  statsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  statItem: {
    textAlign: "center",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#A1A1AA",
  },
};

export default FeedbackSubmission;
