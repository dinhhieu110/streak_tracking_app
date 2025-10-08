import { useAuth } from '@/context/auth-context'
import {
  DATABASE_ID,
  databases,
  HABIT_COMPLETION_TABLE_ID,
  HABITS_TABLE_ID,
} from '@/lib/appwrite'
import { IHabit, IHabitCompletion } from '@/types/database.type'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { Query } from 'react-native-appwrite'

interface IStreakData {
  streak: number
  bestStreak: number
  total: number
}

const StreaksScreen = () => {
  const [habits, setHabits] = useState<IHabit[]>([])
  const [completedHabits, setCompletedHabits] = useState<IHabitCompletion[]>([])
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    fetchHabits()
    fetchCompletedHabits()
  }, [user])

  const fetchHabits = async () => {
    try {
      const res = await databases.listDocuments<IHabit>(
        DATABASE_ID,
        HABITS_TABLE_ID,
        [Query.equal('user_id', user?.$id || '')]
      )
      setHabits(res.documents as IHabit[])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCompletedHabits = async () => {
    try {
      const res = await databases.listDocuments<IHabitCompletion>(
        DATABASE_ID,
        HABIT_COMPLETION_TABLE_ID,
        [Query.equal('user_id', user?.$id || '')]
      )
      setCompletedHabits(res.documents as IHabitCompletion[])
    } catch (error) {
      console.error(error)
    }
  }

  const getStreakData = (habitId: string): IStreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      )
    if (habitCompletions?.length === 0) {
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      }
    }

    let streak = 0
    let bestStreak = 0
    let total = habitCompletions.length
    let lastDate: Date | null = null
    let currentStreak = 0

    habitCompletions.forEach((c) => {
      const date = new Date(c.completed_at)
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        if (diff <= 1.5) {
          currentStreak += 1
        } else {
          currentStreak = 1
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak
        streak = currentStreak
        lastDate = date
      }
    })

    return {
      streak,
      bestStreak,
      total,
    }
  }

  const habitStreaks = habits?.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id)
    return { habit, bestStreak, streak, total }
  })

  const rankedHabits = habitStreaks?.sort((a, b) => b.bestStreak - a.bestStreak)

  console.log(
    'rankedHabits:',
    rankedHabits.map((r) => r.habit.title)
  )

  return (
    <View>
      <Text>Habit Streaks</Text>
    </View>
  )
}

export default StreaksScreen
