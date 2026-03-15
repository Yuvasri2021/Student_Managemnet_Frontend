import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { 
  MdPerson, 
  MdEmail, 
  MdBadge, 
  MdEdit, 
  MdSave,
  MdPhone,
  MdSchool,
  MdCalendarToday,
  MdLocationOn,
  MdCamera,
  MdTrendingUp,
  MdEmojiEvents,
  MdCheckCircle,
} from "react-icons/md";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stats, setStats] = useState({
    activities: 0,
    participations: 0,
    approved: 0,
  });
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    department: "",
    year: "",
    rollNumber: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Initialize form with user data from context
        setForm(prev => ({
          ...prev,
          name: user?.name || "",
          email: user?.email || "",
        }));

        // If user is a student, fetch student details from backend
        if (user?.role === "student" && user?.email) {
          try {
            const studentsRes = await API.get("/students");
            const studentData = studentsRes.data.find(s => s.email === user.email);
            
            if (studentData) {
              setForm({
                name: studentData.name || user?.name || "",
                email: studentData.email || user?.email || "",
                phone: studentData.phone || "",
                department: studentData.department || "",
                year: studentData.year || "",
                rollNumber: studentData.rollNumber || "",
              });
            }
          } catch (error) {
            console.error("Error fetching student data:", error);
          }

          // Fetch participation stats
          fetchStudentStats();
        }

        // Load any saved profile data from localStorage (for image)
        const savedProfile = localStorage.getItem(`profile_${user?.email}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.imagePreview) {
            setImagePreview(parsed.imagePreview);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      const res = await API.get("/participations");
      const userParticipations = res.data.filter(p => p.student?._id === user?._id || p.student?.email === user?.email);
      setStats({
        activities: userParticipations.length,
        participations: userParticipations.length,
        approved: userParticipations.filter(p => p.status === "Approved").length,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // If user is a student, update student record in backend
      if (user?.role === "student") {
        try {
          const studentsRes = await API.get("/students");
          const studentData = studentsRes.data.find(s => s.email === user.email);
          
          if (studentData) {
            // Update existing student
            await API.put(`/students/${studentData._id}`, {
              studentId: studentData.studentId,
              name: form.name,
              email: form.email,
              department: form.department,
              year: form.year,
              phone: form.phone,
              rollNumber: form.rollNumber,
            });
          }
        } catch (error) {
          console.error("Error updating student data:", error);
        }
      }

      // Save image to localStorage
      if (imagePreview) {
        const profileData = { imagePreview };
        localStorage.setItem(`profile_${user?.email}`, JSON.stringify(profileData));
      }
      
      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      alert("Error updating profile: " + (error.response?.data?.message || error.message));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('profile-image-input').click();
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" style={styles.avatarImage} />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <input
              type="file"
              id="profile-image-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button style={styles.cameraBtn} onClick={triggerFileInput}>
              <MdCamera size={16} />
            </button>
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.userName}>{user?.name || "User"}</h1>
            <span style={styles.roleBadge}>
              <MdBadge size={14} />
              {user?.role?.toUpperCase() || "USER"}
            </span>
            <p style={styles.userEmail}>
              <MdEmail size={16} />
              {user?.email || "email@example.com"}
            </p>
          </div>
        </div>
        <button
          style={styles.editBtn}
          onClick={() => editMode ? handleSave() : setEditMode(true)}
        >
          {editMode ? <MdSave size={18} /> : <MdEdit size={18} />}
          {editMode ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* Stats Cards - Only for students */}
      {user?.role === "student" && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              <MdEmojiEvents size={24} color="#667EEA" />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Total Activities</p>
              <h2 style={styles.statNumber}>{loading ? "..." : stats.activities}</h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              <MdCheckCircle size={24} color="#10B981" />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Approved</p>
              <h2 style={styles.statNumber}>{loading ? "..." : stats.approved}</h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              <MdTrendingUp size={24} color="#F5576C" />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Participation Rate</p>
              <h2 style={styles.statNumber}>
                {loading ? "..." : stats.activities > 0 ? Math.round((stats.approved / stats.activities) * 100) : 0}%
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Personal Information */}
        <div style={styles.infoSection}>
          <h2 style={styles.sectionTitle}>Personal Information</h2>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoField}>
              <div style={styles.fieldIcon}>
                <MdPerson size={20} color="#667EEA" />
              </div>
              <div style={styles.fieldContent}>
                <label style={styles.fieldLabel}>Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={styles.fieldInput}
                  />
                ) : (
                  <p style={styles.fieldValue}>{form.name || "N/A"}</p>
                )}
              </div>
            </div>

            <div style={styles.infoField}>
              <div style={styles.fieldIcon}>
                <MdEmail size={20} color="#F5576C" />
              </div>
              <div style={styles.fieldContent}>
                <label style={styles.fieldLabel}>Email Address</label>
                {editMode ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={styles.fieldInput}
                  />
                ) : (
                  <p style={styles.fieldValue}>{form.email || "N/A"}</p>
                )}
              </div>
            </div>

            <div style={styles.infoField}>
              <div style={styles.fieldIcon}>
                <MdPhone size={20} color="#4FACFE" />
              </div>
              <div style={styles.fieldContent}>
                <label style={styles.fieldLabel}>Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter phone number"
                    style={styles.fieldInput}
                  />
                ) : (
                  <p style={styles.fieldValue}>{form.phone || "N/A"}</p>
                )}
              </div>
            </div>

            <div style={styles.infoField}>
              <div style={styles.fieldIcon}>
                <MdBadge size={20} color="#FA709A" />
              </div>
              <div style={styles.fieldContent}>
                <label style={styles.fieldLabel}>Role</label>
                <p style={styles.fieldValue}>{user?.role || "N/A"}</p>
              </div>
            </div>

            {user?.role === "student" && (
              <>
                <div style={styles.infoField}>
                  <div style={styles.fieldIcon}>
                    <MdSchool size={20} color="#10B981" />
                  </div>
                  <div style={styles.fieldContent}>
                    <label style={styles.fieldLabel}>Department</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        placeholder="Enter department"
                        style={styles.fieldInput}
                      />
                    ) : (
                      <p style={styles.fieldValue}>{form.department || "N/A"}</p>
                    )}
                  </div>
                </div>

                <div style={styles.infoField}>
                  <div style={styles.fieldIcon}>
                    <MdCalendarToday size={20} color="#F59E0B" />
                  </div>
                  <div style={styles.fieldContent}>
                    <label style={styles.fieldLabel}>Year</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        placeholder="Enter year"
                        style={styles.fieldInput}
                      />
                    ) : (
                      <p style={styles.fieldValue}>{form.year || "N/A"}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Information Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Account Information</h3>
            <div style={styles.accountInfo}>
              <div style={styles.accountItem}>
                <MdCalendarToday size={18} color="#71717A" />
                <div>
                  <p style={styles.accountLabel}>Member Since</p>
                  <p style={styles.accountValue}>February 2026</p>
                </div>
              </div>
              <div style={styles.accountItem}>
                <MdLocationOn size={18} color="#71717A" />
                <div>
                  <p style={styles.accountLabel}>Last Login</p>
                  <p style={styles.accountValue}>Today, 10:30 AM</p>
                </div>
              </div>
              <div style={styles.accountItem}>
                <MdCheckCircle size={18} color="#10B981" />
                <div>
                  <p style={styles.accountLabel}>Account Status</p>
                  <p style={{ ...styles.accountValue, color: "#10B981" }}>Active</p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => window.location.href = '/settings'}>
                <MdEdit size={18} color="#667EEA" />
                <span>Change Password</span>
              </button>
              <button style={styles.quickActionBtn} onClick={triggerFileInput}>
                <MdCamera size={18} color="#10B981" />
                <span>Upload Photo</span>
              </button>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "24px",
    borderBottom: "2px solid #1A1A1A",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
    color: "#FFFFFF",
    border: "4px solid #1A1A1A",
  },
  cameraBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#667EEA",
    border: "2px solid #000000",
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  userName: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    backgroundColor: "#667EEA20",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#667EEA",
    width: "fit-content",
  },
  userEmail: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#A1A1AA",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    width: "48px",
    height: "48px",
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
    fontWeight: "600",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "20px",
  },
  infoSection: {
    backgroundColor: "#0F0F0F",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "24px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  infoField: {
    display: "flex",
    gap: "14px",
    padding: "16px",
    backgroundColor: "#1A1A1A",
    borderRadius: "10px",
    border: "1px solid #3A3A3A",
  },
  fieldIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fieldContent: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: "12px",
    color: "#71717A",
    marginBottom: "6px",
    display: "block",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  fieldValue: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: 0,
    wordBreak: "break-word",
    overflowWrap: "break-word",
  },
  fieldInput: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#0F0F0F",
    border: "1px solid #3A3A3A",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
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
  accountInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  accountItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    borderRadius: "8px",
  },
  accountLabel: {
    fontSize: "12px",
    color: "#71717A",
    margin: 0,
    marginBottom: "4px",
  },
  accountValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
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
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
};

export default Profile;
