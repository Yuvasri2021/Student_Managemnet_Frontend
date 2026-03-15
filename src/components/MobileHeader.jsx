import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { MdMenu, MdSchool } from 'react-icons/md';

const MobileHeader = () => {
  const { user } = useContext(AuthContext);
  const { toggleSidebar, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <div style={styles.mobileHeader}>
      <button style={styles.menuBtn} onClick={toggleSidebar}>
        <MdMenu size={24} />
      </button>
      <div style={styles.headerContent}>
        <MdSchool size={24} color="#667EEA" />
        <span style={styles.headerTitle}>Activity Portal</span>
      </div>
      <div style={styles.userBadge}>
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  );
};

const styles = {
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'rgba(5, 5, 5, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--glass-border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '16px',
    zIndex: 998,
  },
  menuBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  headerContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '0.5px',
  },
  userBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FFFFFF',
    boxShadow: '0 4px 10px var(--accent-glow)',
  },
};

export default MobileHeader;
