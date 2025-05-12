import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  signInWithEmail, 
  signInWithGoogle, 
  createAccount, 
  logOut, 
  subscribeToAuthChanges 
} from '../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    
    // Extract more user-friendly message
    let errorMessage = 'An error occurred during authentication';
    if (error.code) {
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error - check your connection';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed before completing';
          break;
        default:
          errorMessage = error.message || 'Authentication failed';
      }
    }
    
    setError(errorMessage);
    throw error;
  };

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      return result.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setError(null);
    try {
      const result = await signInWithGoogle();
      return result.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signup = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const result = await createAccount(email, password);
      return result.user;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await logOut();
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 