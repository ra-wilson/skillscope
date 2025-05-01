import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";

export async function createOrGetInstitution(name: string) {
  // Check if there's already an institution doc with this name
  const institutionsRef = collection(db, "institutions");
  const qInst = query(institutionsRef, where("name", "==", name));
  const snap = await getDocs(qInst);

  if (!snap.empty) {
    // institution doc found
    const existing = snap.docs[0];
    return existing.id;
  }

  // Create new institution doc
  const docRef = await addDoc(institutionsRef, {
    name,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}