import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api     from '../services/api'

export default function KnowledgeBase() {
  const [kbs,          setKbs]          = useState([])
  const [selected,     setSelected]     = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [view,         setView]         = useState('list')
  const [newKbName,    setNewKbName]    = useState('')
  const [newKbDesc,    setNewKbDesc]    = useState('')
  const [docContent,   setDocContent]   = useState('')
  const [docName,      setDocName]      = useState('')
  const [urlInput,     setUrlInput]     = useState('')
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [dragOver,     setDragOver]     = useState(false)
  const [pdfUploading, setPdfUploading] = useState(false)

  const loadKbs = async () => {
    try {
      const { data } = await api.get('/knowledgebase')
      setKbs(data.knowledgeBases)
    } catch {
      setError('Failed to load knowledge bases')
    }
  }

  useEffect(() => { loadKbs() }, [])

  const handleCreateKb = async () => {
    if (!newKbName.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/knowledgebase', {
        name:        newKbName,
        description: newKbDesc
      })
      setKbs(prev => [data.knowledgeBase, ...prev])
      setNewKbName('')
      setNewKbDesc('')
      setView('list')
      setSuccess('Knowledge base created!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to create knowledge base')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDoc = async () => {
    if (!docContent.trim()) { setError('Please enter some text content first'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post(`/knowledgebase/${selected._id}/documents`, {
        fileName: docName || 'manual-entry',
        content:  docContent
      })
      setSelected(data.knowledgeBase)
      setKbs(prev => prev.map(k => k._id === data.knowledgeBase._id ? data.knowledgeBase : k))
      setDocContent('')
      setDocName('')
      setSuccess('Document added successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to add document')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) { setError('URL is required'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post(`/knowledgebase/${selected._id}/url`, {
        url: urlInput
      })
      setSelected(data.knowledgeBase)
      setKbs(prev => prev.map(k => k._id === data.knowledgeBase._id ? data.knowledgeBase : k))
      setUrlInput('')
      setSuccess('URL added!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to add URL')
    } finally {
      setLoading(false)
    }
  }

  const handlePDFUpload = async (file) => {
    setError('')
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }

    setPdfUploading(true)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const token    = await window.Clerk?.session?.getToken()
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/knowledgebase/${selected._id}/pdf`,
        {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` },
          body:    formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload PDF')
        return
      }

      setSelected(data.knowledgeBase)
      setKbs(prev => prev.map(k =>
        k._id === data.knowledgeBase._id ? data.knowledgeBase : k
      ))
      setDocContent('')
      setDocName('')
      setError('')
      setSuccess(`PDF processed! ${data.chunksCreated} chunks created from ${data.pages} pages.`)
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to upload PDF')
    } finally {
      setPdfUploading(false)
      setDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePDFUpload(file)
  }

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try {
      const { data } = await api.delete(`/knowledgebase/${selected._id}/documents/${docId}`)
      setSelected(data.knowledgeBase)
      setKbs(prev => prev.map(k => k._id === data.knowledgeBase._id ? data.knowledgeBase : k))
      setSuccess('Document deleted')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to delete document')
    }
  }

  const handleDeleteKb = async (id) => {
    if (!window.confirm('Delete this knowledge base?')) return
    try {
      await api.delete(`/knowledgebase/${id}`)
      setKbs(prev => prev.filter(k => k._id !== id))
      if (selected?._id === id) { setSelected(null); setView('list') }
      setSuccess('Knowledge base deleted')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to delete')
    }
  }

  const openDetail = (kb) => { setSelected(kb); setView('detail'); setError('') }

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Knowledge Base</h1>
            <p style={styles.subtitle}>Manage documents your chatbot learns from</p>
          </div>
          {view !== 'create' && (
            <button onClick={() => { setView('create'); setError('') }} style={styles.primaryBtn}>
              + New Knowledge Base
            </button>
          )}
        </div>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div style={styles.content}>
            {kbs.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>📚</div>
                <p style={styles.emptyTitle}>No knowledge bases yet</p>
                <p style={styles.emptyText}>Create one and add documents for your chatbot</p>
                <button onClick={() => setView('create')} style={styles.primaryBtn}>
                  Create your first knowledge base
                </button>
              </div>
            ) : (
              <div style={styles.grid}>
                {kbs.map(kb => (
                  <div key={kb._id} style={styles.kbCard}>
                    <div style={styles.kbCardTop}>
                      <div style={styles.kbIcon}>📚</div>
                      <div style={styles.kbInfo}>
                        <div style={styles.kbName}>{kb.name}</div>
                        {kb.description && (
                          <div style={styles.kbDesc}>{kb.description}</div>
                        )}
                      </div>
                    </div>
                    <div style={styles.kbStats}>
                      <span style={styles.kbStat}>{kb.documents.length} documents</span>
                      <span style={styles.kbStat}>{kb.totalChunks} chunks</span>
                    </div>
                    <div style={styles.kbActions}>
                      <button onClick={() => openDetail(kb)} style={styles.secondaryBtn}>
                        Manage
                      </button>
                      <button onClick={() => handleDeleteKb(kb._id)} style={styles.dangerBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE VIEW ── */}
        {view === 'create' && (
          <div style={styles.content}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>New Knowledge Base</h2>
              <div style={styles.field}>
                <label style={styles.label}>Name *</label>
                <input
                  value={newKbName}
                  onChange={e => { setNewKbName(e.target.value); setError('') }}
                  placeholder="e.g. Product FAQ"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <input
                  value={newKbDesc}
                  onChange={e => setNewKbDesc(e.target.value)}
                  placeholder="Optional description"
                  style={styles.input}
                />
              </div>
              <div style={styles.formActions}>
                <button
                  onClick={() => { setView('list'); setError('') }}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKb}
                  disabled={loading}
                  style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === 'detail' && selected && (
          <div style={styles.content}>
            <div style={styles.detailHeader}>
              <button onClick={() => setView('list')} style={styles.backBtn}>
                ← Back
              </button>
              <div>
                <h2 style={styles.detailTitle}>{selected.name}</h2>
                <span style={styles.kbStat}>
                  {selected.documents.length} documents · {selected.totalChunks} chunks
                </span>
              </div>
            </div>

            <div style={styles.detailGrid}>
              {/* Add text document + PDF upload */}
              <div style={styles.formCard}>
                <h3 style={styles.sectionTitle}>Add text document</h3>

                <div style={styles.field}>
                  <label style={styles.label}>File name</label>
                  <input
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    placeholder="e.g. faq.txt"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Content</label>
                  <textarea
                    value={docContent}
                    onChange={e => { setDocContent(e.target.value); setError('') }}
                    placeholder="Paste your support content here..."
                    rows={5}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>

                <button
                  onClick={handleAddDoc}
                  disabled={loading || !docContent.trim()}
                  style={{
                    ...styles.primaryBtn,
                    opacity: (loading || !docContent.trim()) ? 0.4 : 1,
                    cursor:  !docContent.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Adding...' : 'Add document'}
                </button>

                {/* Divider */}
                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or upload PDF</span>
                  <div style={styles.dividerLine} />
                </div>

                {/* PDF drop zone */}
                <div
                  style={{
                    ...styles.dropZone,
                    ...(dragOver ? styles.dropZoneActive : {})
                  }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    setError('')
                    document.getElementById('pdf-input').click()
                  }}
                >
                  <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      setError('')
                      handlePDFUpload(e.target.files[0])
                      e.target.value = ''
                    }}
                  />
                  {pdfUploading ? (
                    <div style={styles.dropZoneContent}>
                      <div style={styles.uploadSpinner} />
                      <p style={styles.dropText}>Processing PDF...</p>
                      <p style={styles.dropSubText}>Extracting text and creating chunks</p>
                    </div>
                  ) : (
                    <div style={styles.dropZoneContent}>
                      <div style={styles.uploadIcon}>📄</div>
                      <p style={styles.dropText}>
                        Drop PDF here or{' '}
                        <span style={{ color: '#6366f1', fontWeight: '600' }}>browse</span>
                      </p>
                      <p style={styles.dropSubText}>Max 10MB · Text-based PDFs only</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add URL */}
              <div style={styles.formCard}>
                <h3 style={styles.sectionTitle}>Add URL source</h3>
                <p style={styles.hintText}>
                  Add a webpage URL — it will be queued for processing.
                </p>
                <div style={styles.field}>
                  <label style={styles.label}>URL</label>
                  <input
                    value={urlInput}
                    onChange={e => { setUrlInput(e.target.value); setError('') }}
                    placeholder="https://yoursite.com/faq"
                    style={styles.input}
                  />
                </div>
                <button
                  onClick={handleAddUrl}
                  disabled={loading}
                  style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Adding...' : 'Add URL'}
                </button>
              </div>
            </div>

            {/* Documents list */}
            <div style={styles.formCard}>
              <h3 style={styles.sectionTitle}>
                Documents ({selected.documents.length})
              </h3>
              {selected.documents.length === 0 ? (
                <p style={styles.hintText}>No documents yet. Add one above.</p>
              ) : (
                <div style={styles.docList}>
                  {selected.documents.map(doc => (
                    <div key={doc._id} style={styles.docRow}>
                      <div style={styles.docIcon}>
                        {doc.fileType === 'url' ? '🔗' :
                         doc.fileType === 'pdf' ? '📕' : '📄'}
                      </div>
                      <div style={styles.docInfo}>
                        <div style={styles.docName}>{doc.fileName}</div>
                        <div style={styles.docMeta}>
                          {doc.fileType} · {doc.chunks} chunks ·{' '}
                          {doc.isProcessed ? (
                            <span style={{ color: '#16a34a' }}>processed</span>
                          ) : (
                            <span style={{ color: '#d97706' }}>pending</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        style={styles.deleteDocBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  page:        { display: 'flex', minHeight: '100vh' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 28px', background: '#fff', borderBottom: '1px solid #e2e8f0'
  },
  title:    { fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  content:  { padding: '28px', flex: 1 },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px', margin: '0 28px'
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px', margin: '0 28px'
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '400px', textAlign: 'center'
  },
  emptyIcon:  { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  emptyText:  { fontSize: '14px', color: '#64748b', marginBottom: '24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  kbCard: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', padding: '20px'
  },
  kbCardTop:  { display: 'flex', gap: '12px', marginBottom: '14px' },
  kbIcon:     { fontSize: '28px' },
  kbInfo:     { flex: 1 },
  kbName:     { fontWeight: '600', fontSize: '15px', color: '#1e293b' },
  kbDesc:     { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  kbStats:    { display: 'flex', gap: '12px', marginBottom: '16px' },
  kbStat: {
    fontSize: '12px', color: '#64748b', background: '#f1f5f9',
    padding: '3px 8px', borderRadius: '4px'
  },
  kbActions:  { display: 'flex', gap: '8px' },
  primaryBtn: {
    background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 18px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  secondaryBtn: {
    background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', padding: '8px 16px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer'
  },
  dangerBtn: {
    background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca',
    borderRadius: '8px', padding: '8px 16px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer'
  },
  formCard: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '20px'
  },
  formTitle:    { fontSize: '17px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  formActions:  { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  field:        { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label:        { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: {
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontFamily: 'inherit'
  },
  hintText:     { fontSize: '13px', color: '#64748b', marginBottom: '16px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  backBtn: {
    background: 'none', border: 'none', color: '#6366f1',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: '4px 0'
  },
  detailTitle:  { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  detailGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  docList:      { display: 'flex', flexDirection: 'column', gap: '10px' },
  docRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', background: '#f8fafc',
    borderRadius: '8px', border: '1px solid #e2e8f0'
  },
  docIcon:      { fontSize: '20px' },
  docInfo:      { flex: 1 },
  docName:      { fontSize: '14px', fontWeight: '500', color: '#1e293b' },
  docMeta:      { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  deleteDocBtn: {
    background: 'none', border: 'none', color: '#94a3b8',
    fontSize: '16px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px'
  },
  divider: {
    display: 'flex', alignItems: 'center',
    gap: '12px', margin: '20px 0'
  },
  dividerLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  dividerText: { fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' },
  dropZone: {
    border: '2px dashed #e2e8f0', borderRadius: '10px',
    padding: '28px 20px', textAlign: 'center',
    cursor: 'pointer', transition: 'all 0.2s', background: '#fafafa'
  },
  dropZoneActive: { border: '2px dashed #6366f1', background: '#f5f3ff' },
  dropZoneContent: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px'
  },
  uploadIcon:    { fontSize: '32px' },
  dropText:      { fontSize: '14px', color: '#475569', margin: 0 },
  dropSubText:   { fontSize: '12px', color: '#94a3b8', margin: 0 },
  uploadSpinner: {
    width: '28px', height: '28px',
    border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite'
  }
}