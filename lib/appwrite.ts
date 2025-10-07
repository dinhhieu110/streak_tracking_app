import { Account, Client, Databases } from 'react-native-appwrite'

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
const platform = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME

if (!endpoint || !projectId || !platform)
  throw new Error('Missing AppWrite environment variables')

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform)

export const account = new Account(client)
export const databases = new Databases(client)

export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!
export const HABITS_TABLE_ID = process.env.EXPO_PUBLIC_HABITS_TABLE_ID!
