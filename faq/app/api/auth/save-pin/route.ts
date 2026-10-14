import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getFieldValue } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const FieldValue = getFieldValue();

    const { idToken, pin } = await req.json();

    if (!idToken || !pin) {
      return NextResponse.json(
        { error: "idToken dan PIN wajib diisi" },
        { status: 400 }
      );
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN harus 6 digit angka" },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await adminDb.collection("users").doc(uid).set(
      {
        pin: pin,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "PIN berhasil disimpan",
    });
  } catch (error: any) {
    console.error("Save PIN error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan PIN" },
      { status: 401 }
    );
  }
}