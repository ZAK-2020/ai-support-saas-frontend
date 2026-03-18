import { useState }        from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }         from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate           = useNavigate()

  const [form,  setForm]  = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>AI</div>
          <span style={styles.logoText}>SupportBot</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight:       '100vh',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    background:      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding:         '20px'
  },
  card: {
    background:   '#fff',
    borderRadius: '16px',
    padding:      '40px',
    width:        '100%',
    maxWidth:     '420px',
    boxShadow:    '0 20px 60px rgba(0,0,0,0.15)'
  },
  logo: {
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    marginBottom:   '28px'
  },
  logoIcon: {
    background:   '#6366f1',
    color:        '#fff',
    borderRadius: '10px',
    width:        '40px',
    height:       '40px',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontWeight:   '700',
    fontSize:     '14px'
  },
  logoText: {
    fontWeight: '700',
    fontSize:   '20px',
    color:      '#1e293b'
  },
  title: {
    fontSize:     '24px',
    fontWeight:   '700',
    color:        '#1e293b',
    marginBottom: '6px'
  },
  subtitle: {
    fontSize:     '14px',
    color:        '#64748b',
    marginBottom: '28px'
  },
  error: {
    background:   '#fef2f2',
    border:       '1px solid #fecaca',
    color:        '#dc2626',
    borderRadius: '8px',
    padding:      '10px 14px',
    fontSize:     '14px',
    marginBottom: '20px'
  },
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '18px'
  },
  field: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px'
  },
  label: {
    fontSize:   '13px',
    fontWeight: '500',
    color:      '#374151'
  },
  input: {
    border:       '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding:      '10px 14px',
    fontSize:     '14px',
    color:        '#1e293b',
    transition:   'border-color 0.2s'
  },
  button: {
    background:   '#6366f1',
    color:        '#fff',
    border:       'none',
    borderRadius: '8px',
    padding:      '12px',
    fontSize:     '15px',
    fontWeight:   '600',
    marginTop:    '6px',
    transition:   'background 0.2s'
  },
  footer: {
    textAlign:  'center',
    fontSize:   '14px',
    color:      '#64748b',
    marginTop:  '24px'
  },
  link: {
    color:          '#6366f1',
    textDecoration: 'none',
    fontWeight:     '500'
  }
}