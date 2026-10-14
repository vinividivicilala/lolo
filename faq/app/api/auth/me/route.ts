import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token diperlukan" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await adminAuth.getUser(uid);
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        hasPin: !!userData?.pin,
        createdAt: userData?.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Token tidak valid" },
      { status: 401 }
    );
  }
}