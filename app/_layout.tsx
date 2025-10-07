import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'

function RouteGuard({ children }: { children: React.ReactNode }) {
  const isAuth = false
  const router = useRouter()
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuth) router.replace('/auth')
    }, 0)
    return () => clearTimeout(timer)
  })
  return <>{children}</>
}

export default function RootLayout() {
  return (
    <RouteGuard>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack>
    </RouteGuard>
  )
}
