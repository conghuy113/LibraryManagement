"use server";

import { RegisterPayload, RegisterSuccess, RegisterError } from "@/types";
import { getAuthHeaders } from "@/app/utils/auth";

export async function register(payload: RegisterPayload): Promise<RegisterSuccess | RegisterError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/auth/register-reader`, {
			method: 'POST',
			headers: await getAuthHeaders(),
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
