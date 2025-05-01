import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin'
import serviceAccount from "../src/config/serviceAccountKey.json"

const creds = serviceAccount as ServiceAccount

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export const firestore = admin.firestore();