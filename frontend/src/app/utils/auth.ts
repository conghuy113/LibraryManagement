"use client";

interface DecodedToken {
  role?: string;
  id?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    // Decode JWT token (phần payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export function getUserRoleFromToken(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.role || null;
}