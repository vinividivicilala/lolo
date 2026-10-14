import { NextRequest, NextResponse } from "next/server";
import { authLookup, firestoreGet } from "@/lib/firebaseRest";

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
    const userData = await firestoreGet("users", uid, idToken);

    return NextResponse.json({
      success: true,
      user: {
        uid: uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoUrl,
        hasPin: !!userData?.pin,
        createdAt: userData?.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Me error:", error.message);
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
