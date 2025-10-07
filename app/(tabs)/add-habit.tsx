import { useAuth } from '@/context/auth-context'
import { DATABASE_ID, databases, HABITS_TABLE_ID } from '@/lib/appwrite'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ID } from 'react-native-appwrite'
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper'

const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const
type TFrequency = (typeof FREQUENCIES)[number]
const AddHabitScreen = () => {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [frequency, setFrequency] = useState<TFrequency>('daily')
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const theme = useTheme()

  const handleAddNewHabit = async () => {
    if (!user) return
    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_TABLE_ID,
        ID.unique(),
        {
          title,
          description,
          frequency,
          user_id: user.$id,
          streak_count: 0,
          last_completed: new Date().toISOString(),
        }
      )
      router.back()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }
  return (
    <View style={styles.container}>
      <TextInput
        label='Title'
        mode='outlined'
        style={styles.input}
        onChangeText={setTitle}
      />
      <TextInput
        label='Description'
        mode='outlined'
        style={styles.input}
        onChangeText={setDescription}
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          buttons={FREQUENCIES.map((freq) => ({
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
            value: freq,
          }))}
          onValueChange={(value) => setFrequency(value as TFrequency)}
        />
      </View>
      <Button
        mode='contained'
        onPress={handleAddNewHabit}
        disabled={!title || !description}
      >
        Add Habit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  )
}

export default AddHabitScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
})
