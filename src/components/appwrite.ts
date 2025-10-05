import { Client, Account, Storage, TablesDB } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const coin_bucket = "coins";
export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export const tablesDB = new TablesDB(client);
export const account = new Account(client);
export const storage = new Storage(client);

export async function isLoggedIn() {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
}

export async function getUserID() {
  try {
    const user = await account.get();
    return user.$id;
  } catch {
    let uuid = localStorage.getItem('userUUID');
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem('userUUID', uuid);
    }
    return uuid;
  }
}

export async function getUsername() {
  try {
    const user = await account.get();
    return user.name.toString();
  } catch {
    const uuid = await getUserID();
    return `Anonymous-${uuid.slice(0, 8)}`;
  }
}