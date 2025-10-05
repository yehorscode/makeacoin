import { Client, Databases, Account, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const coin_bucket = "coins";

export const databases = new Databases(client);
export const account = new Account(client);
export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const storage = new Storage(client);

export async function getUserID() {
  try {
    const user = await account.get();
    return user.$id;
  } catch {
    return null;
  }
}
