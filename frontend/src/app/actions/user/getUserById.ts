"use server";

import { getAuthHeaders, handleApiResponse } from "@/app/utils/auth";
import { ApiResponse, ErrorResponse } from "@/types";

export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  DOB?: string;
  phoneNumber?: string;
  status?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserById(token: string, userId: string): Promise<UserProfile | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/users/get-user-by-id`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify({ id: userId }),
    });
    const dr = await handleApiResponse<UserProfile>(response);
    console.log("Get user by ID response:", dr);
    return dr;
  } catch (error) {
    console.log("Error getting user by ID:", error);
    return {
      message: 'Có lỗi xảy ra khi lấy thông tin người dùng',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}