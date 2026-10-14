import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, uid } = await req.json();

    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userRecord = await adminAuth.getUser(decodedToken.uid);

      await adminDb.collection("users").doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email: userRecord.email || "",
          displayName:
            userRecord.displayName ||
            userRecord.email?.split("@")[0] ||
            "Pengguna",
          photoURL: userRecord.photoURL || null,
          lastLogin: adminDb.FieldValue.serverTimestamp(),
          updatedAt: adminDb.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
      const userData = userDoc.data();

      return NextResponse.json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          hasPin: !!userData?.pin,
        },
      });
    }

    if (uid) {
      const userRecord = await adminAuth.getUser(uid);
      const userDoc = await adminDb.collection("users").doc(uid).get();
      const userData = userDoc.data();

      return NextResponse.json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          hasPin: !!userData?.pin,
        },
      });
    }

    return NextResponse.json(
      { error: "idToken atau uid diperlukan" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: error.message || "Verifikasi gagal" },
      { status: 401 }
    );
  }
}
