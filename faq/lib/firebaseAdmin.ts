import admin from "firebase-admin";

/**
 * Lazy initialization - hanya inisialisasi saat dipanggil,
 * bukan saat module di-import (menghindari error saat build time)
 */
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY di environment variables."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

/**
 * Getter untuk adminAuth - lazy load
 */
export function getAdminAuth() {
  getAdminApp();
  return admin.auth();
}

/**
 * Getter untuk adminDb - lazy load
 */
export function getAdminDb() {
  getAdminApp();
  return admin.firestore();
}

/**
 * Getter untuk FieldValue - helper
 */
export function getFieldValue() {
  getAdminApp();
  return admin.firestore.FieldValue;
}

export { admin };
