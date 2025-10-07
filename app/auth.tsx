import { useAuth } from '@/context/auth-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import { Button, Text, TextInput, useTheme } from 'react-native-paper'

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSwitchMode = async () => setIsSignUp((prev) => !prev)
  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    setError(null)
    if (isSignUp) {
      const errorMsg = await signUp(email, password)
      if (errorMsg) {
        setError(errorMsg)
        return
      }
    } else {
      const errorMsg = await signIn(email, password)
      if (errorMsg) {
        setError(errorMsg)
        return
      }
      router.replace('/')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant='headlineMedium'>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <TextInput
          style={styles.input}
          label='Email'
          placeholder='example@gmail.com'
          autoCapitalize='none'
          keyboardType='email-address'
          mode='outlined'
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          label='Password'
          autoCapitalize='none'
          secureTextEntry
          mode='outlined'
          onChangeText={setPassword}
        />
        {error ? (
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        ) : null}
        <Button style={styles.button} mode='contained' onPress={handleAuth}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
        <Button
          style={styles.switchModeBtn}
          mode='text'
          onPress={handleSwitchMode}
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchModeBtn: {
    marginTop: 16,
  },
})
