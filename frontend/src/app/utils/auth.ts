"use server";

import { ErrorResponse } from "@/types";


export async function handleApiResponse<T>(response: Response): Promise<T | ErrorResponse> {
  const data = await response.json();
  if (response && !response.ok) {
    return {
      message: data.message || 'Có lỗi xảy ra',
      error: data.error,
      statusCode: response.status,
    } as ErrorResponse;
  }
  return data as T;
}

export async function getAuthHeaders(token?:string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}
