"use server";

export interface RegisterPayload {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	gender: string;
	DOB: string;
}

export interface RegisterSuccess {
	message?: string;
	[key: string]: any;
}

export interface RegisterError {
	error: string;
	message?: string;
	statusCode?: number;
}

export async function register(payload: RegisterPayload): Promise<RegisterSuccess | RegisterError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/auth/register-reader`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		if (!response.ok) {
			return {
				error: data.message || 'Registration failed',
				statusCode: response.status,
			};
		}
		return data;
	} catch (error) {
		return {
			error: 'Internal Server Error',
		};
	}
}
