import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

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

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (userData.pin !== pin) {
      return NextResponse.json({ error: "PIN salah" }, { status: 401 });
    }

    await adminDb.collection("users").doc(uid).update({
      lastLogin: adminDb.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "PIN terverifikasi",
      user: {
        uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
      },
    });
  } catch (error: any) {
    console.error("Verify PIN error:", error);
    return NextResponse.json(
      { error: error.message || "Verifikasi gagal" },
      { status: 401 }
    );
  }
}
