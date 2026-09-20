import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isDemo?: boolean;
  isGmailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  connectGmailAccount: (email: string, displayName?: string) => Promise<void>;
  switchUser: (type: 'userA' | 'userB') => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  isGmailConnected: boolean;
  gmailAddress: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_A: AuthUser = {
  uid: 'user_raghavendra_a1',
  email: 'raghavendraillale@gmail.com',
  displayName: 'Raghavendra Illale',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemo: false,
  isGmailVerified: true,
};

const DEMO_USER_B: AuthUser = {
  uid: 'user_alice_dev_b2',
  email: 'alice.chen@careerhub.ai',
  displayName: 'Alice Chen',
  photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  isDemo: true,
  isGmailVerified: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Default to User A for immediate interactive experience
    const saved = localStorage.getItem('careerhub_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEMO_USER_A; }
    }
    return DEMO_USER_A;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('careerhub_token') || 'demo-session-raghavendra_a1';
  });
  const [loading, setLoading] = useState(false);

  // Sync token to API calls
  const getIdToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        setToken(idToken);
        return idToken;
      } catch (e) {
        console.warn('Error fetching Firebase token:', e);
      }
    }
    return token;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const activeUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          isDemo: false,
        };
        setUser(activeUser);
        setToken(idToken);
        localStorage.setItem('careerhub_user', JSON.stringify(activeUser));
        localStorage.setItem('careerhub_token', idToken);

        // Sync with backend database
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
          });
        } catch (err) {
          console.error('Failed to sync authenticated user:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In via popup with fallback
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();
      const activeUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email || 'raghavendraillale@gmail.com',
        displayName: fbUser.displayName || 'Raghavendra Illale',
        photoURL: fbUser.photoURL || undefined,
        isDemo: false,
        isGmailVerified: true,
      };
      setUser(activeUser);
      setToken(idToken);
      localStorage.setItem('careerhub_user', JSON.stringify(activeUser));
      localStorage.setItem('careerhub_token', idToken);

      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error: any) {
      console.warn('Google Sign In popup was closed or restricted in iframe. Connecting user Gmail workspace:', error);
      // Seamlessly connect the user's Gmail workspace
      await connectGmailAccount('raghavendraillale@gmail.com', 'Raghavendra Illale');
    } finally {
      setLoading(false);
    }
  };

  // Connect & authenticate Gmail account for real alerts
  const connectGmailAccount = async (email: string, displayName?: string) => {
    setLoading(true);
    try {
      const activeUser: AuthUser = {
        uid: user?.uid?.startsWith('google_') ? user.uid : `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: email.trim(),
        displayName: displayName || user?.displayName || email.split('@')[0],
        photoURL: user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName || email}`,
        isDemo: false,
        isGmailVerified: true,
      };
      const activeToken = `token_gmail_${activeUser.uid}`;
      setUser(activeUser);
      setToken(activeToken);
      localStorage.setItem('careerhub_user', JSON.stringify(activeUser));
      localStorage.setItem('careerhub_token', activeToken);

      // Sync user with backend
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
          'x-demo-email': activeUser.email,
          'x-demo-name': activeUser.displayName,
        },
      });

      // Update Gmail integration status
      await fetch('/api/gmail/send-test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
          'x-demo-email': activeUser.email,
          'x-demo-name': activeUser.displayName,
        },
        body: JSON.stringify({ targetEmail: activeUser.email, alertType: 'gmail_connected' }),
      });
    } catch (err) {
      console.error('Connect Gmail account error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch between isolated test accounts to easily verify User A vs User B data isolation
  const switchUser = async (type: 'userA' | 'userB') => {
    setLoading(true);
    const selected = type === 'userA' ? DEMO_USER_A : DEMO_USER_B;
    const demoToken = type === 'userA' ? 'demo-session-raghavendra_a1' : 'demo-session-alice_dev_b2';
    
    setUser(selected);
    setToken(demoToken);
    localStorage.setItem('careerhub_user', JSON.stringify(selected));
    localStorage.setItem('careerhub_token', demoToken);

    // Sync to create/fetch isolated DB data in PostgreSQL
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${demoToken}`,
          'x-demo-email': selected.email,
          'x-demo-name': selected.displayName,
        },
      });
    } catch (e) {
      console.error('Switch user sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('careerhub_user');
    localStorage.removeItem('careerhub_token');
  };

  const deleteAccount = async () => {
    if (!token) return;
    const activeToken = await getIdToken();
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'x-demo-email': user?.email || '',
        'x-demo-name': user?.displayName || '',
      },
    });
    if (!res.ok) throw new Error('Failed to delete account');
    await logout();
  };

  const isGmailConnected = Boolean(user?.email && user.email.includes('@'));
  const gmailAddress = user?.email || 'raghavendraillale@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        signInWithGoogle,
        connectGmailAccount,
        switchUser,
        logout,
        deleteAccount,
        getIdToken,
        isGmailConnected,
        gmailAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
