'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If firebase is not configured, we just set loading to false and don't try to authenticate.
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      const msg = "Firebase is not configured. Please add your credentials to the .env file.";
      toast({ title: "Login Failed", description: msg, variant: "destructive" });
      throw new Error(msg);
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      console.error("Login error:", error.message);
      let description = "An unknown error occurred. Please try again.";
      if (typeof error.code === 'string') {
        switch (error.code) {
          case 'auth/configuration-not-found':
          case 'auth/invalid-api-key':
            description = "Firebase configuration is incorrect. Please check your .env file and Firebase project settings.";
            break;
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            description = "Invalid email or password.";
            break;
          default:
            description = error.code;
        }
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      const msg = "Firebase is not configured. Please add your credentials to the .env file.";
      toast({ title: "Sign Up Failed", description: msg, variant: "destructive" });
      throw new Error(msg);
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any)
    {
      console.error("Signup error:", error.message);
      let description = "An unknown error occurred. Please try again.";
       if (typeof error.code === 'string') {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = "This email address is already in use.";
            break;
          case 'auth/weak-password':
            description = "The password is too weak. Please use a stronger password.";
            break;
          case 'auth/configuration-not-found':
          case 'auth/invalid-api-key':
            description = "Firebase configuration is incorrect. Please check your .env file and Firebase project settings.";
            break;
          default:
            description = error.code;
        }
      }
      toast({ title: "Sign Up Failed", description, variant: "destructive" });
      throw error;
    }
  };

  const logout = async () => {
    // If firebase is not configured, just redirect to login
    if (!isFirebaseConfigured || !auth) {
      router.push('/login');
      return;
    }

    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
       console.error("Logout error:", error.message);
       toast({ title: "Logout Failed", description: error.code, variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
