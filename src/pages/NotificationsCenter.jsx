import { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MdNotifications, 
  MdDelete, 
  MdCheckCircle, 
  MdRefresh,
  MdMarkEmailRead,
  MdPeople,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdSend,
  MdInbox,
} from 'react-icons/md';

const NotificationsCenter = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';

  // admin has two tabs: received (feedback etc.) + sent
  const [tab, setTab] = useState('received'); // 'received' | 'sent'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [tab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setSelected([]);
      if ((isAdmin || isFaculty) && tab === 'sent') {
        const res = await API.get('/notifications/sent');
        setNotifications(res.data.notifications || []);
        setUnreadCount(0);
      } else {
        const res = await API.get('/notifications/my-notifications');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notification?")) {
      try {
        await API.delete(`/notifications/${id}`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected notification(s)?`)) return;
    try {
      await Promise.all(selected.map(id => API.delete(`/notifications/${id}`)));
      fetchNotifications();
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === notifications.length ? [] : notifications.map(n => n._id));
  };

  const allSelected = notifications.length > 0 && selected.length === notifications.length;
  const someSelected = selected.length > 0;
  const isSentTab = tab === 'sent';

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: { bg: '#450A0A', color: '#EF4444' },
      high:   { bg: '#451A03', color: '#F59E0B' },
      medium: { bg: '#1E3A8A', color: '#3B82F6' },
      low:    { bg: '#064E3B', color: '#10B981' },
    };
    return colors[priority] || colors.medium;
  };

  const showTabs = isAdmin || isFaculty;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>🔔 Notifications</h1>
          <p style={styles.pageSubtitle}>
            {isSentTab
              ? `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} sent`
              : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} onClick={fetchNotifications} title="Refresh">
            <MdRefresh size={18} />
          </button>
          {!isSentTab && unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              <MdMarkEmailRead size={18} />
              Mark All Read
            </button>
          )}
          {someSelected && (
            <button style={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
              <MdDelete size={18} />
              Delete Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Tabs for admin/faculty */}
      {showTabs && (
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'received' ? styles.tabActive : {}) }}
            onClick={() => setTab('received')}
          >
            <MdInbox size={16} />
            Received
            {tab === 'received' && unreadCount > 0 && (
              <span style={styles.tabBadge}>{unreadCount}</span>
            )}
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'sent' ? styles.tabActive : {}) }}
            onClick={() => setTab('sent')}
          >
            <MdSend size={16} />
            Sent
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div style={styles.notificationsContainer}>
        {loading ? (
          <div style={styles.loadingState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <MdNotifications size={48} style={{ color: "#52525B" }} />
            <p style={styles.emptyText}>
              {isSentTab ? 'No notifications sent yet' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All bar */}
            <div style={styles.selectBar}>
              <button style={styles.selectAllBtn} onClick={toggleSelectAll}>
                {allSelected
                  ? <MdCheckBox size={20} color="#667EEA" />
                  : <MdCheckBoxOutlineBlank size={20} color="#71717A" />}
                <span style={{ color: allSelected ? '#667EEA' : '#A1A1AA', fontSize: '13px' }}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              {someSelected && (
                <span style={styles.selectedCount}>{selected.length} selected</span>
              )}
            </div>

            <div style={styles.notificationsList}>
              {notifications.map((notification) => {
                const priorityStyle = getPriorityColor(notification.priority);
                const isSelected = selected.includes(notification._id);
                const isUnread = !isSentTab && !notification.isRead;
                return (
                  <div
                    key={notification._id}
                    style={{
                      ...styles.notificationCard,
                      backgroundColor: isSelected ? '#1E1E2E' : isUnread ? '#1A1A1A' : '#0F0F0F',
                      borderLeft: `4px solid ${isSelected ? '#667EEA' : priorityStyle.color}`,
                      outline: isSelected ? '1px solid #667EEA40' : 'none',
                    }}
                  >
                    <div style={styles.notificationHeader}>
                      <div style={styles.titleRow}>
                        <button style={styles.checkboxBtn} onClick={() => toggleSelect(notification._id)}>
                          {isSelected
                            ? <MdCheckBox size={20} color="#667EEA" />
                            : <MdCheckBoxOutlineBlank size={20} color="#52525B" />}
                        </button>
                        {isUnread && <span style={styles.unreadDot}></span>}
                        <span style={styles.notificationTitle}>{notification.title}</span>
                      </div>
                      <div style={styles.notificationActions}>
                        {isUnread && (
                          <button style={styles.readBtn} onClick={() => handleMarkAsRead(notification._id)} title="Mark as read">
                            <MdCheckCircle size={18} />
                          </button>
                        )}
                        <button style={styles.deleteBtn} onClick={() => handleDelete(notification._id)} title="Delete">
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </div>

                    <p style={styles.notificationMessage}>{notification.message}</p>

                    {/* Sent tab: show recipient */}
                    {isSentTab && notification.recipient && (
                      <div style={styles.recipientRow}>
                        <MdPeople size={14} color="#71717A" />
                        <span style={styles.recipientText}>
                          To: {notification.recipient.name || notification.recipient.email || 'Unknown'}
                          {notification.recipient.role && ` (${notification.recipient.role})`}
                        </span>
                      </div>
                    )}

                    {/* Received tab: show sender */}
                    {!isSentTab && notification.sender && (
                      <div style={styles.recipientRow}>
                        <MdPeople size={14} color="#71717A" />
                        <span style={styles.recipientText}>
                          From: {notification.sender.name || notification.sender.email || 'System'}
                          {notification.sender.role && ` (${notification.sender.role})`}
                        </span>
                      </div>
                    )}

                    <div style={styles.notificationFooter}>
                      <div style={styles.footerLeft}>
                        <span style={{ ...styles.priorityBadge, backgroundColor: priorityStyle.bg, color: priorityStyle.color }}>
                          {notification.priority}
                        </span>
                        <span style={styles.typeBadge}>{notification.type}</span>
                      </div>
                      <span style={styles.notificationTime}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "24px", backgroundColor: "#000000", minHeight: "100vh" },
  headerSection: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "20px", paddingBottom: "20px", borderBottom: "2px solid #1A1A1A",
    flexWrap: "wrap", gap: "12px",
  },
  pageTitle: { fontSize: "28px", fontWeight: "600", color: "#FFFFFF", marginBottom: "6px" },
  pageSubtitle: { fontSize: "14px", color: "#A1A1AA" },
  headerActions: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  iconBtn: {
    width: "40px", height: "40px", borderRadius: "8px",
    backgroundColor: "#141414", border: "1px solid #3A3A3A",
    color: "#E5E5E5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  markAllBtn: {
    display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
    backgroundColor: "#FFFFFF", border: "none", borderRadius: "8px",
    color: "#000000", fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  bulkDeleteBtn: {
    display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
    backgroundColor: "#450A0A", border: "1px solid #EF4444", borderRadius: "8px",
    color: "#EF4444", fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  tabs: {
    display: "flex", gap: "4px", marginBottom: "20px",
    backgroundColor: "#0F0F0F", padding: "4px", borderRadius: "10px",
    border: "1px solid #2A2A2A", width: "fit-content",
  },
  tab: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 20px", borderRadius: "8px", border: "none",
    backgroundColor: "transparent", color: "#71717A",
    fontSize: "14px", fontWeight: "500", cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: { backgroundColor: "#1A1A1A", color: "#FFFFFF", fontWeight: "600" },
  tabBadge: {
    backgroundColor: "#EF4444", color: "#FFFFFF",
    fontSize: "10px", fontWeight: "700", padding: "1px 5px",
    borderRadius: "8px", minWidth: "16px", textAlign: "center",
  },
  notificationsContainer: {
    backgroundColor: "#0F0F0F", borderRadius: "12px",
    padding: "24px", border: "1px solid #2A2A2A",
  },
  loadingState: { textAlign: "center", color: "#71717A", padding: "50px" },
  emptyState: {
    textAlign: "center", padding: "50px", display: "flex",
    flexDirection: "column", alignItems: "center", gap: "10px",
  },
  emptyText: { color: "#71717A", margin: 0 },
  selectBar: {
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "16px", padding: "10px 14px",
    backgroundColor: "#1A1A1A", borderRadius: "8px", border: "1px solid #2A2A2A",
  },
  selectAllBtn: { display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: 0 },
  selectedCount: { fontSize: "13px", color: "#667EEA", fontWeight: "600" },
  notificationsList: { display: "flex", flexDirection: "column", gap: "12px" },
  notificationCard: { padding: "20px", borderRadius: "10px", border: "1px solid #2A2A2A", transition: "all 0.2s ease" },
  notificationHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  titleRow: { display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 },
  checkboxBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", flexShrink: 0 },
  unreadDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3B82F6", boxShadow: "0 0 8px #3B82F6", flexShrink: 0 },
  notificationTitle: { fontSize: "16px", fontWeight: "600", color: "#FFFFFF" },
  notificationActions: { display: "flex", gap: "8px", flexShrink: 0 },
  readBtn: { padding: "6px", backgroundColor: "transparent", border: "none", borderRadius: "6px", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center" },
  deleteBtn: { padding: "6px", backgroundColor: "transparent", border: "none", borderRadius: "6px", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center" },
  notificationMessage: { fontSize: "14px", color: "#E5E5E5", lineHeight: "1.6", marginBottom: "12px", whiteSpace: "pre-line" },
  recipientRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" },
  recipientText: { fontSize: "13px", color: "#71717A" },
  notificationFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #2A2A2A" },
  footerLeft: { display: "flex", gap: "8px", alignItems: "center" },
  priorityBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
  typeBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", backgroundColor: "#1A1A1A", color: "#A1A1AA" },
  notificationTime: { fontSize: "12px", color: "#A1A1AA" },
};

export default NotificationsCenter;
