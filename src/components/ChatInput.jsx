import { useState } from 'react'

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim() || loading) return
    onSend(text.trim())
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.wrapper}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type your message... (Enter to send)"
        disabled={loading}
        rows={1}
        style={styles.input}
      />
      <button
        onClick={handleSend}
        disabled={loading || !text.trim()}
        style={{
          ...styles.btn,
          opacity: (loading || !text.trim()) ? 0.5 : 1
        }}
      >
        {loading ? '...' : '➤'}
      </button>
    </div>
  )
}

const styles = {
  wrapper: {
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    padding:      '16px 20px',
    background:   '#fff',
    borderTop:    '1px solid #e2e8f0'
  },
  input: {
    flex:         1,
    border:       '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding:      '10px 14px',
    fontSize:     '14px',
    resize:       'none',
    fontFamily:   'inherit',
    color:        '#1e293b',
    lineHeight:   '1.4'
  },
  btn: {
    background:     '#6366f1',
    color:          '#fff',
    border:         'none',
    borderRadius:   '10px',
    width:          '42px',
    height:         '42px',
    fontSize:       '18px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    transition:     'opacity 0.2s'
  }
}