// UserContext provides authentication state and user profile management across the app
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getCategoryForSkill } from '@/lib/skillHelper';

// Defines the possible roles a user can have in the system
export type UserRole = 'individual' | 'institution' | null;

// Describes the shape of the context value: state and actions for user data
export interface UserContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  skills: Record<string, number>;
  updateSkill: (skill: string, level: number) => void;
  skillsToImprove: string[];
  updateSkillsToImprove: (skills: string[]) => void;
  institutionId: string | null;
  updateInstitution: (institutionId: string | null) => void;
}

// Create a React context to share user state and functions
const UserContext = createContext<UserContextType | undefined>(undefined);

// Context provider component that wraps the app and holds user-related state
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [skillsToImprove, setSkillsToImprove] = useState<string[]>([]);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  // Listen for Firebase auth changes, load user profile and skills on sign-in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAuthenticated(false);
        setUserRole(null);
        setSkills({});
        setSkillsToImprove([]);
        setInstitutionId(null);
        return;
      }

      setIsAuthenticated(true);

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role || null);
          if (data.skillsToImprove) setSkillsToImprove(data.skillsToImprove);
          if (data.institutionId) setInstitutionId(data.institutionId);
        }
      } catch (err) {
        console.error('Error loading user profile data:', err);
      }

      try {
        const userSkillsRef = collection(db, 'users', firebaseUser.uid, 'skills');
        const snap = await getDocs(userSkillsRef);
        const skillData: Record<string, number> = {};
        snap.forEach(docSnap => {
          const data = docSnap.data() as { level: number };
          skillData[docSnap.id] = data.level;
        });
        setSkills(skillData);
      } catch (err) {
        console.error('Error fetching user skills:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Log in locally by setting authentication flag and user role
  const login = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Sign out from Firebase and reset all user context state
  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserRole(null);
    setSkills({});
    setSkillsToImprove([]);
    setInstitutionId(null);
  };

  // Update a user skill level locally and persist it to Firestore
  const updateSkill = async (skill: string, level: number) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const category = getCategoryForSkill(skill);
    setSkills(prev => ({ ...prev, [skill]: level }));

    try {
      const skillRef = doc(db, 'users', currentUser.uid, 'skills', skill);
      await setDoc(skillRef, {
        name: skill,
        level,
        category,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error updating skill in Firestore:', err);
    }
  };

  // Persist updated list of skills the user wants to improve in Firestore
  const updateSkillsToImprove = async (newSkills: string[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        skillsToImprove: newSkills,
        updatedAt: serverTimestamp()
      });
      setSkillsToImprove(newSkills);
    } catch (err) {
      console.error('Error updating skillsToImprove in Firestore:', err);
    }
  };

  // Persist updated institution ID for the user in Firestore
  const updateInstitution = async (newInstitutionId: string | null) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        institutionId: newInstitutionId,
        updatedAt: serverTimestamp()
      });
      setInstitutionId(newInstitutionId);
    } catch (err) {
      console.error('Error updating institution in Firestore:', err);
    }
  };

  // Expose user state and action handlers to all child components
  return (
    <UserContext.Provider value={{
      isAuthenticated,
      userRole,
      login,
      logout,
      skills,
      updateSkill,
      skillsToImprove,
      updateSkillsToImprove,
      institutionId,
      updateInstitution,
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to consume UserContext and access user state/actions
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};