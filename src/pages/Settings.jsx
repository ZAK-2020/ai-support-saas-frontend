import { useState, useEffect } from 'react'
import Sidebar           from '../components/Sidebar'
import { useAuth }       from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import api               from '../services/api'

export default function Settings() {
  const { user }               = useAuth()
  const { isMobile }           = useWindowSize()
  const [tenant,  setTenant]   = useState(null)
  const [loading, setLoading]  = useState(false)
  const [saving,  setSaving]   = useState(false)
  const [error,   setError]    = useState('')
  const [success, setSuccess]  = useState('')
  const [copied,  setCopied]   = useState(false)

  const [widget, setWidget] = useState({
    botName:        '',
    primaryColor:   '#6366f1',
    welcomeMessage: '',
    position:       'bottom-right'
  })

  useEffect(() => {
    setLoading(true)
    api.get('/tenant/me')
      .then(({ data }) => {
        setTenant(data.tenant)
        setWidget({
          botName:        data.tenant.widgetSettings?.botName        || 'Support Bot',
          primaryColor:   data.tenant.widgetSettings?.primaryColor   || '#6366f1',
          welcomeMessage: data.tenant.widgetSettings?.welcomeMessage || 'Hi! How can I help you?',
          position:       data.tenant.widgetSettings?.position       || 'bottom-right'
        })
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleWidgetSave = async () => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const { data } = await api.patch('/tenant/widget-settings', widget)
      setTenant(data.tenant)
      setSuccess('Widget settings saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch { setError('Failed to save widget settings') }
    finally   { setSaving(false) }
  }

  const handleCopy = () => {
    if (!tenant?._id) return
    navigator.clipboard.writeText(
      `<script src="${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/widget/${tenant._id}/widget.js"></script>`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#64748b' }}>
        Loading...
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: isMobile ? '12px 16px' : '20px 28px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: '#1e293b' }}>Settings</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Manage your account and widget</p>
        </div>

        <div style={{ padding: isMobile ? '16px' : '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error   && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          {/* Account info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Account info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Name',    value: user?.name },
                { label: 'Email',   value: user?.email },
                { label: 'Role',    value: user?.role },
                { label: 'Plan',    value: tenant?.plan?.toUpperCase() }
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Workspace</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Company name</div>
                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{tenant?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Tenant ID</div>
                <div style={{ fontSize: '12px', color: '#6366f1', fontFamily: 'monospace', wordBreak: 'break-all' }}>{tenant?._id}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Messages used</div>
                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{tenant?.usage?.messagesUsed} / {tenant?.usage?.messagesLimit}</div>
              </div>
            </div>
          </div>

          {/* Widget customization */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Widget customization</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Changes here update your live chatbot widget after saving.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
              {/* Form */}
              <div>
                <div style={styles.field}>
                  <label style={styles.label}>Bot name</label>
                  <input value={widget.botName} onChange={e => setWidget(p => ({ ...p, botName: e.target.value }))} placeholder="Support Bot" style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Welcome message</label>
                  <input value={widget.welcomeMessage} onChange={e => setWidget(p => ({ ...p, welcomeMessage: e.target.value }))} placeholder="Hi! How can I help you today?" style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Primary color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="color" value={widget.primaryColor} onChange={e => setWidget(p => ({ ...p, primaryColor: e.target.value }))} style={{ width: '44px', height: '44px', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '2px', cursor: 'pointer' }} />
                    <input value={widget.primaryColor} onChange={e => setWidget(p => ({ ...p, primaryColor: e.target.value }))} placeholder="#6366f1" style={{ ...styles.input, flex: 1 }} />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Widget position</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['bottom-right', 'bottom-left'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setWidget(p => ({ ...p, position: pos }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                          border:      widget.position === pos ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
                          background:  widget.position === pos ? '#ede9fe' : '#f8fafc',
                          color:       widget.position === pos ? '#6366f1' : '#64748b'
                        }}
                      >
                        {pos === 'bottom-right' ? '↘ Bottom right' : '↙ Bottom left'}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleWidgetSave} disabled={saving} style={{ ...styles.primaryBtn, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save widget settings'}
                </button>
              </div>

              {/* Preview */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Live preview</div>
                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                  <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />)}
                    </div>
                    <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', padding: '3px 10px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>yourwebsite.com</div>
                  </div>
                  <div style={{ padding: '16px', position: 'relative', minHeight: '280px' }}>
                    {[100, 70, 85, 60].map((w, i) => (
                      <div key={i} style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', width: `${w}%` }} />
                    ))}
                    <div style={{ position: 'absolute', bottom: '44px', right: '10px', width: '190px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', background: '#fff', border: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '8px 10px', background: widget.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '700' }}>AI</div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>{widget.botName || 'Support Bot'}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8px' }}>Online</div>
                          </div>
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px' }}>✕</span>
                      </div>
                      <div style={{ padding: '8px', background: '#fff' }}>
                        <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '6px 8px', fontSize: '10px', color: '#1e293b', lineHeight: '1.4' }}>
                          {widget.welcomeMessage || 'Hi! How can I help you today?'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ flex: 1, background: '#f8fafc', borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: '#94a3b8', border: '1px solid #e2e8f0' }}>Type a message...</div>
                        <div style={{ background: widget.primaryColor, color: '#fff', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>➤</div>
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '10px', width: '28px', height: '28px',
                      borderRadius: '50%', background: widget.primaryColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      [widget.position === 'bottom-left' ? 'left' : 'right']: '10px'
                    }}>✕</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed snippet */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Embed your chatbot</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Paste this before the closing &lt;/body&gt; tag on any website.
            </p>
            {tenant?._id ? (
              <>
                <div style={styles.codeBlock}>
                  {`<script src="${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/widget/${tenant._id}/widget.js"></script>`}
                </div>
                <button onClick={handleCopy} style={{ ...styles.primaryBtn, marginTop: '12px' }}>
                  {copied ? '✅ Copied!' : 'Copy snippet'}
                </button>
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#64748b' }}>Loading...</div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

const styles = {
  card:       { background: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '24px' },
  cardTitle:  { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label:      { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:      { border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontFamily: 'inherit' },
  primaryBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error:      { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', fontSize: '14px' },
  successBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', padding: '10px 14px', fontSize: '14px' },
  codeBlock:  { background: '#1e293b', color: '#a5b4fc', borderRadius: '8px', padding: '16px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.6' }
}