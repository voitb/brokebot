import { Client, Account, Functions, Databases } from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''; 
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

export const APPWRITE_CONVERSATIONS_COLLECTION_ID = 'conversations';
export const APPWRITE_MESSAGES_COLLECTION_ID = 'messages';
export const APPWRITE_FOLDERS_COLLECTION_ID = 'folders';
export const APPWRITE_SUBSCRIPTIONS_COLLECTION_ID = 'subscriptions';

// Functions
export const APPWRITE_FUNC_CREATE_STRIPE_CHECKOUT_SESSION = 'create-stripe-checkout-session';
export const APPWRITE_FUNC_MANAGE_SUBSCRIPTION = 'manage-subscription';

// Stripe
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)  
  .setProject(APPWRITE_PROJECT_ID); 

export const account = new Account(client);
export const functions = new Functions(client);  
export const databases = new Databases(client);  