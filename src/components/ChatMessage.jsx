export default function ChatMessage({ message }) {
    const isUser = message.role === 'user'
  
    return (
      <div style={{ ...styles.wrapper, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && <div style={styles.botAvatar}>AI</div>}
  
        <div style={{
          ...styles.bubble,
          ...(isUser ? styles.userBubble : styles.botBubble)
        }}>
          <p style={styles.text}>{message.content}</p>
  
          {/* sources */}
          {message.sources?.length > 0 && (
            <div style={styles.sources}>
              {message.sources.map((s, i) => (
                <span key={i} style={styles.sourceTag}>
                  📄 {s.fileName}
                </span>
              ))}
            </div>
          )}
        </div>
  
        {isUser && <div style={styles.userAvatar}>You</div>}
      </div>
    )
  }
  
  const styles = {
    wrapper: {
      display:    'flex',
      alignItems: 'flex-end',
      gap:        '8px',
      marginBottom: '16px'
    },
    botAvatar: {
      background:     '#6366f1',
      color:          '#fff',
      borderRadius:   '50%',
      width:          '30px',
      height:         '30px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       '10px',
      fontWeight:     '700',
      flexShrink:     0
    },
    userAvatar: {
      background:     '#e2e8f0',
      color:          '#64748b',
      borderRadius:   '50%',
      width:          '30px',
      height:         '30px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       '10px',
      fontWeight:     '700',
      flexShrink:     0
    },
    bubble: {
      maxWidth:     '70%',
      borderRadius: '14px',
      padding:      '12px 16px'
    },
    userBubble: {
      background:         '#6366f1',
      color:              '#fff',
      borderBottomRightRadius: '4px'
    },
    botBubble: {
      background:          '#f1f5f9',
      color:               '#1e293b',
      borderBottomLeftRadius: '4px'
    },
    text: {
      fontSize:   '14px',
      lineHeight: '1.5'
    },
    sources: {
      display:   'flex',
      gap:       '6px',
      flexWrap:  'wrap',
      marginTop: '8px'
    },
    sourceTag: {
      background:   'rgba(0,0,0,0.08)',
      borderRadius: '4px',
      padding:      '2px 8px',
      fontSize:     '11px'
    }
  }