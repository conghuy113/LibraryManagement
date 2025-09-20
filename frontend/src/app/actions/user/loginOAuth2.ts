"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { LoginOAuth2Response, LoginOAuth2ErrorResponse } from "@/types";


export async function loginOAuth2(code: string): Promise<LoginOAuth2Response | LoginOAuth2ErrorResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        message: data.message || 'Đăng nhập Google thất bại',
        error: data.error || 'Bad Request',
      };
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      ...(data.role && { role: data.role })
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Có lỗi xảy ra khi đăng nhập với Google',
      error: 'Internal Server Error',
    };
  }
}
