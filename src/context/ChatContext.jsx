import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const [messages,  setMessages]  = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loading,   setLoading]   = useState(false)

  const sendMessage = async (message, kbId = null) => {
    // add user message immediately
    const userMsg = { role: 'user', content: message, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { data } = await api.post('/chat', {
        message,
        sessionId,
        kbId
      })

      if (!sessionId) setSessionId(data.sessionId)

      setMessages(prev => [...prev, {
        role:    'assistant',
        content: data.message.content,
        sources: data.message.sources,
        id:      data.message.id
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        id:      Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
  }

  return (
    <ChatContext.Provider value={{ messages, loading, sessionId, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)