import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getFieldValue } from "@/lib/firebaseAdmin";

// ⚠️ WAJIB: paksa route jadi dynamic (tidak di-prerender saat build)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const FieldValue = getFieldValue();

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, dan nama wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Cek email sudah ada
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    // Buat user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Simpan ke Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: name,
      name: name,
      pin: null,
      provider: "email",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat",
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: name,
        customToken,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    const errorMap: Record<string, string> = {
      "auth/email-already-exists": "Email sudah digunakan",
      "auth/invalid-email": "Email tidak valid",
      "auth/weak-password": "Password terlalu lemah",
      "auth/operation-not-allowed": "Registrasi tidak diizinkan",
    };

    return NextResponse.json(
      { error: errorMap[error.code] || error.message || "Gagal membuat akun" },
      { status: 400 }
    );
  }
}
