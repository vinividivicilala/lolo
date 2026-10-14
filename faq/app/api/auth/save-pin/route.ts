import { NextRequest, NextResponse } from "next/server";
import { authLookup, firestoreSet } from "@/lib/firebaseRest";

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

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN harus 6 digit angka" },
        { status: 400 }
      );
    }

    const user = await authLookup(idToken);
    if (!user) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    await firestoreSet(
      "users",
      user.localId,
      { pin: pin, updatedAt: new Date().toISOString() },
      idToken
    );

    return NextResponse.json({
      success: true,
      message: "PIN berhasil disimpan",
    });
  } catch (error: any) {
    console.error("Save PIN error:", error.message);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan PIN" },
      { status: 401 }
    );
  }
}
