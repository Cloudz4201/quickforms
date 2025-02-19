import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('Firebase user:', firebaseUser); // Debug log
          
          // Get or create user profile in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('Existing user data:', userData); // Debug log
            
            const profileData = {
              ...userData,
              name: userData.name || firebaseUser.displayName || 'User',
              email: userData.email || firebaseUser.email,
              company: userData.company || 'Company not set',
              industry: userData.industry || 'Industry not set',
              role: userData.role || 'Role not set',
              useCase: userData.useCase || {},
              team: userData.team || {},
              forms: userData.forms || [],
              hasSeenWelcome: userData.hasSeenWelcome || false,
            };

            setUser({
              ...firebaseUser,
              profile: profileData,
              onboarding: userData.onboarding || { completed: false },
            });
          } else {
            // Create new user profile
            const userProfile = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              company: 'Company not set',
              industry: 'Industry not set',
              role: 'Role not set',
              createdAt: new Date().toISOString(),
              plan: 'free',
              settings: {
                notifications: true,
                darkMode: false,
                language: 'en',
              },
              onboarding: {
                completed: false,
              },
              useCase: {},
              team: {},
              forms: [],
              hasSeenWelcome: false,
            };

            console.log('Creating new user profile:', userProfile); // Debug log
            await setDoc(userRef, userProfile);
            
            setUser({
              ...firebaseUser,
              profile: userProfile,
              onboarding: { completed: false },
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (userData) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });
      
      // Update local user state with the complete profile data
      setUser(currentUser => ({
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...userData,
          name: userData.name || currentUser.profile.name || currentUser.displayName || 'User',
          email: userData.email || currentUser.profile.email || currentUser.email,
        },
        onboarding: { ...currentUser.onboarding, ...userData.onboarding },
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Github login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateUserData,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 