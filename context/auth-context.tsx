import { account } from '@/lib/appwrite'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { ID, Models } from 'react-native-appwrite'

type AuthContextType = {
  user: Models.User<Models.Preferences> | null
  isLoadingUser: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true)
  const getUser = async () => {
    try {
      setIsLoadingUser(true)
      const session = await account.get()
      if (session) setUser(session)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoadingUser(false)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password)
      await signIn(email, password)
      return null
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      } else {
        return 'An unknown error occurred'
      }
    }
  }
  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      const session = await account.get()
      if (session) setUser(session)
      return null
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      } else {
        return 'An unknown error occurred'
      }
    }
  }
  const signOut = async () => {
    try {
      await account.deleteSession('current')
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoadingUser,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
