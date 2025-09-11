"use server";

export interface UserProfile {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	gender: string;
	DOB: string;
	[key: string]: any;
}

export interface GetMeError {
	error: string;
	message?: string;
	statusCode?: number;
}

export async function getMe(accessToken: string): Promise<UserProfile | GetMeError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/users/profile`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${accessToken}`,
			},
		});
		const data = await response.json();
		if (!response.ok) {
			return {
				error: data.message || "Không lấy được thông tin người dùng",
				statusCode: response.status,
			};
		}
		return data;
	} catch (error) {
		return {
			error: "Internal Server Error",
		};
	}
}
