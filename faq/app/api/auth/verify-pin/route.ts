import { NextRequest, NextResponse } from "next/server";
import { authLookup, firestoreGet, firestoreSet } from "@/lib/firebaseRest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { idToken, pin } = await req.json();

    if (!idToken || !pin) {
      return NextResponse.json(
        { error: "idToken dan PIN wajib diisi" },
        { status: 400 }
      );
    }

    if (pin.length !== 6) {
      return NextResponse.json(
        { error: "PIN harus 6 digit" },
        { status: 400 }
      );
    }

    const user = await authLookup(idToken);
    if (!user) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const uid = user.localId;
    const userData = await firestoreGet("users", uid, idToken);

    if (!userData) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (userData.pin !== pin) {
      return NextResponse.json({ error: "PIN salah" }, { status: 401 });
    }

    await firestoreSet(
      "users",
      uid,
      { lastLogin: new Date().toISOString() },
      idToken
    );

    return NextResponse.json({
      success: true,
      message: "PIN terverifikasi",
      user: {
        uid: uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
      },
    });
  } catch (error: any) {
    console.error("Verify PIN error:", error.message);
    return NextResponse.json(
      { error: error.message || "Verifikasi gagal" },
      { status: 401 }
    );
  }
}
