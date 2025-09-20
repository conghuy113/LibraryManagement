"use server";

import { ErrorResponse, UpdateUserPayload } from '@/types';
import { getAuthHeaders } from '@/app/utils/auth';

interface SuccessResponse {
  message: string;
  user: any;
}


export async function updateUserAdmin(payload: UpdateUserPayload): Promise<SuccessResponse | ErrorResponse> {
  try {
    const { cookies } = await import('next/headers');
    const accessToken = (await cookies()).get('accessToken')?.value;

    if (!accessToken) {
      return {
        message: 'Access token not found',
        error: 'Unauthorized',
        statusCode: 401
      };
    }

    // Only send fields that are allowed
    const body: any = { id: payload.id };
    if (payload.role) body.role = payload.role;
    if (payload.status) body.status = payload.status;

    const response = await fetch(`${process.env.API_BACKEND_URL}/users/update-user-admin`, {
      method: 'POST',
      headers: await getAuthHeaders(accessToken),
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || 'Failed to update user',
        error: data.error || 'Error',
        statusCode: response.status
      };
    }

    return {
      message: data.message || 'User updated successfully',
      user: data.user || data
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      message: 'Internal Server Error',
      error: 'Network Error',
      statusCode: 500
    };
  }
}
