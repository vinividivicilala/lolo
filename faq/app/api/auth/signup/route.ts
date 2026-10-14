import { NextRequest, NextResponse } from "next/server";
import { authSignUp, firestoreCreate } from "@/lib/firebaseRest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const authData = await authSignUp(email, password, name);

    const now = new Date().toISOString();
    await firestoreCreate(
      "users",
      authData.localId,
      {
        uid: authData.localId,
        email: email,
        displayName: name,
        name: name,
        pin: null,
        provider: "email",
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
      },
      authData.idToken
    );

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat",
        uid: authData.localId,
        email: email,
        displayName: name,
        idToken: authData.idToken,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error.message);

    const errorMap: Record<string, string> = {
      EMAIL_EXISTS: "Email sudah digunakan",
      INVALID_EMAIL: "Email tidak valid",
      WEAK_PASSWORD: "Password minimal 6 karakter",
      OPERATION_NOT_ALLOWED: "Registrasi email/password tidak diaktifkan",
    };

    const code = error.message?.split(":")[0]?.trim();
    return NextResponse.json(
      { error: errorMap[code] || error.message || "Gagal membuat akun" },
      { status: 400 }
    );
  }
}
