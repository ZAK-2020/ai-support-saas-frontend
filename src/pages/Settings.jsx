import { useState, useEffect } from 'react'
import Sidebar     from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import api         from '../services/api'

export default function Settings() {
  const { user }                      = useAuth()
  const [tenant,   setTenant]         = useState(null)
  const [loading,  setLoading]        = useState(false)
  const [saving,   setSaving]         = useState(false)
  const [error,    setError]          = useState('')
  const [success,  setSuccess]        = useState('')
  const [copied,   setCopied]         = useState(false)

  // widget form state
  const [widget, setWidget] = useState({
    botName:        '',
    primaryColor:   '#6366f1',
    welcomeMessage: '',
    position:       'bottom-right'
  })

  // load tenant on mount
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
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.patch('/tenant/widget-settings', widget)
      setTenant(data.tenant)
      setSuccess('Widget settings saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to save widget settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!tenant?._id) return
    navigator.clipboard.writeText(
      `<script src="http://localhost:5000/api/widget/${tenant._id}/widget.js"></script>`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.centered}>Loading...</div>
    </div>
  )

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your account and widget</p>
        </div>

        <div style={styles.content}>

          {/* Alerts */}
          {error   && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          {/* Account info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Account info</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Name</div>
                <div style={styles.infoValue}>{user?.name}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{user?.email}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Plan</div>
                <div style={styles.planBadge}>{tenant?.plan?.toUpperCase() || 'FREE'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Messages used</div>
                <div style={styles.infoValue}>
                  {tenant?.usage?.messagesUsed || 0} / {tenant?.usage?.messagesLimit || 500}
                </div>
              </div>
            </div>
          </div>

          {/* Workspace info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Workspace</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Company name</div>
                <div style={styles.infoValue}>{tenant?.name}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Tenant ID</div>
                <div style={{ ...styles.infoValue, fontFamily: 'monospace', fontSize: '12px', color: '#6366f1' }}>
                  {tenant?._id}
                </div>
              </div>
            </div>
          </div>

          {/* Widget customization */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Widget customization</h2>
            <p style={styles.hintText}>
              Changes here update your live chatbot widget instantly after saving.
            </p>

            <div style={styles.widgetGrid}>
              {/* Form */}
              <div>
                <div style={styles.field}>
                  <label style={styles.label}>Bot name</label>
                  <input
                    value={widget.botName}
                    onChange={e => setWidget(p => ({ ...p, botName: e.target.value }))}
                    placeholder="Support Bot"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Welcome message</label>
                  <input
                    value={widget.welcomeMessage}
                    onChange={e => setWidget(p => ({ ...p, welcomeMessage: e.target.value }))}
                    placeholder="Hi! How can I help you today?"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Primary color</label>
                  <div style={styles.colorRow}>
                    <input
                      type="color"
                      value={widget.primaryColor}
                      onChange={e => setWidget(p => ({ ...p, primaryColor: e.target.value }))}
                      style={styles.colorPicker}
                    />
                    <input
                      value={widget.primaryColor}
                      onChange={e => setWidget(p => ({ ...p, primaryColor: e.target.value }))}
                      placeholder="#6366f1"
                      style={{ ...styles.input, flex: 1 }}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Widget position</label>
                  <div style={styles.positionRow}>
                    {['bottom-right', 'bottom-left'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setWidget(p => ({ ...p, position: pos }))}
                        style={{
                          ...styles.posBtn,
                          ...(widget.position === pos ? styles.posBtnActive : {})
                        }}
                      >
                        {pos === 'bottom-right' ? '↘ Bottom right' : '↙ Bottom left'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleWidgetSave}
                  disabled={saving}
                  style={{ ...styles.primaryBtn, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save widget settings'}
                </button>
              </div>

              {/* Live preview */}
              <div>
                <div style={styles.previewLabel}>Live preview</div>
                <div style={styles.previewBox}>
                  {/* Mini browser chrome */}
                  <div style={styles.browserBar}>
                    <div style={styles.browserDots}>
                      <div style={{ ...styles.dot, background: '#ff5f57' }} />
                      <div style={{ ...styles.dot, background: '#febc2e' }} />
                      <div style={{ ...styles.dot, background: '#28c840' }} />
                    </div>
                    <div style={styles.browserUrl}>yourwebsite.com</div>
                  </div>

                  {/* Page content mock */}
                  <div style={styles.pageMock}>
                    <div style={styles.mockLine} />
                    <div style={{ ...styles.mockLine, width: '70%' }} />
                    <div style={{ ...styles.mockLine, width: '85%' }} />
                    <div style={{ ...styles.mockLine, width: '60%', marginTop: '12px' }} />
                    <div style={{ ...styles.mockLine, width: '80%' }} />

                    {/* Chat window preview */}
                    <div style={styles.chatPreview}>
                      <div style={{
                        ...styles.chatHeader,
                        background: widget.primaryColor
                      }}>
                        <div style={styles.chatHeaderLeft}>
                          <div style={styles.chatAvatar}>AI</div>
                          <div>
                            <div style={styles.chatBotName}>{widget.botName || 'Support Bot'}</div>
                            <div style={styles.chatStatus}>Online</div>
                          </div>
                        </div>
                        <span style={{ color: '#fff', fontSize: '12px' }}>✕</span>
                      </div>
                      <div style={styles.chatBody}>
                        <div style={styles.chatBubble}>
                          {widget.welcomeMessage || 'Hi! How can I help you today?'}
                        </div>
                      </div>
                      <div style={styles.chatInputPreview}>
                        <div style={styles.chatInputBar}>Type a message...</div>
                        <div style={{
                          ...styles.chatSendBtn,
                          background: widget.primaryColor
                        }}>➤</div>
                      </div>
                    </div>

                    {/* Floating button preview */}
                    <div style={{
                      ...styles.floatBtn,
                      background:  widget.primaryColor,
                      [widget.position === 'bottom-left' ? 'left' : 'right']: '10px'
                    }}>
                      ✕
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed snippet */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Embed your chatbot</h2>
            <p style={styles.hintText}>
              Paste this before the closing &lt;/body&gt; tag on any website.
            </p>
            {tenant?._id ? (
              <>
                <div style={styles.codeBlock}>
                  {`<script src="http://localhost:5000/api/widget/${tenant._id}/widget.js"></script>`}
                </div>
                <button onClick={handleCopy} style={{ ...styles.primaryBtn, marginTop: '12px' }}>
                  {copied ? '✅ Copied!' : 'Copy snippet'}
                </button>
              </>
            ) : (
              <div style={styles.hintText}>Loading...</div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

const styles = {
  page:    { display: 'flex', minHeight: '100vh' },
  main:    { flex: 1, overflow: 'auto' },
  centered: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#64748b' },
  header: {
    padding: '20px 28px', background: '#fff',
    borderBottom: '1px solid #e2e8f0'
  },
  title:    { fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  content:  { padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', padding: '24px'
  },
  cardTitle:  { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  infoGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  infoItem:   { display: 'flex', flexDirection: 'column', gap: '4px' },
  infoLabel:  { fontSize: '12px', color: '#64748b', fontWeight: '500' },
  infoValue:  { fontSize: '14px', color: '#1e293b', fontWeight: '500' },
  planBadge: {
    display: 'inline-block', background: '#ede9fe', color: '#6366f1',
    borderRadius: '4px', padding: '2px 8px',
    fontSize: '12px', fontWeight: '700', width: 'fit-content'
  },
  hintText:  { fontSize: '13px', color: '#64748b', marginBottom: '16px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label:     { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: {
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontFamily: 'inherit'
  },
  colorRow:  { display: 'flex', alignItems: 'center', gap: '10px' },
  colorPicker: {
    width: '44px', height: '44px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', padding: '2px', cursor: 'pointer', background: '#fff'
  },
  positionRow: { display: 'flex', gap: '10px' },
  posBtn: {
    flex: 1, padding: '10px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', background: '#f8fafc',
    fontSize: '13px', color: '#64748b', cursor: 'pointer', fontWeight: '500'
  },
  posBtnActive: {
    border: '1.5px solid #6366f1', background: '#ede9fe', color: '#6366f1'
  },
  primaryBtn: {
    background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 20px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: '8px', padding: '10px 16px', fontSize: '14px'
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#16a34a', borderRadius: '8px', padding: '10px 16px', fontSize: '14px'
  },
  widgetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  previewLabel: { fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '10px' },
  previewBox: {
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    overflow: 'hidden', background: '#f8fafc'
  },
  browserBar: {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px'
  },
  browserDots: { display: 'flex', gap: '4px' },
  dot:          { width: '8px', height: '8px', borderRadius: '50%' },
  browserUrl: {
    flex: 1, background: '#f1f5f9', borderRadius: '4px',
    padding: '3px 10px', fontSize: '11px', color: '#64748b', textAlign: 'center'
  },
  pageMock: { padding: '16px', position: 'relative', minHeight: '320px' },
  mockLine: {
    height: '8px', background: '#e2e8f0', borderRadius: '4px',
    marginBottom: '8px', width: '100%'
  },
  chatPreview: {
    position: 'absolute', bottom: '50px', right: '10px',
    width: '200px', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)', background: '#fff',
    border: '1px solid #e2e8f0'
  },
  chatHeader: {
    padding: '8px 10px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between'
  },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: '6px' },
  chatAvatar: {
    background: 'rgba(255,255,255,0.25)', color: '#fff',
    borderRadius: '50%', width: '22px', height: '22px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '8px', fontWeight: '700'
  },
  chatBotName: { color: '#fff', fontSize: '10px', fontWeight: '600' },
  chatStatus:  { color: 'rgba(255,255,255,0.8)', fontSize: '8px' },
  chatBody:    { padding: '8px', background: '#fff' },
  chatBubble: {
    background: '#f1f5f9', borderRadius: '8px',
    padding: '6px 8px', fontSize: '10px', color: '#1e293b', lineHeight: '1.4'
  },
  chatInputPreview: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 8px', borderTop: '1px solid #e2e8f0'
  },
  chatInputBar: {
    flex: 1, background: '#f8fafc', borderRadius: '4px',
    padding: '4px 6px', fontSize: '9px', color: '#94a3b8',
    border: '1px solid #e2e8f0'
  },
  chatSendBtn: {
    color: '#fff', borderRadius: '4px', width: '20px', height: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '9px', flexShrink: 0
  },
  floatBtn: {
    position: 'absolute', bottom: '10px',
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  codeBlock: {
    background: '#1e293b', color: '#a5b4fc', borderRadius: '8px',
    padding: '16px', fontSize: '13px', fontFamily: 'monospace',
    wordBreak: 'break-all', lineHeight: '1.6'
  }
}