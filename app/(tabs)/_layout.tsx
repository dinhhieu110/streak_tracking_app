import Entypo from '@expo/vector-icons/Entypo'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'coral' }}>
      <Tabs.Screen
        name='index'
        options={{
          headerTitle: 'Home',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name='home' size={24} color={color} />
            ) : (
              <Ionicons name='home-outline' size={24} color='black' />
            ),
        }}
      />
      <Tabs.Screen
        name='login'
        options={{
          headerTitle: 'Login',
          tabBarIcon: ({ focused, color }) => (
            <Entypo name='login' size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
