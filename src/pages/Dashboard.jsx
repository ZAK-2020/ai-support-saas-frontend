import { useEffect, useRef, useState } from 'react'
import { Link }          from 'react-router-dom'
import Sidebar           from '../components/Sidebar'
import ChatMessage       from '../components/ChatMessage'
import ChatInput         from '../components/ChatInput'
import { useChat }       from '../context/ChatContext'
import api               from '../services/api'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const TABS = ['Chat', 'Analytics']

export default function Dashboard() {
  const { messages, loading, sendMessage, clearChat } = useChat()
  const [activeTab, setActiveTab]   = useState('Chat')
  const [kbs,       setKbs]         = useState([])
  const [kbId,      setKbId]        = useState('')
  const [analytics, setAnalytics]   = useState(null)
  const [aLoading,  setALoading]    = useState(false)
  const bottomRef                   = useRef(null)

  // load KBs
  useEffect(() => {
    api.get('/knowledgebase').then(({ data }) => {
      setKbs(data.knowledgeBases)
      if (data.knowledgeBases.length > 0) setKbId(data.knowledgeBases[0]._id)
    }).catch(() => {})
  }, [])

  // load analytics when tab switches
  useEffect(() => {
    if (activeTab !== 'Analytics') return
    setALoading(true)
    api.get('/analytics').then(({ data }) => {
      setAnalytics(data)
    }).catch(() => {}).finally(() => setALoading(false))
  }, [activeTab])

  // scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Chat playground and analytics</p>
          </div>
          <div style={styles.headerRight}>
            {/* Tabs */}
            <div style={styles.tabs}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.tabActive : {})
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === 'Chat' && (
              <>
                {kbs.length > 0 && (
                  <select
                    value={kbId}
                    onChange={e => setKbId(e.target.value)}
                    style={styles.select}
                  >
                    {kbs.map(kb => (
                      <option key={kb._id} value={kb._id}>{kb.name}</option>
                    ))}
                  </select>
                )}
                <button onClick={clearChat} style={styles.clearBtn}>Clear</button>
              </>
            )}
          </div>
        </div>

        {/* ── CHAT TAB ── */}
        {activeTab === 'Chat' && (
          <>
            <div style={styles.chatArea}>
              {messages.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>💬</div>
                  <p style={styles.emptyTitle}>Start a conversation</p>
                  <p style={styles.emptyText}>
                    {kbs.length === 0
                      ? 'No knowledge base yet — '
                      : 'Ask anything from your knowledge base'}
                  </p>
                  {kbs.length === 0 && (
                    <Link to="/knowledge-base" style={styles.linkBtn}>
                      Create a knowledge base first →
                    </Link>
                  )}
                  {kbs.length > 0 && (
                    <div style={styles.suggestions}>
                      {['How do I get a refund?', 'What are your plans?', 'How do I contact support?'].map(q => (
                        <button
                          key={q}
                          style={styles.suggestionBtn}
                          onClick={() => sendMessage(q, kbId)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.messages}>
                  {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {loading && (
                    <div style={styles.typing}>
                      <div style={styles.typingDot} />
                      <div style={styles.typingDot} />
                      <div style={styles.typingDot} />
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={(msg) => sendMessage(msg, kbId)} loading={loading} />
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'Analytics' && (
          <div style={styles.analyticsArea}>
            {aLoading ? (
              <div style={styles.aLoading}>Loading analytics...</div>
            ) : analytics ? (
              <>
                {/* Stat cards */}
                <div style={styles.statGrid}>
                  {[
                    { label: 'Total conversations', value: analytics.totals.conversations, color: '#6366f1' },
                    { label: 'Total messages',       value: analytics.totals.messages,      color: '#0ea5e9' },
                    { label: 'This month',           value: analytics.month.conversations,  color: '#10b981' },
                    { label: 'Deflection rate',      value: analytics.totals.deflectionRate + '%', color: '#f59e0b' }
                  ].map(stat => (
                    <div key={stat.label} style={styles.statCard}>
                      <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                      <div style={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div style={styles.chartsRow}>
                  {/* Messages per day */}
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Messages per day (last 30 days)</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analytics.dailyData}>
                        <defs>
                          <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          interval={4}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#1e293b', border: 'none',
                            borderRadius: '8px', color: '#fff', fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="url(#msgGrad)"
                          name="Messages"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Conversations this week */}
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Conversations this week</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#1e293b', border: 'none',
                            borderRadius: '8px', color: '#fff', fontSize: '12px'
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                          name="Conversations"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status breakdown + top questions */}
                <div style={styles.chartsRow}>
                  {/* Status breakdown */}
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Conversation status</div>
                    <div style={styles.statusList}>
                      {[
                        { label: 'Active',    value: analytics.totals.conversations - analytics.totals.resolved - analytics.totals.escalated, color: '#6366f1' },
                        { label: 'Resolved',  value: analytics.totals.resolved,   color: '#10b981' },
                        { label: 'Escalated', value: analytics.totals.escalated,  color: '#f59e0b' }
                      ].map(item => (
                        <div key={item.label} style={styles.statusRow}>
                          <div style={styles.statusLeft}>
                            <div style={{ ...styles.statusDot, background: item.color }} />
                            <span style={styles.statusLabel}>{item.label}</span>
                          </div>
                          <div style={styles.statusRight}>
                            <div style={styles.statusBar}>
                              <div style={{
                                ...styles.statusFill,
                                background: item.color,
                                width: analytics.totals.conversations > 0
                                  ? `${(item.value / analytics.totals.conversations) * 100}%`
                                  : '0%'
                              }} />
                            </div>
                            <span style={styles.statusCount}>{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top questions */}
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Recent questions</div>
                    {analytics.topQuestions.length === 0 ? (
                      <p style={styles.noData}>No questions yet</p>
                    ) : (
                      <div style={styles.questionList}>
                        {analytics.topQuestions.map((q, i) => (
                          <div key={q._id} style={styles.questionRow}>
                            <div style={styles.questionNum}>{i + 1}</div>
                            <div style={styles.questionText}>{q.content}</div>
                            <div style={styles.questionTime}>
                              {new Date(q.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.aLoading}>No analytics data yet — start chatting!</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  page:    { display: 'flex', minHeight: '100vh' },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e2e8f0',
    flexShrink: 0
  },
  title:       { fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  subtitle:    { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  tabs: {
    display: 'flex', background: '#f1f5f9',
    borderRadius: '8px', padding: '3px'
  },
  tab: {
    padding: '6px 16px', border: 'none', background: 'none',
    borderRadius: '6px', fontSize: '13px', fontWeight: '500',
    color: '#64748b', cursor: 'pointer', transition: 'all 0.15s'
  },
  tabActive: { background: '#fff', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  select: {
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    padding: '7px 12px', fontSize: '13px', color: '#1e293b', background: '#fff'
  },
  clearBtn: {
    background: '#f1f5f9', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', padding: '7px 14px',
    fontSize: '13px', color: '#64748b', cursor: 'pointer'
  },
  chatArea:  { flex: 1, overflow: 'auto', padding: '24px 28px' },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '400px', textAlign: 'center'
  },
  emptyIcon:  { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' },
  emptyText:  { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
  linkBtn: {
    color: '#6366f1', textDecoration: 'none',
    fontWeight: '600', fontSize: '14px'
  },
  suggestions:   { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
  suggestionBtn: {
    background: '#f1f5f9', border: '1.5px solid #e2e8f0',
    borderRadius: '20px', padding: '8px 16px',
    fontSize: '13px', color: '#475569', cursor: 'pointer'
  },
  messages:   { display: 'flex', flexDirection: 'column' },
  typing: {
    display: 'flex', gap: '4px', padding: '12px 16px',
    background: '#f1f5f9', borderRadius: '14px',
    width: 'fit-content', marginBottom: '16px'
  },
  typingDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#94a3b8', animation: 'pulse 1s infinite'
  },
  analyticsArea: { flex: 1, overflow: 'auto', padding: '24px 28px' },
  aLoading:      { textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '60px' },
  statGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '20px'
  },
  statCard: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', padding: '20px'
  },
  statValue: { fontSize: '32px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#64748b' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  chartCard: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', padding: '20px'
  },
  chartTitle: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' },
  statusList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  statusRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  statusLeft: { display: 'flex', alignItems: 'center', gap: '8px', width: '80px' },
  statusDot:  { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  statusLabel:{ fontSize: '13px', color: '#475569' },
  statusRight:{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  statusBar:  { flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  statusFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s' },
  statusCount:{ fontSize: '13px', fontWeight: '600', color: '#1e293b', minWidth: '20px', textAlign: 'right' },
  questionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  questionRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', background: '#f8fafc',
    borderRadius: '8px', border: '1px solid #e2e8f0'
  },
  questionNum: {
    background: '#6366f1', color: '#fff', borderRadius: '50%',
    width: '22px', height: '22px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700', flexShrink: 0
  },
  questionText: { flex: 1, fontSize: '13px', color: '#1e293b' },
  questionTime: { fontSize: '11px', color: '#94a3b8', flexShrink: 0 },
  noData:       { fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }
}