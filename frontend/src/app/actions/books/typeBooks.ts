"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { TypeBook, ApiResponse, ErrorResponse, CreateTypeBookDto, UpdateTypeBookDto } from "@/types";
import { handleApiResponse } from "@/app/utils/auth";
// GET endpoints
export async function getAllTypeBooks(token: string): Promise<ApiResponse<TypeBook[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/all-type-books`, {
      method: 'GET',
      headers: await getAuthHeaders(token),
      cache: 'no-store',
    });

    return await handleApiResponse<ApiResponse<TypeBook[]>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi lấy danh sách loại sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

// POST endpoints
export async function createTypeBook(token: string, data: CreateTypeBookDto): Promise<ApiResponse<TypeBook> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/create-type-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<TypeBook>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi tạo loại sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

// UPDATE TypeBook endpoints
export async function updateTypeBook(token: string, data: UpdateTypeBookDto): Promise<ApiResponse<TypeBook> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/update-type-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<TypeBook>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi cập nhật loại sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}
