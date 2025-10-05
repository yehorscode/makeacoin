import { Client, Databases, Account } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

if (!endpoint || !projectId || !databaseId || !collectionId) {
  throw new Error('Missing required Appwrite environment variables. Please set VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, and VITE_APPWRITE_COLLECTION_ID.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const databases = new Databases(client);
export const account = new Account(client);
export { databaseId, collectionId };