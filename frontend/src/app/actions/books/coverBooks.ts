"use server";

import { getAuthHeaders } from "@/app/utils/auth";
import { ApiResponse, BookCover, CreateBookCoverDto, DeleteCoverBookDto, ErrorResponse, UpdateCoverBookDto } from "@/types";
import { handleApiResponse } from "@/app/utils/auth";
// GET endpoints
export async function getAllCoverBooks(token: string): Promise<ApiResponse<BookCover[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/all-cover-books`, {
      method: 'GET',
      headers: await getAuthHeaders(token),
      cache: 'no-store',
    });

    return await handleApiResponse<ApiResponse<BookCover[]>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi lấy danh sách bìa sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function createCoverBook(token: string, data: CreateBookCoverDto): Promise<ApiResponse<BookCover> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/create-cover-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<BookCover>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi tạo bìa sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function updateCoverBook(token: string, data: UpdateCoverBookDto): Promise<ApiResponse<BookCover> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/update-cover-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<BookCover>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi cập nhật bìa sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function deleteCoverBook(token: string, data: DeleteCoverBookDto): Promise<ApiResponse<any> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/delete-cover-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const dR = await handleApiResponse<ApiResponse<any>>(response);
    console.log('Delete Cover Book Response:', dR);
    return dR;
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi xóa bìa sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}
