import { NextRequest, NextResponse } from "next/server";
import { authLookup, firestoreSet } from "@/lib/firebaseRest";

// ⚠️ WAJIB: paksa route jadi dynamic (tidak di-prerender saat build)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body dengan aman
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body harus berupa JSON" },
        { status: 400 }
      );
    }

    const { idToken, pin } = body;

    // 2. Validasi input
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken wajib diisi" },
        { status: 400 }
      );
    }

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { error: "PIN wajib diisi" },
        { status: 400 }
      );
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN harus 6 digit angka" },
        { status: 400 }
      );
    }

    // 3. Verifikasi token → ambil user
    let user: any;
    try {
      user = await authLookup(idToken);
    } catch (error: any) {
      console.error("authLookup error:", error.message);
      return NextResponse.json(
        { error: "Token tidak valid atau sudah kadaluarsa" },
        { status: 401 }
      );
    }

    if (!user || !user.localId) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 4. Simpan PIN ke Firestore
    try {
      await firestoreSet(
        "users",
        user.localId,
        {
          pin: pin,
          updatedAt: new Date().toISOString(),
        },
        idToken
      );
    } catch (error: any) {
      console.error("firestoreSet error:", error.message);

      // Deteksi error Firestore Rules
      if (error.message?.toLowerCase().includes("permission")) {
        return NextResponse.json(
          { error: "Tidak punya izin menyimpan PIN. Cek Firestore Rules." },
          { status: 403 }
        );
      }

      throw error;
    }

    // 5. Return sukses
    return NextResponse.json({
      success: true,
      message: "PIN berhasil disimpan",
    });
  } catch (error: any) {
    console.error("Save PIN error:", error.message);

    return NextResponse.json(
      { error: error.message || "Gagal menyimpan PIN" },
      { status: 500 }
    );
  }
}
