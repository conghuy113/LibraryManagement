"use server";

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { refreshToken } from '@/app/actions/user/refresh'

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')
    const refreshTokenCookie = request.cookies.get('refreshToken')

    if (request.nextUrl.pathname === '/' && accessToken) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/home')) {
        if(!refreshTokenCookie) return NextResponse.redirect(new URL('/', request.url))
        
        if(!accessToken) {
            try {
                const response = await refreshToken(refreshTokenCookie.value)
                if ('accessToken' in response) {
                    const res = NextResponse.next()
                    res.cookies.set('accessToken', response.accessToken, {
                        maxAge: 1800, // 30 phút
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax'
                    })
                    res.cookies.set('refreshToken', response.refreshToken, {
                        maxAge: 25200, // 7 giờ
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax'
                    })
                    
                    return res
                }
            } catch (error) {
                // Nếu refresh thất bại, xóa refresh token và redirect về login
                const res = NextResponse.redirect(new URL('/', request.url))
                res.cookies.delete('refreshToken')
                return res
            }
        }
    }
    return NextResponse.next()
}

// Cấu hình các đường dẫn cần kiểm tra middleware
export const config = {
  matcher: ['/', '/home/:path*']
}
