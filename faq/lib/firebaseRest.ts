// ============================================
// Firebase REST API Helper
// 100% compatible dengan Netlify Functions
// Tidak butuh firebase-admin, cuma fetch()
// ============================================

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ===== VALIDASI ENV VARS =====
function validateEnv() {
  if (!FIREBASE_API_KEY) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_API_KEY tidak di-set. Cek env vars di Netlify."
    );
  }
  if (!PROJECT_ID) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID tidak di-set. Cek env vars di Netlify."
    );
  }
}

// ===== HELPER: FETCH DENGAN TIMEOUT =====
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 15000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout — server tidak merespons");
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

// ===== AUTH REST API =====

export async function authSignUp(
  email: string,
  password: string,
  displayName: string
) {
  validateEnv();

  const res = await fetchWithTimeout(
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
    const errCode = data.error?.message || "SIGNUP_FAILED";
    throw new Error(errCode);
  }

  return data as {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    displayName?: string;
  };
}

export async function authSignIn(email: string, password: string) {
  validateEnv();

  const res = await fetchWithTimeout(
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
    const errCode = data.error?.message || "SIGNIN_FAILED";
    throw new Error(errCode);
  }

  return data;
}

export async function authLookup(idToken: string) {
  validateEnv();

  const res = await fetchWithTimeout(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const errCode = data.error?.message || "LOOKUP_FAILED";
    throw new Error(errCode);
  }

  return data.users?.[0];
}

// ===== FIRESTORE REST API =====

export async function firestoreGet(
  collection: string,
  docId: string,
  idToken: string
) {
  validateEnv();

  const res = await fetchWithTimeout(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    let errMsg = `Firestore get gagal (${res.status})`;
    try {
      const error = await res.json();
      errMsg = error.error?.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
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
  validateEnv();

  const firestoreFields = firestoreEncodeFields(fields);

  // ⚠️ PENTING: pakai PATCH dengan updateMask
  // supaya hanya field yang dikirim yang di-update
  // field lain tetap aman
  const updateMask = Object.keys(fields)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");

  const res = await fetchWithTimeout(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?${updateMask}`,
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
    let errMsg = `Firestore set gagal (${res.status})`;
    try {
      const error = await res.json();
      errMsg = error.error?.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return await res.json();
}

/**
 * Create document baru (create-only, tidak overwrite)
 * Untuk signup user baru
 */
export async function firestoreCreate(
  collection: string,
  docId: string,
  fields: Record<string, any>,
  idToken: string
) {
  validateEnv();

  const firestoreFields = firestoreEncodeFields(fields);

  const res = await fetchWithTimeout(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?documentId=${docId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields: firestoreFields }),
    }
  );

  if (!res.ok) {
    let errMsg = `Firestore create gagal (${res.status})`;
    try {
      const error = await res.json();
      errMsg = error.error?.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return await res.json();
}

// ===== HELPER: ENCODE/DECODE FIRESTORE =====

function firestoreEncodeFields(
  fields: Record<string, any>
): Record<string, any> {
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
    } else if (value instanceof Date) {
      result[key] = { timestampValue: value.toISOString() };
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

  for (const [key, value] of Object.entries(doc.fields as Record<string, any>)) {
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
