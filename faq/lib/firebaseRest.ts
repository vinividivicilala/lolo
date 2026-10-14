// ============================================
// Firebase REST API Helper
// 100% compatible dengan Netlify Functions
// Tidak butuh firebase-admin, cuma fetch()
// ============================================

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ===== AUTH REST API =====

export async function authSignUp(
  email: string,
  password: string,
  displayName: string
) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Signup gagal");
  }

  return data as {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
  };
}

export async function authSignIn(email: string, password: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Login gagal");
  }

  return data;
}

export async function authLookup(idToken: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Token tidak valid");
  }

  return data.users?.[0];
}

// ===== FIRESTORE REST API =====

export async function firestoreGet(
  collection: string,
  docId: string,
  idToken: string
) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Firestore get gagal");
  }

  const data = await res.json();
  return firestoreParseDocument(data);
}

export async function firestoreSet(
  collection: string,
  docId: string,
  fields: Record<string, any>,
  idToken: string
) {
  const firestoreFields = firestoreEncodeFields(fields);

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields: firestoreFields }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Firestore set gagal");
  }

  return await res.json();
}

// ===== HELPER: ENCODE/DECODE FIRESTORE =====

function firestoreEncodeFields(fields: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) {
      result[key] = { nullValue: null };
    } else if (typeof value === "string") {
      result[key] = { stringValue: value };
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        result[key] = { integerValue: value.toString() };
      } else {
        result[key] = { doubleValue: value };
      }
    } else if (typeof value === "boolean") {
      result[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      result[key] = {
        arrayValue: {
          values: value.map((v) => firestoreEncodeFields({ v }).v),
        },
      };
    } else if (typeof value === "object") {
      result[key] = {
        mapValue: { fields: firestoreEncodeFields(value) },
      };
    }
  }

  return result;
}

function firestoreParseDocument(doc: any): Record<string, any> | null {
  if (!doc || !doc.fields) return null;

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(
    doc.fields as Record<string, any>
  )) {
    result[key] = firestoreDecodeValue(value);
  }

  return result;
}

function firestoreDecodeValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.mapValue !== undefined) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = firestoreDecodeValue(v);
    }
    return result;
  }
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(firestoreDecodeValue);
  }
  return null;
}
