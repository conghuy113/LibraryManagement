"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { UserProfile, GetMeError } from "@/types";

export async function getMe(accessToken: string): Promise<UserProfile | GetMeError> {
	try {
		const response = await fetch(`${process.env.API_BACKEND_URL}/users/profile`, {
			method: "GET",
			headers: await getAuthHeaders(accessToken),
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
