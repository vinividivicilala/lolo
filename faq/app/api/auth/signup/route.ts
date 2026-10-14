import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
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

    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    } catch (err: any) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: name,
      name: name,
      pin: null,
      provider: "email",
      createdAt: adminDb.FieldValue.serverTimestamp(),
      updatedAt: adminDb.FieldValue.serverTimestamp(),
      lastLogin: adminDb.FieldValue.serverTimestamp(),
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