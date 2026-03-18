import { NavLink, useNavigate }  from 'react-router-dom'
import { useAuth }               from '../context/AuthContext'
import { useClerk }              from '@clerk/clerk-react'
import { useEffect, useState }   from 'react'
import api                       from '../services/api'

const links = [
  { to: '/dashboard',      label: 'Dashboard',      icon: '▦'  },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { to: '/settings',       label: 'Settings',       icon: '⚙'  }
]

export default function Sidebar() {
  const { user }          = useAuth()
  const { signOut }       = useClerk()
  const navigate          = useNavigate()
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    api.get('/tenant/me').then(({ data }) => {
      setTenant(data.tenant)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/sign-in')
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>AI</div>
        <span style={styles.logoText}>SupportBot</span>
      </div>

      <div style={styles.tenantBox}>
        <div style={styles.tenantName}>{tenant?.name || 'Loading...'}</div>
        <div style={styles.planBadge}>{(tenant?.plan || 'free').toUpperCase()}</div>
      </div>

      <nav style={styles.nav}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.navIcon}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.usageBox}>
        <div style={styles.usageHeader}>
          <span style={styles.usageLabel}>Messages used</span>
          <span style={styles.usageCount}>
            {tenant?.usage?.messagesUsed || 0} / {tenant?.usage?.messagesLimit || 500}
          </span>
        </div>
        <div style={styles.usageTrack}>
          <div style={{
            ...styles.usageFill,
            width: `${Math.min(
              ((tenant?.usage?.messagesUsed || 0) / (tenant?.usage?.messagesLimit || 500)) * 100,
              100
            )}%`
          }} />
        </div>
      </div>

      <div style={styles.userBox}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userEmail}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          ⇥
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '240px', minHeight: '100vh',
    background: '#1e1b4b', display: 'flex',
    flexDirection: 'column', padding: '24px 16px', flexShrink: 0
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '8px' },
  logoIcon: {
    background: '#6366f1', color: '#fff', borderRadius: '8px',
    width: '34px', height: '34px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px'
  },
  logoText:   { color: '#fff', fontWeight: '700', fontSize: '17px' },
  tenantBox: {
    background: 'rgba(255,255,255,0.07)', borderRadius: '10px',
    padding: '10px 12px', marginBottom: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  tenantName: { color: '#e2e8f0', fontSize: '13px', fontWeight: '500' },
  planBadge: {
    background: '#6366f1', color: '#fff', borderRadius: '4px',
    padding: '2px 6px', fontSize: '10px', fontWeight: '700'
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px',
    color: '#94a3b8', textDecoration: 'none',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.15s'
  },
  navLinkActive: { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' },
  navIcon:       { fontSize: '16px', width: '20px' },
  usageBox: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
    padding: '12px', marginBottom: '16px'
  },
  usageHeader:   { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  usageLabel:    { color: '#94a3b8', fontSize: '11px' },
  usageCount:    { color: '#e2e8f0', fontSize: '11px', fontWeight: '600' },
  usageTrack:    { background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '4px', overflow: 'hidden' },
  usageFill:     { background: '#6366f1', height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  userBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '16px', marginTop: '8px'
  },
  avatar: {
    background: '#6366f1', color: '#fff', borderRadius: '50%',
    width: '32px', height: '32px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '13px', flexShrink: 0
  },
  userInfo:  { flex: 1, overflow: 'hidden' },
  userName:  { color: '#e2e8f0', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '18px', padding: '4px', cursor: 'pointer' }
}