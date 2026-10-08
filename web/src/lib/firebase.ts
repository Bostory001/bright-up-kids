import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ค่าจาก .env.local (ดู .env.local.example) — ยังไม่ได้สร้าง Firebase project จริง
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId);

export function getFirebase() {
  if (!isFirebaseConfigured) throw new Error("ยังไม่ได้ตั้งค่า Firebase ใน .env.local");
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app) };
}
