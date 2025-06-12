"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { OAuthProvider, type Models } from "appwrite";
import { account } from "@/lib/appwriteClient";
import { AppwriteException } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  getCurrentUser: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (
    userId: string,
    secret: string,
    pass: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentUser = useCallback(async () => {
    try {
        console.log("getCurrentUser", account)
      const currentUser = await account.get();
      console.log("currentUser", currentUser)
      setUser(currentUser);
    } catch (e) {
      if (e instanceof AppwriteException && e.code !== 401) throw e;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    await getCurrentUser();
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const signup = async (email: string, pass: string, name: string) => {
    await account.create("unique()", email, pass, name);
    await login(email, pass);
  };

  const createOAuth2Session = (provider: OAuthProvider) => {
    const successUrl = `${window.location.origin}/auth/callback`;
    const failureUrl = `${window.location.origin}/login?error=oauth_failed`;
    account.createOAuth2Session(provider, successUrl, failureUrl, ['repo', 'user'] );
  };

  const loginWithGoogle = async () => createOAuth2Session(OAuthProvider.Google);
  const loginWithGitHub = async () => createOAuth2Session(OAuthProvider.Github);

  const sendPasswordReset = async (email: string) => {
    const resetUrl = `${window.location.origin}/reset-password`;
    await account.createRecovery(email, resetUrl);
  };

  const confirmPasswordReset = async (
    userId: string,
    secret: string,
    pass: string
  ) => {
    await account.updateRecovery(userId, secret, pass);
  };

  const value = {
    user,
    isLoading,
    getCurrentUser,
    login,
    logout,
    signup,
    loginWithGoogle,
    loginWithGitHub,
    sendPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 