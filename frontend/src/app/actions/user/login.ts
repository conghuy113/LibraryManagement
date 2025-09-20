"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { LoginCredentials, LoginResponse, ErrorResponse } from "@/types";


export async function login(credentials: LoginCredentials): Promise<LoginResponse | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.API_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Login response data:', data);
        return data as LoginResponse;
    } catch (error) {
        console.log('Login error:', error);
        return {
            message: 'Có lỗi xảy ra khi đăng nhập',
            error: 'Internal Server Error',
            statusCode: 500,
        };
    }
}
