import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdPerson, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdSearch } from 'react-icons/md';

const UserRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ role: 'all', status: 'all', search: '' });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/user-management');
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/user-management/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    if (filters.role !== 'all') {
      filtered = filtered.filter(u => u.role === filters.role);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(u => u.isActive === (filters.status === 'active'));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(search) || 
        u.email?.toLowerCase().includes(search)
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        await API.put(`/user-management/${userId}/role`, { role: newRole });
        alert("Role updated successfully!");
        fetchUsers();
        fetchStats();
      } catch (error) {
        alert("Error updating role");
      }
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await API.put(`/user-management/${userId}/status`, { isActive: !currentStatus });
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure? This will delete the user and all related records.")) {
      try {
        await API.delete(`/user-management/${userId}`);
        alert("User deleted successfully!");
        fetchUsers();
        fetchStats();
      } catch (error) {
        alert("Error deleting user");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>👥 User Role Management</h1>
          <p style={styles.pageSubtitle}>{filteredUsers.length} users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Users</div>
          <div style={styles.statValue}>{stats.totalUsers || 0}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active</div>
          <div style={{ ...styles.statValue, color: '#10B981' }}>{stats.activeUsers || 0}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Students</div>
          <div style={{ ...styles.statValue, color: '#4FACFE' }}>{stats.students || 0}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Faculty</div>
          <div style={{ ...styles.statValue, color: '#FEE140' }}>{stats.faculty || 0}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Admins</div>
          <div style={{ ...styles.statValue, color: '#EC4899' }}>{stats.admins || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.searchBox}>
          <MdSearch size={20} color="#71717A" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>No users found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Current Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatar}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={styles.roleSelect}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleStatusToggle(user._id, user.isActive)}
                      style={{
                        ...styles.statusBtn,
                        color: user.isActive ? '#10B981' : '#EF4444'
                      }}
                    >
                      {user.isActive ? <MdToggleOn size={24} /> : <MdToggleOff size={24} />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={styles.deleteBtn}
                    >
                      <MdDelete size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#0F0F0F",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
  },
  statLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filtersSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "250px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
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
  tableContainer: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    overflow: "hidden",
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
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userAvatar: {
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
  roleSelect: {
    padding: "6px 10px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "13px",
    cursor: "pointer",
  },
  statusBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default UserRoleManagement;
