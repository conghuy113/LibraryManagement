"use server";

export async function logout(accessToken: string, refreshToken: string): Promise<{ message: string } | { error: string }> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/auth/logout`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ refreshToken: refreshToken }),
		});
		const data = await response.json();
		if (!response.ok) {
			return { error: data.message || 'Logout failed' };
		}
		return data;
	} catch (error) {
		return { error: 'Internal Server Error' };
	}
}
