import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdSend, MdPerson, MdGroup, MdNotifications } from 'react-icons/md';

const CommunicationModule = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sendMode, setSendMode] = useState('individual'); // 'individual' or 'bulk'
  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });
  const [sending, setSending] = useState(false);

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

  const handleStudentToggle = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      setSending(true);
      
      // Get user IDs for selected students
      const selectedStudentData = students.filter(s => selectedStudents.includes(s._id));
      const recipientIds = selectedStudentData.map(s => s.userId || s._id);

      await API.post('/notifications', {
        recipientIds,
        recipientRole: 'student',
        type: 'message',
        title: form.title,
        message: form.message,
        priority: form.priority,
        link: '/dashboard/student/notifications'
      });

      alert(`Notification sent to ${selectedStudents.length} student(s)!`);
      setForm({ title: '', message: '', priority: 'medium' });
      setSelectedStudents([]);
      setSending(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>💬 Communication Module</h1>
          <p style={styles.pageSubtitle}>Send direct notifications to students</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Students Selection Panel */}
        <div style={styles.studentsPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>
              <MdGroup size={20} />
              Select Students
            </h3>
            <button style={styles.selectAllBtn} onClick={handleSelectAll}>
              {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={styles.selectedCount}>
            {selectedStudents.length} of {students.length} selected
          </div>
          <div style={styles.studentsList}>
            {students.map(student => (
              <label key={student._id} style={styles.studentCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => handleStudentToggle(student._id)}
                  style={styles.checkbox}
                />
                <div style={styles.studentInfo}>
                  <div style={styles.studentAvatar}>
                    {student.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div style={styles.studentName}>{student.name}</div>
                    <div style={styles.studentEmail}>{student.email}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Message Compose Panel */}
        <div style={styles.composePanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>
              <MdNotifications size={20} />
              Compose Notification
            </h3>
          </div>

          <form onSubmit={handleSendNotification} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter notification title..."
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Enter your message..."
                required
                style={{ ...styles.input, minHeight: "150px", resize: "vertical" }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={styles.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={styles.previewSection}>
              <h4 style={styles.previewTitle}>Preview</h4>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <span style={styles.previewTitleText}>{form.title || 'Notification Title'}</span>
                  <span style={{
                    ...styles.priorityBadge,
                    backgroundColor: form.priority === 'urgent' ? '#450A0A' : form.priority === 'high' ? '#451A03' : '#1E3A8A',
                    color: form.priority === 'urgent' ? '#EF4444' : form.priority === 'high' ? '#F59E0B' : '#3B82F6'
                  }}>
                    {form.priority}
                  </span>
                </div>
                <p style={styles.previewMessage}>{form.message || 'Your message will appear here...'}</p>
                <div style={styles.previewFooter}>
                  <span>From: {user?.name}</span>
                  <span>To: {selectedStudents.length} student(s)</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              style={styles.sendBtn}
              disabled={sending || selectedStudents.length === 0}
            >
              <MdSend size={18} />
              {sending ? 'Sending...' : `Send to ${selectedStudents.length} Student(s)`}
            </button>
          </form>
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
    gridTemplateColumns: "400px 1fr",
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
  composePanel: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    padding: "24px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  selectAllBtn: {
    padding: "6px 12px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },
  selectedCount: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "12px",
    padding: "8px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "6px",
  },
  studentsList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  studentCheckbox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  studentAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
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
  previewSection: {
    marginTop: "10px",
  },
  previewTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "12px",
  },
  previewCard: {
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  previewTitleText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  priorityBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  previewMessage: {
    fontSize: "14px",
    color: "#E5E5E5",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  previewFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#A1A1AA",
    paddingTop: "12px",
    borderTop: "1px solid #2A2A2A",
  },
  sendBtn: {
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
};

export default CommunicationModule;
