import { AuthProvider, useAuth } from '@/context/auth-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoadingUser } = useAuth()
  const router = useRouter()
  // Check where user is in the app
  const segments = useSegments()

  useEffect(() => {
    const inAuthPage = segments[0] === 'auth'
    const timer = setTimeout(() => {
      if (!user && !inAuthPage && !isLoadingUser) {
        router.replace('/auth')
      } else if (user && inAuthPage && !isLoadingUser) {
        router.replace('/')
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [user, segments])
  return <>{children}</>
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  )
}
