import { NextRequest, NextResponse } from "next/server";
import { authLookup, firestoreGet, firestoreSet } from "@/lib/firebaseRest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token diperlukan" }, { status: 401 });
    }

    const user = await authLookup(idToken);
    if (!user) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const uid = user.localId;
    const existingUser = await firestoreGet("users", uid, idToken);
    const now = new Date().toISOString();

    if (existingUser) {
      await firestoreSet(
        "users",
        uid,
        { lastLogin: now, updatedAt: now },
        idToken
      );
    } else {
      await firestoreSet(
        "users",
        uid,
        {
          uid: uid,
          email: user.email || "",
          displayName:
            user.displayName || user.email?.split("@")[0] || "Pengguna",
          photoURL: user.photoUrl || null,
          pin: null,
          provider: "oauth",
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
        },
        idToken
      );
    }

    const userData = existingUser || { pin: null };

    return NextResponse.json({
      success: true,
      user: {
        uid: uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoUrl,
        hasPin: !!userData.pin,
      },
    });
  } catch (error: any) {
    console.error("Signin error:", error.message);
    return NextResponse.json(
      { error: error.message || "Verifikasi gagal" },
      { status: 401 }
    );
  }
}
