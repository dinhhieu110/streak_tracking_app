import { Models } from 'react-native-appwrite'

export interface IHabit extends Models.Document {
  user_id: string
  title: string
  description: string
  frequency: string
  streak_count: number
  last_completed: string
}

export interface IHabitCompletion extends Models.Document {
  user_id: string
  completed_at: string
  habit_id: string
}
