import { useState, useEffect } from "react";
import API from "../api/axios";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClose, 
  MdSearch,
  MdFilterList,
  MdDownload,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdViewModule,
  MdViewList,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdMoreVert,
  MdTrendingUp,
} from "react-icons/md";

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    department: "",
    year: "",
    email: "",
    phone: "",
    rollNumber: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students");
      setStudents(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
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
        await API.put(`/students/${currentStudent}`, form);
        alert("Student updated successfully!");
      } else {
        await API.post("/students", form);
        alert("Student added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving student");
    }
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setCurrentStudent(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      department: student.department,
      year: student.year,
      email: student.email,
      phone: student.phone || "",
      rollNumber: student.rollNumber || "",
      password: "", // Don't show password when editing
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await API.delete(`/students/${id}`);
        alert("Student deleted successfully!");
        fetchStudents();
      } catch (error) {
        alert("Error deleting student");
      }
    }
  };

  const resetForm = () => {
    setForm({
      studentId: "",
      name: "",
      department: "",
      year: "",
      email: "",
      phone: "",
      rollNumber: "",
      password: "",
    });
    setEditMode(false);
    setCurrentStudent(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Get unique departments and years from students and department management
  const allDepartments = [
    "All",
    ...departments.map(d => d?.name || d).filter(name => name && typeof name === 'string'),
    ...new Set(students.map(s => s.department).filter(d => d && d !== "Not Set" && typeof d === 'string'))
  ];
  const uniqueDepartments = ["All", ...new Set(allDepartments.filter(d => d !== "All"))];
  const years = ["All", ...new Set(students.map(s => s.year))];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "All" || student.department === filterDepartment;
    const matchesYear = filterYear === "All" || student.year.toString() === filterYear;
    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Toggle student selection
  const toggleSelectStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Select all students
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ["Student ID", "Name", "Department", "Year", "Email", "Phone", "Roll Number"],
      ...filteredStudents.map(s => [
        s.studentId, s.name, s.department, s.year, s.email, s.phone || "", s.rollNumber || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedStudents.length} selected students?`)) {
      try {
        await Promise.all(selectedStudents.map(id => API.delete(`/students/${id}`)));
        alert("Students deleted successfully!");
        setSelectedStudents([]);
        fetchStudents();
      } catch (error) {
        alert("Error deleting students");
      }
    }
  };

  // Calculate stats
  const stats = {
    total: students.length,
    departments: new Set(students.map(s => s.department).filter(d => d && d !== "Not Set")).size,
    byDepartment: uniqueDepartments.filter(d => d !== "All").reduce((acc, dept) => {
      acc[dept] = students.filter(s => s.department === dept).length;
      return acc;
    }, {}),
    byYear: years.filter(y => y !== "All").reduce((acc, year) => {
      acc[year] = students.filter(s => s.year.toString() === year).length;
      return acc;
    }, {}),
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Students Management</h1>
          <p style={styles.pageSubtitle}>{filteredStudents.length} students found</p>
        </div>
        <div style={styles.headerRight}>
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
            Add Student
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
            <p style={styles.statLabel}>Total Students</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.total}</h2>
            <div style={styles.statChange}>
              <MdTrendingUp size={16} color="#10B981" />
              <span style={{ color: "#10B981" }}>Active</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdSchool size={28} color="#F5576C" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Departments</p>
            <h2 style={styles.statNumber}>{loading ? "..." : stats.departments}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Active departments</span>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <MdEmail size={28} color="#4FACFE" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Selected</p>
            <h2 style={styles.statNumber}>{selectedStudents.length}</h2>
            <div style={styles.statChange}>
              <span style={{ color: "#A1A1AA" }}>Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Students Section */}
        <div style={styles.studentsSection}>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <MdSearch size={20} color="#71717A" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
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

              <select 
                style={styles.filterSelect} 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="All">All Years</option>
                {years.filter(y => y !== "All").map(year => (
                  <option key={year} value={year}>Year {year}</option>
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
          {selectedStudents.length > 0 && (
            <div style={styles.bulkActions}>
              <span style={styles.bulkText}>{selectedStudents.length} selected</span>
              <button style={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
                <MdDelete size={16} />
                Delete Selected
              </button>
              <button style={styles.bulkClearBtn} onClick={() => setSelectedStudents([])}>
                Clear Selection
              </button>
            </div>
          )}

          {/* Students Display */}
          {loading ? (
            <div style={styles.loadingState}>Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={styles.emptyState}>
              <MdPerson size={48} style={{ color: "#52525B" }} />
              <p style={styles.emptyText}>No students found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={styles.studentsGrid}>
              {filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  style={{
                    ...styles.studentCard,
                    transform: hoveredCard === student._id ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredCard === student._id ? '0 8px 16px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={() => setHoveredCard(student._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.cardHeader}>
                    <button 
                      style={styles.selectBtn}
                      onClick={() => toggleSelectStudent(student._id)}
                    >
                      {selectedStudents.includes(student._id) ? 
                        <MdCheckBox size={20} color="#667EEA" /> : 
                        <MdCheckBoxOutlineBlank size={20} color="#71717A" />
                      }
                    </button>
                    <button style={styles.moreBtn}>
                      <MdMoreVert size={18} />
                    </button>
                  </div>

                  <div style={styles.studentAvatar}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>

                  <h3 style={styles.studentName}>{student.name}</h3>
                  <p style={styles.studentId}>{student.studentId}</p>

                  <div style={styles.studentInfo}>
                    <div style={styles.infoItem}>
                      <MdSchool size={16} color="#71717A" />
                      <span>{student.department}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <MdEmail size={16} color="#71717A" />
                      <span>{student.email}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <MdPhone size={16} color="#71717A" />
                      <span>{student.phone || "N/A"}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.yearBadge}>Year {student.year}</span>
                    <div style={styles.cardActions}>
                      <button style={styles.editIconBtn} onClick={() => handleEdit(student)}>
                        <MdEdit size={16} />
                      </button>
                      <button style={styles.deleteIconBtn} onClick={() => handleDelete(student._id)}>
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>
                      <button onClick={toggleSelectAll} style={styles.selectBtn}>
                        {selectedStudents.length === filteredStudents.length ? 
                          <MdCheckBox size={20} color="#667EEA" /> : 
                          <MdCheckBoxOutlineBlank size={20} color="#71717A" />
                        }
                      </button>
                    </th>
                    <th style={styles.th}>Student ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Department</th>
                    <th style={styles.th}>Year</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <button 
                          onClick={() => toggleSelectStudent(student._id)}
                          style={styles.selectBtn}
                        >
                          {selectedStudents.includes(student._id) ? 
                            <MdCheckBox size={20} color="#667EEA" /> : 
                            <MdCheckBoxOutlineBlank size={20} color="#71717A" />
                          }
                        </button>
                      </td>
                      <td style={styles.td}>{student.studentId}</td>
                      <td style={styles.td}>{student.name}</td>
                      <td style={styles.td}>{student.department}</td>
                      <td style={styles.td}>{student.year}</td>
                      <td style={styles.td}>{student.email}</td>
                      <td style={styles.td}>{student.phone || "N/A"}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button style={styles.editBtn} onClick={() => handleEdit(student)}>
                            <MdEdit size={16} />
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(student._id)}>
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Department Distribution</h3>
            <div style={styles.statsList}>
              {Object.entries(stats.byDepartment).map(([dept, count]) => (
                <div key={dept} style={styles.statsItem}>
                  <span style={styles.statsLabel}>{dept}</span>
                  <span style={styles.statsValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Year Distribution</h3>
            <div style={styles.statsList}>
              {Object.entries(stats.byYear).map(([year, count]) => (
                <div key={year} style={styles.statsItem}>
                  <span style={styles.statsLabel}>Year {year}</span>
                  <span style={styles.statsValue}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                <MdAdd size={18} color="#667EEA" />
                <span>Add New Student</span>
              </button>
              <button style={styles.quickActionBtn} onClick={handleExport}>
                <MdDownload size={18} color="#10B981" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={handleCloseModal}>
              <MdClose size={24} />
            </button>
            <h2 style={styles.modalTitle}>
              {editMode ? "Edit Student" : "Add New Student"}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Student ID"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                required
                style={styles.input}
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
                type="number"
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
                style={styles.input}
              />
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
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Roll Number"
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                style={styles.input}
              />
              {!editMode && (
                <input
                  type="password"
                  placeholder="Password (default: student123)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                />
              )}
              <button type="submit" style={styles.submitBtn}>
                {editMode ? "Update Student" : "Add Student"}
              </button>
            </form>
          </div>
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
    marginBottom: "6px",
  },
  statChange: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
  },
  studentsSection: {
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
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #3A3A3A",
  },
  bulkText: {
    fontSize: "13px",
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
  },
  bulkDeleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#EF4444",
    border: "none",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  bulkClearBtn: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#A1A1AA",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
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
    fontSize: "13px",
  },
  studentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  studentCard: {
    backgroundColor: "#1A1A1A",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  selectBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  moreBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#A1A1AA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "0 auto 16px",
  },
  studentName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: "4px",
  },
  studentId: {
    fontSize: "12px",
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: "16px",
  },
  studentInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #3A3A3A",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#A1A1AA",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #3A3A3A",
  },
  yearBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor: "#667EEA20",
    color: "#667EEA",
  },
  cardActions: {
    display: "flex",
    gap: "6px",
  },
  editIconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#4FACFE",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  editBtn: {
    padding: "6px 10px",
    backgroundColor: "#4FACFE20",
    border: "1px solid #4FACFE",
    borderRadius: "6px",
    color: "#4FACFE",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
  },
  deleteBtn: {
    padding: "6px 10px",
    backgroundColor: "#EF444420",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
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
  statsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statsItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
    border: "1px solid #3A3A3A",
  },
  statsLabel: {
    fontSize: "13px",
    color: "#A1A1AA",
    fontWeight: "500",
  },
  statsValue: {
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

export default StudentsManagement;
