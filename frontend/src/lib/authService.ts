// AuthService manages user authentication and Firestore user document creation and updates
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
  } from 'firebase/auth';
  import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    serverTimestamp
  } from 'firebase/firestore';
  
  import { auth, db } from '@/lib/firebase';
  import { createOrGetInstitution } from '@/lib/institutionService';
  
  // Registers a new user with Firebase Authentication and initialises their Firestore profile
  export async function signupUser(
    email: string,
    password: string,
    role: 'individual' | 'institution',
    displayName: string,
    institutionId?: string
  ) {
    // Create a new user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
  
    // Prepare Firestore document for the new user
    const userRef = doc(db, 'users', uid);
    const data: any = {
      email,
      role,
      createdAt: serverTimestamp(),
    };
    // For individual users, record their name and optional institution ID
    if (role === 'individual') {
      data.name = displayName;
      if (institutionId) {
        data.institutionId = institutionId;
      }
    // For institutional users, ensure the institution exists and record its details
    } else {
      data.institutionName = displayName;
          // => create or get institution doc
      const institutionId = await createOrGetInstitution(displayName);
      data.institutionId = institutionId;
      data.institutionName = displayName;  // optional
    }
  
    // Persist the user profile to Firestore, merging with any existing data
    await setDoc(userRef, data, { merge: true });
  
    return uid;
  }
  
  // Authenticates a user via Firebase with email and password
  export async function loginUser(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }
  
  // Signs out the authenticated user from Firebase
  export async function logoutUser() {
    await signOut(auth);
  }
  
  // Retrieves the user's profile document from Firestore
  export async function getUserDoc(uid: string) {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  }
  
  // Creates or updates a user's skill entry in Firestore
  export async function setUserSkill(
    uid: string,
    skillName: string,
    level: number,
    category: string
  ) {
    const skillRef = doc(db, 'users', uid, 'skills', skillName);
    await setDoc(skillRef, {
      name: skillName,
      level,
      category,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  
  // Retrieves all skill entries for a user from Firestore

  export async function getUserSkills(uid: string) {
    const skillsRef = collection(db, 'users', uid, 'skills');
    const snap = await getDocs(skillsRef);
    const results: Record<string, any> = {};
    snap.forEach(doc => {
      results[doc.id] = doc.data();
    });
    return results;
  }