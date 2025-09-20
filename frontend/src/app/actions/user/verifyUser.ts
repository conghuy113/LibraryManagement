"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { VerifyResult, VerifyError } from "@/types";


export async function verifyUser(token: string): Promise<VerifyResult | VerifyError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/auth/email/verify`, {
			method: 'POST',
			headers: await getAuthHeaders(),
			body: JSON.stringify({ token }),
		});
		const data = await response.json();
		if (!response.ok || response.status !== 200) {
			return {
				error: data.message || 'Verify failed',
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
