import { createContext, useContext } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const { user, isLoaded } = useUser()
  const { signOut }        = useClerkAuth()

  return {
    user: user ? {
      id:    user.id,
      name:  user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress,
      email: user.emailAddresses[0]?.emailAddress,
      role:  'owner'
    } : null,
    isLoaded,
    logout: () => signOut()
  }
}