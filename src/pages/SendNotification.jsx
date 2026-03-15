import { useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { 
  MdSend, 
  MdClose,
  MdPeople,
  MdCheckCircle,
  MdInfo,
  MdCampaign,
  MdPriorityHigh,
} from 'react-icons/md';

const SendNotification = () => {
  const { user } = useContext(AuthContext);
  const { isMobile, getPadding, getFontSize } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    targetAudience: 'all',
    type: 'announcement',
    title: '',
    message: '',
    priority: 'medium',
    link: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Sending notification:', form);
      
      const targetRole = form.targetAudience;
      let totalSent = 0;

      // If "all", send to students and faculty separately
      if (targetRole === 'all') {
        console.log('Sending to all users (students + faculty)');
        
        // Send to students
        try {
          const studentRes = await API.post('/notifications', {
            recipientRole: 'student',
            type: form.type,
            title: form.title,
            message: form.message,
            priority: form.priority,
            link: form.link || '/dashboard/student/notifications',
            metadata: { sentBy: user.name, sentAt: new Date() }
          });
          console.log('Student notifications:', studentRes.data);
          totalSent += studentRes.data.notifications?.length || 0;
        } catch (err) {
          console.error('Error sending to students:', err.response?.data || err.message);
        }

        // Send to faculty
        try {
          const facultyRes = await API.post('/notifications', {
            recipientRole: 'faculty',
            type: form.type,
            title: form.title,
            message: form.message,
            priority: form.priority,
            link: form.link || '/dashboard/faculty/notifications',
            metadata: { sentBy: user.name, sentAt: new Date() }
          });
          console.log('Faculty notifications:', facultyRes.data);
          totalSent += facultyRes.data.notifications?.length || 0;
        } catch (err) {
          console.error('Error sending to faculty:', err.response?.data || err.message);
        }
      } else {
        // Send to specific role
        console.log(`Sending to ${targetRole}`);
        const res = await API.post('/notifications', {
          recipientRole: targetRole,
          type: form.type,
          title: form.title,
          message: form.message,
          priority: form.priority,
          link: form.link || `/dashboard/${targetRole}/notifications`,
          metadata: { sentBy: user.name, sentAt: new Date() }
        });
        console.log('Notification response:', res.data);
        totalSent = res.data.notifications?.length || 0;
      }

      setSuccess(true);
      setForm({
        targetAudience: 'all',
        type: 'announcement',
        title: '',
        message: '',
        priority: 'medium',
        link: '',
      });
      
      alert(`✅ Notification sent successfully to ${totalSent} user(s)!`);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'announcement': return <MdCampaign size={24} />;
      case 'alert': return <MdPriorityHigh size={24} />;
      case 'message': return <MdInfo size={24} />;
      default: return <MdInfo size={24} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return { bg: '#450A0A', color: '#EF4444' };
      case 'high': return { bg: '#451A03', color: '#F59E0B' };
      case 'medium': return { bg: '#1E3A8A', color: '#3B82F6' };
      case 'low': return { bg: '#064E3B', color: '#10B981' };
      default: return { bg: '#1E3A8A', color: '#3B82F6' };
    }
  };

  return (
    <div style={{...styles.container, padding: getPadding()}}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={{...styles.pageTitle, fontSize: getFontSize('28px', '24px', '22px')}}>
            📤 Send Notification
          </h1>
          <p style={styles.pageSubtitle}>Send instant notifications to users</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentSection}>
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Target Audience */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <MdPeople size={18} />
                Target Audience
              </label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                style={styles.select}
                required
              >
                <option value="all">All Users (Students + Faculty)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
                <option value="admin">Admins Only</option>
              </select>
              <p style={styles.hint}>
                {form.targetAudience === 'all' && '📢 Will send to all students and faculty members'}
                {form.targetAudience === 'student' && '🎓 Will send to all students'}
                {form.targetAudience === 'faculty' && '👨‍🏫 Will send to all faculty members'}
                {form.targetAudience === 'admin' && '👑 Will send to all administrators'}
              </p>
            </div>

            {/* Notification Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Notification Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={styles.select}
                required
              >
                <option value="announcement">Announcement</option>
                <option value="alert">Alert</option>
                <option value="message">Message</option>
                <option value="task">Task</option>
                <option value="approval">Approval</option>
              </select>
            </div>

            {/* Priority */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Priority Level</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={styles.select}
                required
              >
                <option value="low">Low - General information</option>
                <option value="medium">Medium - Standard notification</option>
                <option value="high">High - Important update</option>
                <option value="urgent">Urgent - Critical alert</option>
              </select>
            </div>

            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                placeholder="Enter notification title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={styles.input}
                required
                maxLength={100}
              />
              <p style={styles.hint}>{form.title.length}/100 characters</p>
            </div>

            {/* Message */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Message</label>
              <textarea
                placeholder="Enter notification message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={styles.textarea}
                required
                maxLength={500}
                rows={5}
              />
              <p style={styles.hint}>{form.message.length}/500 characters</p>
            </div>

            {/* Link (Optional) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Link (Optional)</label>
              <input
                type="text"
                placeholder="e.g., /dashboard/student/activities"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                style={styles.input}
              />
              <p style={styles.hint}>Leave empty to use default notifications page</p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.errorBox}>
                <MdClose size={20} />
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={styles.successBox}>
                <MdCheckCircle size={20} />
                Notification sent successfully!
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading}
            >
              <MdSend size={18} />
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Preview Card */}
        <div style={styles.previewCard}>
          <h3 style={styles.previewTitle}>Preview</h3>
          <div style={styles.previewNotification}>
            <div style={{
              ...styles.previewIcon,
              ...getPriorityColor(form.priority),
            }}>
              {getTypeIcon(form.type)}
            </div>
            <div style={styles.previewContent}>
              <div style={styles.previewHeader}>
                <span style={styles.previewNotifTitle}>
                  {form.title || 'Notification Title'}
                </span>
                <span style={{
                  ...styles.priorityBadge,
                  ...getPriorityColor(form.priority),
                }}>
                  {form.priority}
                </span>
              </div>
              <p style={styles.previewMessage}>
                {form.message || 'Your notification message will appear here...'}
              </p>
              <div style={styles.previewFooter}>
                <span style={styles.previewTime}>Just now</span>
                <span style={styles.previewType}>{form.type}</span>
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
    backgroundColor: '#000000',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerSection: {
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '2px solid #1A1A1A',
  },
  pageTitle: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#A1A1AA',
  },
  contentSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  formCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2A2A2A',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#E5E5E5',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #3A3A3A',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #3A3A3A',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #3A3A3A',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  hint: {
    fontSize: '12px',
    color: '#71717A',
    margin: 0,
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#450A0A',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    color: '#EF4444',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  successBox: {
    padding: '12px 16px',
    backgroundColor: '#064E3B',
    border: '1px solid #10B981',
    borderRadius: '8px',
    color: '#10B981',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    marginTop: '10px',
  },
  previewCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2A2A2A',
    height: 'fit-content',
    position: 'sticky',
    top: '24px',
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '16px',
  },
  previewNotification: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#1A1A1A',
    borderRadius: '10px',
    border: '1px solid #2A2A2A',
  },
  previewIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewContent: {
    flex: 1,
    minWidth: 0,
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '8px',
  },
  previewNotifTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  priorityBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  previewMessage: {
    fontSize: '13px',
    color: '#E5E5E5',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #2A2A2A',
  },
  previewTime: {
    fontSize: '11px',
    color: '#71717A',
  },
  previewType: {
    fontSize: '11px',
    color: '#71717A',
    textTransform: 'capitalize',
  },
};

export default SendNotification;
