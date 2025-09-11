"use server";
export interface LoginOAuth2Response {
  accessToken: string;
  refreshToken: string;
}

export interface LoginOAuth2ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export async function loginOAuth2(code: string): Promise<LoginOAuth2Response | LoginOAuth2ErrorResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Có lỗi xảy ra khi đăng nhập với Google',
      error: 'Internal Server Error',
    };
  }
}
