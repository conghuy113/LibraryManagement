"use server";
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse | ErrorResponse> {
    try {
        const response = await fetch(`${process.env.API_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        if (!response.ok) {
            return data as ErrorResponse;
        }
        return data as LoginResponse;
    } catch (error) {
        return {
            message: 'Có lỗi xảy ra khi đăng nhập',
            error: 'Internal Server Error',
            statusCode: 500,
        };
    }
}
