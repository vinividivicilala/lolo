import { NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';

const CHATBOT_EMAIL = 'faridardiansyah061@gmail.com';

export function middleware(request) {
  // Cek jika user mencoba akses route admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Di implementasi nyata, Anda harus verify token Firebase
    // Untuk sekarang, kita akan redirect ke sign-in
    const isAuthenticated = false; // Ganti dengan logic auth sebenarnya
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in?redirect=' + request.nextUrl.pathname, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
