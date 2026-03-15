import { useEffect, useState } from 'react';
import API from '../api/axios';
import { MdAdd, MdEdit, MdDelete, MdSchool, MdPerson, MdClose } from 'react-icons/md';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/departments');
      setDepartments(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/departments/${currentDept}`, form);
        alert("Department updated successfully!");
      } else {
        await API.post("/departments", form);
        alert("Department created successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving department");
    }
  };

  const handleEdit = (dept) => {
    setEditMode(true);
    setCurrentDept(dept._id);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      isActive: dept.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await API.delete(`/departments/${id}`);
        alert("Department deleted successfully!");
        fetchDepartments();
      } catch (error) {
        alert("Error deleting department");
      }
    }
  };

  const resetForm = () => {
    setForm({ name: "", code: "", description: "", isActive: true });
    setEditMode(false);
    setCurrentDept(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>🏛️ Department Management</h1>
          <p style={styles.pageSubtitle}>{departments.length} departments</p>
        </div>
        <button style={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
          <MdAdd size={18} />
          Add Department
        </button>
      </div>

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loadingState}>Loading departments...</div>
        ) : departments.length === 0 ? (
          <div style={styles.emptyState}>No departments found</div>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.deptIcon}>
                  <MdSchool size={24} />
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(dept)}>
                    <MdEdit size={16} />
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(dept._id)}>
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
              <h3 style={styles.deptName}>{dept.name}</h3>
              <p style={styles.deptCode}>Code: {dept.code}</p>
              {dept.description && <p style={styles.deptDesc}>{dept.description}</p>}
              <div style={styles.stats}>
                <div style={styles.statItem}>
                  <MdPerson size={16} />
                  <span>{dept.studentCount || 0} Students</span>
                </div>
                <div style={styles.statItem}>
                  <MdPerson size={16} />
                  <span>{dept.facultyCount || 0} Faculty</span>
                </div>
              </div>
              <div style={{
                ...styles.statusBadge,
                backgroundColor: dept.isActive ? '#064E3B' : '#450A0A',
                color: dept.isActive ? '#10B981' : '#EF4444'
              }}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
              <MdClose size={24} />
            </button>
            <h2 style={styles.modalTitle}>
              {editMode ? "Edit Department" : "Add New Department"}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Department Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Department Code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
                style={styles.input}
              />
              <textarea
                placeholder="Description (Optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, minHeight: "80px" }}
              />
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>
              <button type="submit" style={styles.submitBtn}>
                {editMode ? "Update Department" : "Create Department"}
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
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
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
  card: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2A2A2A",
    position: "relative",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  deptIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop:"30px",
  },
  editBtn: {
    padding: "6px 10px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#4FACFE",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 10px",
    backgroundColor: "#450A0A",
    border: "1px solid #EF4444",
    borderRadius: "6px",
    color: "#EF4444",
    cursor: "pointer",
  },
  deptName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  deptCode: {
    fontSize: "13px",
    color: "#A1A1AA",
    marginBottom: "8px",
  },
  deptDesc: {
    fontSize: "13px",
    color: "#E5E5E5",
    marginBottom: "12px",
  },
  stats: {
    display: "flex",
    gap: "16px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #2A2A2A",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#A1A1AA",
  },
  statusBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
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
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#E5E5E5",
    fontSize: "14px",
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
  },
};

export default DepartmentManagement;
