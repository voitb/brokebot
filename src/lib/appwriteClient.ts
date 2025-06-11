import { Client, Account, Functions } from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''; 
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)  
  .setProject(APPWRITE_PROJECT_ID); 

export const account = new Account(client);
export const functions = new Functions(client);  