"use server";

interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    gender?: string;
    DOB?: string;
}

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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update profile');
        }

        return result;
    } catch (error: any) {
        return {
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal server error'
        };
    }
};