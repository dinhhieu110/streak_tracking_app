import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

import { Button, Text, TextInput } from 'react-native-paper'

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  const handleSwitchMode = async () => setIsSignUp((prev) => !prev)
  const handleAuth = () => {}

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
        />
        <TextInput
          style={styles.input}
          label='Password'
          autoCapitalize='none'
          mode='outlined'
        />
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
