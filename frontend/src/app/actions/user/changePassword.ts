"use server";

interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

export const changePassword = async (accessToken: string, data: ChangePasswordDTO) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        // Check if response is ok
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
            
            // Handle backend response format: { message: string, status: number }
            if (result.status && result.status !== 200) {
                return {
                    statusCode: result.status,
                    message: result.message || 'Change password failed'
                };
            }
            
            return result;
        } else {
            // If response is not JSON, assume success for 2xx status codes
            return {
                message: 'Password changed successfully',
                status: 200
            };
        }

    } catch (error: any) {
        console.error('Change password error:', error);
        return {
            statusCode: error.statusCode || 500,
            message: error.message || 'Network error or server is unavailable'
        };
    }
};