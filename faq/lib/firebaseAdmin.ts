import "server-only";

let adminCache: any = null;

function loadAdmin() {
  if (adminCache) return adminCache;

  // ⚠️⚠️⚠️ KUNCI UTAMA ⚠️⚠️⚠️
  // eval("require") = Webpack/Netlify TIDAK BISA deteksi module ini
  // sehingga firebase-admin TIDAK di-bundle
  // Node.js akan resolve module ini saat runtime (bukan build time)
  const _require = eval("require");
  const admin = _require("firebase-admin");

  if (!admin || !admin.apps) {
    throw new Error("firebase-admin gagal di-load: " + typeof admin);
  }

  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Firebase Admin credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY di Netlify env vars."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });

    console.log("✅ Firebase Admin initialized");
  }

  adminCache = admin;
  return admin;
}

export function getAdminAuth() {
  return loadAdmin().auth();
}

export function getAdminDb() {
  return loadAdmin().firestore();
}

export function getFieldValue() {
  return loadAdmin().firestore.FieldValue;
}
