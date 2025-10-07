import { useAuth } from '@/context/auth-context'
import {
  client,
  DATABASE_ID,
  databases,
  HABITS_TABLE_ID,
  RealtimeResponse,
} from '@/lib/appwrite'
import { IHabit } from '@/types/database.type'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Query } from 'react-native-appwrite'
import { Button, Surface, Text } from 'react-native-paper'

export default function Index() {
  const { signOut, user } = useAuth()
  const [habits, setHabits] = useState<IHabit[]>([])

  useEffect(() => {
    if (!user) return
    const channel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`
    const habitsSubscription = client.subscribe(
      channel,
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
    fetchHabits()
    return () => habitsSubscription()
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
            <Surface style={styles.card} key={habit.$id} elevation={0}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{habit.title}</Text>
                <Text style={styles.cardDescription}>{habit.description}</Text>
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
})
