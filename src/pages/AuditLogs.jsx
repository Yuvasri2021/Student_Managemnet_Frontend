import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdHistory, MdFilterList, MdRefresh } from 'react-icons/md';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entity: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 50,
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity })
      });
      
      const res = await API.get(`/audit-logs?${params}`);
      setLogs(res.data.logs);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: '#10B981',
      update: '#4FACFE',
      delete: '#EF4444',
      login: '#667EEA',
      logout: '#A1A1AA',
      approve: '#10B981',
      reject: '#EF4444',
      export: '#FEE140'
    };
    return colors[action] || '#A1A1AA';
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '🚪',
      approve: '✅',
      reject: '❌',
      export: '📥'
    };
    return icons[action] || '📝';
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>📋 Audit Logs</h1>
          <p style={styles.pageSubtitle}>{pagination.total} total activities</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchLogs}>
          <MdRefresh size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filterGroup}>
          <MdFilterList size={20} color="#A1A1AA" />
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="export">Export</option>
          </select>
        </div>
        <select
          value={filters.entity}
          onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="">All Entities</option>
          <option value="user">User</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="activity">Activity</option>
          <option value="participation">Participation</option>
          <option value="announcement">Announcement</option>
          <option value="department">Department</option>
        </select>
      </div>

      {/* Logs Timeline */}
      <div style={styles.logsContainer}>
        {loading ? (
          <div style={styles.loadingState}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={styles.emptyState}>No audit logs found</div>
        ) : (
          <div style={styles.timeline}>
            {logs.map((log) => (
              <div key={log._id} style={styles.logItem}>
                <div style={{
                  ...styles.logIcon,
                  backgroundColor: `${getActionColor(log.action)}20`,
                  color: getActionColor(log.action)
                }}>
                  {getActionIcon(log.action)}
                </div>
                <div style={styles.logContent}>
                  <div style={styles.logHeader}>
                    <span style={styles.logUser}>
                      {log.user?.name || 'Unknown User'}
                    </span>
                    <span style={{
                      ...styles.logAction,
                      color: getActionColor(log.action)
                    }}>
                      {log.action}
                    </span>
                    <span style={styles.logEntity}>{log.entity}</span>
                  </div>
                  <p style={styles.logDescription}>{log.description}</p>
                  <div style={styles.logFooter}>
                    <span style={styles.logTime}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {log.ipAddress && (
                      <span style={styles.logIp}>IP: {log.ipAddress}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
            disabled={pagination.currentPage === 1}
            style={styles.paginationBtn}
          >
            Previous
          </button>
          <span style={styles.paginationInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
            disabled={pagination.currentPage === pagination.totalPages}
            style={styles.paginationBtn}
          >
            Next
          </button>
        </div>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  refreshBtn: {
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
  filtersSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
  },
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  logsContainer: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
    marginBottom: "24px",
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
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logItem: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #2A2A2A",
  },
  logIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  logContent: {
    flex: 1,
    minWidth: 0,
  },
  logHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  logUser: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logAction: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: "4px",
    backgroundColor: "#1A1A1A",
  },
  logEntity: {
    fontSize: "12px",
    color: "#A1A1AA",
    textTransform: "capitalize",
  },
  logDescription: {
    fontSize: "14px",
    color: "#E5E5E5",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  logFooter: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#71717A",
  },
  logTime: {},
  logIp: {},
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
  },
  paginationBtn: {
    padding: "8px 16px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#A1A1AA",
  },
};

export default AuditLogs;
