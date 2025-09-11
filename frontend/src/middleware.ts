"use server";

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Redirect từ root page nếu đã đăng nhập
  if (request.nextUrl.pathname === '/' && accessToken) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Bảo vệ trang admin - chỉ cho phép admin truy cập
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Bảo vệ trang home - ngăn admin truy cập
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Bảo vệ trang profile
  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/home/:path*', '/admin/:path*', '/profile/:path*']
}
