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
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ID, Query } from 'react-native-appwrite'
import { Swipeable } from 'react-native-gesture-handler'
import { Button, Surface, Text } from 'react-native-paper'

export default function Index() {
  const { signOut, user } = useAuth()
  const [habits, setHabits] = useState<IHabit[]>([])
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([])

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({})

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
          fetchTodayCompletedHabits()
        }
      }
    )
    fetchHabits()
    fetchTodayCompletedHabits()
    return () => {
      completedHabitsSubscription()
      habitsSubscription()
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

  const fetchTodayCompletedHabits = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const res = await databases.listDocuments<IHabitCompletion>(
        DATABASE_ID,
        HABIT_COMPLETION_TABLE_ID,
        [
          Query.equal('user_id', user?.$id || ''),
          Query.greaterThanEqual('completed_at', today.toISOString()),
        ]
      )
      const completions = res.documents as IHabitCompletion[]
      setCompletedHabitIds(completions.map((c) => c.habit_id.toString()))
    } catch (error) {
      console.error(error)
    }
  }

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons name='trash-can-outline' size={32} color='#fff' />
    </View>
  )

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_TABLE_ID, habitId)
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const renderRightActions = () => (
    <View style={styles.swipeActionRight}>
      <MaterialCommunityIcons
        name='check-circle-outline'
        size={32}
        color='#fff'
      />
    </View>
  )

  const handleCompleteHabit = async (habitId: string) => {
    if (!user || completedHabitIds.includes(habitId)) return
    try {
      const currentDate = new Date().toISOString()
      await databases.createDocument(
        DATABASE_ID,
        HABIT_COMPLETION_TABLE_ID,
        ID.unique(),
        {
          user_id: user?.$id,
          completed_at: currentDate,
          habit_id: habitId,
        }
      )
      const habit = habits?.find((h) => h.$id === habitId)
      if (!habit) return
      await databases.updateDocument(DATABASE_ID, HABITS_TABLE_ID, habitId, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      })
    } catch (error) {
      console.error('Error handling habit:', error)
    }
  }

  const checkHabitCompletion = (habitId: string) => {
    return completedHabitIds?.includes(habitId)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant='headlineSmall' style={styles.title}>
          Today&apos;s Habits
        </Text>
        <Button mode='text' onPress={signOut} icon='logout'>
          Sign Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No habits found</Text>
          </View>
        ) : (
          habits?.map((habit) => (
            <Swipeable
              key={habit.$id}
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref
              }}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                  handleDeleteHabit(habit.$id)
                } else if (direction === 'right') {
                  handleCompleteHabit(habit.$id)
                }
                swipeableRefs.current[habit.$id]?.close()
              }}
            >
              <Surface
                style={[
                  styles.card,
                  checkHabitCompletion(habit.$id) ? styles.completedCard : null,
                ]}
                elevation={0}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>
                    {habit.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name='fire'
                        size={18}
                        color='#ff9800'
                      />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
  },
  habitsList: {},
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#f7f2fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  completedCard: {
    opacity: 0.6,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#22223b',
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: '#6c6c80',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    marginLeft: 6,
    color: '#ff9800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: '#ede7f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: '#7c4dff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  swipeActionLeft: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    backgroundColor: '#e53935',
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    backgroundColor: '#4caf50',
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
})
