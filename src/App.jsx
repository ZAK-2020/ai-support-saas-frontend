import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import Dashboard     from './pages/Dashboard'
import KnowledgeBase from './pages/KnowledgeBase'
import Settings      from './pages/Settings'

const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()

  // wait for Clerk to finish loading before making any decision
  if (!isLoaded) return (
    <div style={loadingStyle}>
      <div style={spinnerStyle} />
    </div>
  )

  if (!isSignedIn) return <Navigate to="/sign-in" replace />

  return children
}

const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()

  // wait for Clerk to finish loading before making any decision
  if (!isLoaded) return (
    <div style={loadingStyle}>
      <div style={spinnerStyle} />
    </div>
  )

  // if already signed in, go to dashboard
  if (isSignedIn) return <Navigate to="/dashboard" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/sign-in/*" element={
        <PublicRoute>
          <div style={authPage}>
            <SignIn
              routing="path"
              path="/sign-in"
              afterSignInUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          </div>
        </PublicRoute>
      } />

      <Route path="/sign-up/*" element={
        <PublicRoute>
          <div style={authPage}>
            <SignUp
              routing="path"
              path="/sign-up"
              afterSignUpUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          </div>
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />

      <Route path="/knowledge-base" element={
        <PrivateRoute><KnowledgeBase /></PrivateRoute>
      } />

      <Route path="/settings" element={
        <PrivateRoute><Settings /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const authPage = {
  minHeight:      '100vh',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  background:     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

const loadingStyle = {
  minHeight:       '100vh',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  background:      '#f8fafc'
}

const spinnerStyle = {
  width:        '40px',
  height:       '40px',
  border:       '3px solid #e2e8f0',
  borderTop:    '3px solid #6366f1',
  borderRadius: '50%',
  animation:    'spin 0.8s linear infinite'
}