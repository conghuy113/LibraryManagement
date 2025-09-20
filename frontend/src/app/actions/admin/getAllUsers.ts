"use server";
import { cookies } from 'next/headers';
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  DOB: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'reader';
  status: 'verified' | 'not_verified' | 'banned';
  createdAt: string;
  updatedAt: string;
  deleted_at: string | null;
}

interface GetAllUsersResponse {
  users: User[];
  totalUsers: number;
}

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export async function getAllUsers(): Promise<GetAllUsersResponse | ErrorResponse> {
  try {
    const cookie = await cookies();
    const accessToken = cookie.get('accessToken')?.value;

    if (!accessToken) {
      return {
        message: 'Access token not found',
        error: 'Unauthorized',
        statusCode: 401
      };
    }

    const response = await fetch(`${process.env.API_BACKEND_URL}/users/all-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    
    if (!response.ok) {
      return {
        message: data.message || 'Failed to get users',
        error: data.error || 'Error',
        statusCode: response.status
      };
    }

    return {
      users: data.items || data || [],
      totalUsers: data.count || data.length || 0
    };
  } catch (error) {
    console.error('Get all users error:', error);
    return {
      message: 'Internal Server Error',
      error: 'Network Error',
      statusCode: 500
    };
  }
}