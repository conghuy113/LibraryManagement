"use server";

export interface VerifyResult {
	message: string;
	statusCode: number;
}

export interface VerifyError {
	error: string;
	message?: string;
	statusCode?: number;
}

export async function verifyUser(token: string): Promise<VerifyResult | VerifyError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/auth/email/verify`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
