"use server";

import { UpdateUserDTO } from "@/types";

export const updateUser = async (accessToken: string, data: UpdateUserDTO) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/update-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        // Check if response is ok first
        if (!response.ok) {
            // Try to parse error response
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            
            return {
                statusCode: response.status,
                message: errorMessage
            };
        }

        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
           
            return result;
        } else {
            // If response is not JSON, assume success for 2xx status codes
            return {
                message: 'Profile updated successfully',
                status: 200
            };
        }

    } catch (error: any) {
        console.error('Update user error:', error);
        return {
            statusCode: error.statusCode || 500,
            message: error.message || 'Network error or server is unavailable'
        };
    }
};