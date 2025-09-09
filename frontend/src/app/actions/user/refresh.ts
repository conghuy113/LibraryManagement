"use server";
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export async function refreshToken(token: string): Promise<RefreshResponse | ErrorResponse> {
  try {
    const response = await fetch(`${process.env.API_BACKEND_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token }),
    });

    const data = await response.json();

    if (!response.ok || response.status !== 200) {
      return data as ErrorResponse;
    }
    return data as RefreshResponse;
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi làm mới token',
      error: 'Internal Server Error',
      statusCode: 500,
    };
  }
}
