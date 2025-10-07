import { StyleSheet, Text, View } from 'react-native'

export default function Index() {
  return (
    <View style={styles.view}>
      <Text>Hello</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    width: 100,
    height: 20,
    backgroundColor: 'coral',
    borderRadius: 8,
    textAlign: 'center',
  },
})
