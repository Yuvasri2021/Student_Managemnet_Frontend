import { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone,
  MdSearch,
  MdFilterList,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSchool,
  MdWork,
  MdViewModule,
  MdViewList,
  MdRefresh,
  MdDownload,
  MdCheckCircle,
} from 'react-icons/md';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [form, setForm] = useState({
    facultyId: "",
    name: "",
    department: "",
    email: "",
    phone: "",
    designation: "",
    qualification: "",
    specialization: "",
    joiningDate: "",
    password: "",
  });

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await API.get('/faculty');
      setFaculty(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/faculty/${currentFaculty}`, form);
        alert("Faculty updated successfully!");
      } else {
        await API.post("/faculty", form);
        alert("Faculty added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchFaculty();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving faculty");
    }
  };

  const handleEdit = (facultyMember) => {
    setEditMode(true);
    setCurrentFaculty(facultyMember._id);
    setForm({
      facultyId: facultyMember.facultyId,
      name: facultyMember.name,
      department: facultyMember.department,
      email: facultyMember.email,
      phone: facultyMember.phone || "",
      designation: facultyMember.designation || "",
      qualification: facultyMember.qualification || "",
      specialization: facultyMember.specialization || "",
      joiningDate: facultyMember.joiningDate ? new Date(facultyMember.joiningDate).toISOString().split('T')[0] : "",
      password: "", // Don't show password when editing
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      try {
        await API.delete(`/faculty/${id}`);
        alert("Faculty deleted successfully!");
        fetchFaculty();
      } catch (error) {
        alert("Error deleting faculty");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFaculty.length === 0) {
      alert("Please select faculty members to delete");
      return;
    }
    if (window.confirm(`Delete ${selectedFaculty.length} faculty member(s)?`)) {
      try {
        await Promise.all(selectedFaculty.map(id => API.delete(`/faculty/${id}`)));
        alert("Faculty deleted successfully!");
        setSelectedFaculty([]);
        fetchFaculty();
      } catch (error) {
        alert("Error deleting faculty");
      }
    }
  };

  const resetForm = () => {
    setForm({
      facultyId: "",
      name: "",
      department: "",
      email: "",
      phone: "",
      designation: "",
      qualification: "",
      specialization: "",
      joiningDate: "",
      password: "",
    });
    setEditMode(false);
    setCurrentFaculty(null);
  };

  const handleExport = () => {
    const csvContent = [
      ["Faculty ID", "Name", "Department", "Email", "Phone", "Designation", "Qualification", "Specialization", "Joining Date"],
      ...filteredFaculty.map(f => [
        f.facultyId,
        f.name,
        f.department,
        f.email,
        f.phone || "N/A",
        f.designation || "N/A",
        f.qualification || "N/A",
        f.specialization || "N/A",
        f.joiningDate ? new Date(f.joiningDate).toLocaleDateString() : "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty.csv";
    a.click();
  };

  const toggleSelectFaculty = (id) => {
    setSelectedFaculty(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFaculty.length === filteredFaculty.length) {
      setSelectedFaculty([]);
    } else {
      setSelectedFaculty(filteredFaculty.map(f => f._id));
    }
  };

  // Get unique departments from faculty and department management
  const allDepartments = [
    "All",
    ...departments.map(d => d?.name || d).filter(name => name && typeof name === 'string'),
    ...new Set(faculty.map(f => f.department).filter(d => d && d !== "Not Set" && typeof d === 'string'))
  ];
  const uniqueDepartments = ["All", ...new Set(allDepartments.filter(d => d !== "All"))];

  // Filter faculty
  const filteredFaculty = faculty.filter(facultyMember => {
    const matchesSearch = 
      facultyMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyMember.facultyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "All" || facultyMember.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Calculate stats
  const stats = {
    total: faculty.length,
    departments: new Set(faculty.map(f => f.department).filter(d => d && d !== "Not Set")).size,
    professors: faculty.filter(f => f.designation?.toLowerCase().includes('professor')).length,
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Faculty Management</h1>
          <p style={styles.pageSubtitle}>{filteredFaculty.length} faculty members</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchFaculty}>
            <MdRefresh size={18} />
          </button>
          <button style={styles.exportBtn} onClick={handleExport}>
            <MdDownload size={18} />
            Export
          </button>
          <button
            style={styles.addBtn}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <MdAdd size={18} />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdPerson size={28} color="#667EEA" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Total Faculty</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdSchool size={28} color="#4FACFE" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Departments</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.departments}</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdWork size={28} color="#10B981" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Professors</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.professors}</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Faculty Section */}
        <div style={styles.facultySection}>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <MdSearch size={20} color="#71717A" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.toolbarRight}>
              <select 
                style={styles.filterSelect} 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <div style={styles.viewToggle}>
                <button 
                  style={{
                    ...styles.viewBtn,
                    ...(viewMode === "grid" ? styles.viewBtnActive : {})
                  }}
                  onClick={() => setViewMode("grid")}
                >
                  <MdViewModule size={18} />
                </button>
                <button 
                  style={{
                    ...styles.viewBtn,
                    ...(viewMode === "table" ? styles.viewBtnActive : {})
                  }}
                  onClick={() => setViewMode("table")}
                >
                  <MdViewList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFaculty.length > 0 && (
            <div style={styles.bulkActions}>
              <span style={styles.bulkText}>{selectedFaculty.length} selected</span>
              <button style={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
                <MdDelete size={16} />
                Delete Selected
              </button>
            </div>
          )}

          {/* Faculty Display */}
          {loading ? (
            <div style={styles.loadingState}>Loading faculty...</div>
          ) : filteredFaculty.length === 0 ? (
            <div style={styles.emptyState}>
              <MdPerson size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No faculty members found</p>
              <p style={styles.emptySubtext}>Try adjusting your filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={styles.facultyGrid}>
              {filteredFaculty.map((facultyMember) => (
                <FacultyCard 
                  key={facultyMember._id} 
                  faculty={facultyMember}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSelected={selectedFaculty.includes(facultyMember._id)}
                  onToggleSelect={toggleSelectFaculty}
                />
              ))}
            </div>
          ) : (
            <FacultyTable 
              faculty={filteredFaculty}
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectedFaculty={selectedFaculty}
              onToggleSelect={toggleSelectFaculty}
              onToggleSelectAll={toggleSelectAll}
            />
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Department Distribution</h3>
            <div style={styles.departmentList}>
              {uniqueDepartments.filter(d => d !== "All").map(department => {
                const count = faculty.filter(f => f.department === department).length;
                return (
                  <div key={department} style={styles.departmentItem}>
                    <span style={styles.departmentName}>{department}</span>
                    <span style={styles.departmentCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                <MdAdd size={18} color="#667EEA" />
                <span>Add Faculty</span>
              </button>
              <button style={styles.quickActionBtn} onClick={handleExport}>
                <MdDownload size={18} color="#10B981" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Modal */}
      {showModal && (
        <FacultyModal
          form={form}
          setForm={setForm}
          editMode={editMode}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          departments={departments}
        />
      )}
    </div>
  );
};

// Faculty Card Component
const FacultyCard = ({ faculty, onEdit, onDelete, isSelected, onToggleSelect }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      style={{
        ...styles.facultyCard,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: isSelected ? '2px solid #667EEA' : '1px solid #3A3A3A',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardHeader}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(faculty._id)}
          style={styles.checkbox}
        />
        <span style={styles.facultyId}>#{faculty.facultyId}</span>
      </div>

      <div style={styles.facultyAvatar}>
        {faculty.name.charAt(0).toUpperCase()}
      </div>

      <h3 style={styles.facultyName}>{faculty.name}</h3>
      <p style={styles.designation}>{faculty.designation || "Not Set"}</p>

      <div style={styles.cardInfo}>
        <div style={styles.infoRow}>
          <MdSchool size={16} color="#71717A" />
          <span>{faculty.department}</span>
        </div>
        <div style={styles.infoRow}>
          <MdEmail size={16} color="#71717A" />
          <span>{faculty.email}</span>
        </div>
        <div style={styles.infoRow}>
          <MdPhone size={16} color="#71717A" />
          <span>{faculty.phone || 'N/A'}</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        <button style={styles.editBtn} onClick={() => onEdit(faculty)}>
          <MdEdit size={16} />
          Edit
        </button>
        <button style={styles.deleteBtn} onClick={() => onDelete(faculty._id)}>
          <MdDelete size={16} />
        </button>
      </div>
    </div>
  );
};

// Faculty Table Component
const FacultyTable = ({ faculty, onEdit, onDelete, selectedFaculty, onToggleSelect, onToggleSelectAll }) => {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>
              <input
                type="checkbox"
                checked={selectedFaculty.length === faculty.length && faculty.length > 0}
                onChange={onToggleSelectAll}
                style={styles.checkbox}
              />
            </th>
            <th style={styles.th}>Faculty ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Designation</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faculty.map((facultyMember) => (
            <tr key={facultyMember._id} style={styles.tableRow}>
              <td style={styles.td}>
                <input
                  type="checkbox"
                  checked={selectedFaculty.includes(facultyMember._id)}
                  onChange={() => onToggleSelect(facultyMember._id)}
                  style={styles.checkbox}
                />
              </td>
              <td style={styles.td}>{facultyMember.facultyId}</td>
              <td style={styles.td}>{facultyMember.name}</td>
              <td style={styles.td}>{facultyMember.department}</td>
              <td style={styles.td}>{facultyMember.designation || 'N/A'}</td>
              <td style={styles.td}>{facultyMember.email}</td>
              <td style={styles.td}>{facultyMember.phone || 'N/A'}</td>
              <td style={styles.td}>
                <div style={styles.actionBtns}>
                  <button style={styles.editTableBtn} onClick={() => onEdit(facultyMember)}>
                    <MdEdit size={16} />
                  </button>
                  <button style={styles.deleteTableBtn} onClick={() => onDelete(facultyMember._id)}>
                    <MdDelete size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Faculty Modal Component
const FacultyModal = ({ form, setForm, editMode, onSubmit, onClose, departments }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <MdClose size={24} />
        </button>
        <h2 style={styles.modalTitle}>
          {editMode ? "Edit Faculty" : "Add New Faculty"}
        </h2>
        <form onSubmit={onSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Faculty ID"
            value={form.facultyId}
            onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
            required
            style={styles.input}
            disabled={editMode}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={styles.input}
          />
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Designation (e.g., Professor, Assistant Professor)"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Qualification (e.g., Ph.D., M.Tech)"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Specialization"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            style={styles.input}
          />
          <input
            type="date"
            placeholder="Joining Date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
            style={styles.input}
          />
          {!editMode && (
            <input
              type="password"
              placeholder="Password (default: faculty123)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
            />
          )}
          <button type="submit" style={styles.submitBtn}>
            {editMode ? "Update Faculty" : "Add Faculty"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultyManagement;

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
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#141414",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  addBtn: {
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
    transition: "all 0.2s ease",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "#0F0F0F",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #2A2A2A",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    backgroundColor: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#A1A1AA",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
  },
  facultySection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    flex: 1,
    minWidth: "250px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  toolbarRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  filterSelect: {
    padding: "10px 14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#E5E5E5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    outline: "none",
  },
  viewToggle: {
    display: "flex",
    gap: "4px",
    backgroundColor: "#1A1A1A",
    padding: "4px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  viewBtn: {
    padding: "6px 10px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  viewBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  bulkActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #3A3A3A",
  },
  bulkText: {
    fontSize: "13px",
    color: "#E5E5E5",
    fontWeight: "600",
  },
  bulkDeleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    fontSize: "14px",
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#52525B",
    margin: 0,
    fontSize: "12px",
  },
  facultyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  facultyCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    padding: "20px",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  facultyId: {
    fontSize: "11px",
    color: "#71717A",
    fontWeight: "600",
    backgroundColor: "#0F0F0F",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  facultyAvatar: {
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
    marginBottom: "16px",
  },
  facultyName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "4px",
    textAlign: "center",
  },
  designation: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "16px",
    textAlign: "center",
  },
  cardInfo: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #3A3A3A",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#A1A1AA",
  },
  cardFooter: {
    width: "100%",
    display: "flex",
    gap: "8px",
    paddingTop: "16px",
    borderTop: "1px solid #3A3A3A",
  },
  editBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#4FACFE",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "8px",
    color: "#EF4444",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    borderBottom: "2px solid #3A3A3A",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    color: "#A1A1AA",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  td: {
    padding: "14px 12px",
    fontSize: "13px",
    color: "#E5E5E5",
  },
  actionBtns: {
    display: "flex",
    gap: "6px",
  },
  editTableBtn: {
    padding: "6px 10px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#4FACFE",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  deleteTableBtn: {
    padding: "6px 10px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sidebarCard: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
  },
  sidebarTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "16px",
  },
  departmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  departmentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  departmentName: {
    fontSize: "13px",
    color: "#E5E5E5",
    fontWeight: "500",
  },
  departmentCount: {
    fontSize: "14px",
    color: "#FFFFFF",
    fontWeight: "700",
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  quickActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#0F0F0F",
    padding: "28px",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    border: "1px solid #2A2A2A",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    fontSize: "24px",
    padding: "4px",
  },
  modalTitle: {
    color: "#FFFFFF",
    marginBottom: "24px",
    fontWeight: "600",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
};
