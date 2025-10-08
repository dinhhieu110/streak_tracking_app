import { useAuth } from '@/context/auth-context'
import {
  client,
  DATABASE_ID,
  databases,
  HABIT_COMPLETION_TABLE_ID,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from '@/lib/appwrite'
import { IHabit, IHabitCompletion } from '@/types/database.type'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Query } from 'react-native-appwrite'
import { Card, Text } from 'react-native-paper'

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

    const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`
    const habitsSubscription = client.subscribe(
      habitsChannel,
      (response: RealtimeResponse<IHabit>) => {
        if (
          response.events.includes(
            'databases.*.collections.*.documents.*.create'
          ) &&
          response.payload.user_id === user?.$id
        ) {
          fetchHabits()
        } else if (
          response.events.includes(
            'databases.*.collections.*.documents.*.update'
          ) &&
          response.payload.user_id === user?.$id
        ) {
          fetchHabits()
        } else if (
          response.events.includes(
            'databases.*.collections.*.documents.*.delete'
          ) &&
          response.payload.user_id === user?.$id
        ) {
          fetchHabits()
        }
      }
    )

    const completedHabitsChannels = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`
    const completedHabitsSubscription = client.subscribe(
      completedHabitsChannels,
      (response: RealtimeResponse<IHabit>) => {
        if (
          response.events.includes(
            'databases.*.collections.*.documents.*.create'
          ) &&
          response.payload.user_id === user?.$id
        ) {
          fetchHabits()
        } else if (
          response.events.includes(
            'databases.*.collections.*.documents.*.update'
          ) &&
          response.payload.user_id === user?.$id
        ) {
          fetchCompletedHabits()
        }
      }
    )

    fetchHabits()
    fetchCompletedHabits()

    return () => {
      habitsSubscription()
      completedHabitsSubscription()
    }
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
        currentStreak = 1
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak
      streak = currentStreak
      lastDate = date
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
  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3]
  return (
    <View style={styles.container}>
      <Text style={styles.title} variant='headlineSmall'>
        Habit Streaks
      </Text>

      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏅Top Streaks</Text>
          {rankedHabits.slice(0, 3).map(({ habit, bestStreak }, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key || 0]]}>
                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
              </View>
              <Text style={styles.rankingHabit}>{habit.title}</Text>
              <Text style={styles.rankingStreak}>{bestStreak}</Text>
            </View>
          ))}
        </View>
      )}

      {habits.length === 0 ? (
        <View>
          <Text>No habits found</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {rankedHabits?.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              key={key}
              style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text variant='titleMedium' style={styles.habitTitle}>
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>{habit.description}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>🔥{streak}</Text>
                    <Text style={styles.statBadgeLabel}>Current</Text>
                  </View>
                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}>🏆{bestStreak}</Text>
                    <Text style={styles.statBadgeLabel}>Best</Text>
                  </View>
                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}>✅{total}</Text>
                    <Text style={styles.statBadgeLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default StreaksScreen

const styles = StyleSheet.create({
  rankingContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    // borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#7c4dff',
    letterSpacing: 0.5,
  },

  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },

  rankingBadge: {
    width: 22,
    height: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },

  badge1: {
    backgroundColor: '#ffd700',
  },

  badge2: {
    backgroundColor: '#c0c0c0',
  },

  badge3: {
    backgroundColor: '#cd7f32',
  },

  rankingBadgeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },

  rankingStreak: {
    fontSize: 14,
    color: '#7c4dff',
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  firstCard: {
    borderWidth: 2,
    borderColor: '#7c4dff',
  },
  habitTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  habitDescription: {
    color: '#6c6c80',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeGold: {
    backgroundColor: '#fffde7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#22223b',
  },
  statBadgeLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
})
