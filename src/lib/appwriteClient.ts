import { Client, Account, Functions, Databases } from "appwrite";

// Validate required environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

if (!APPWRITE_ENDPOINT) {
  throw new Error('VITE_APPWRITE_ENDPOINT environment variable is required');
}

if (!APPWRITE_PROJECT_ID) {
  throw new Error('VITE_APPWRITE_PROJECT_ID environment variable is required');
}

if (!APPWRITE_DATABASE_ID) {
  throw new Error('VITE_APPWRITE_DATABASE_ID environment variable is required');
}

export const APPWRITE_CONVERSATIONS_COLLECTION_ID = 'conversations';
export const APPWRITE_MESSAGES_COLLECTION_ID = 'messages';
export const APPWRITE_FOLDERS_COLLECTION_ID = 'folders';
export const APPWRITE_SUBSCRIPTIONS_COLLECTION_ID = 'subscriptions';

// Functions
export const APPWRITE_FUNC_CREATE_STRIPE_CHECKOUT_SESSION = 'create-stripe-checkout-session';
export const APPWRITE_FUNC_MANAGE_SUBSCRIPTION = 'manage-subscription';
export const APPWRITE_FUNC_ENCRYPT_KEYS = 'encrypt-keys';

// Stripe
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not set - payment functionality will be disabled');
}

export const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)  
  .setProject(APPWRITE_PROJECT_ID); 

export const account = new Account(client);
export const functions = new Functions(client);  
export const databases = new Databases(client);  