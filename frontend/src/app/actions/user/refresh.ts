"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { RefreshResponse, ErrorResponse } from "@/types";


export async function refreshToken(token: string): Promise<RefreshResponse | ErrorResponse> {
  try {
    const response = await fetch(`${process.env.API_BACKEND_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: await getAuthHeaders(),
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
