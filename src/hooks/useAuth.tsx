import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          if (!supabase) {
            setProfile(null);
            setLoading(false);
            return;
          }

          // Supabase UUID check to prevent "invalid input syntax for type uuid"
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firebaseUser.uid);
          
          let query = supabase.from('profiles').select('*');
          
          if (isUUID) {
            query = query.eq('id', firebaseUser.uid);
          } else {
            console.log("[AUTH] Non-UUID Firebase UID detected, falling back to email search:", firebaseUser.uid);
            query = query.eq('email', firebaseUser.email);
          }

          const { data, error } = await query.maybeSingle();
          
          if (error) throw error;

          if (data) {
            setProfile(data as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile from Supabase:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isUserAdmin = profile?.role === 'admin' || user?.email === 'storesnilesh@gmail.com' || user?.email === 'rohan00as@gmail.com';

  const value = {
    user,
    profile,
    loading,
    isAdmin: isUserAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
