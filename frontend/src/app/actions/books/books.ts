"use server";

import { getAuthHeaders, handleApiResponse } from "@/app/utils/auth";
import { ApiResponse, Book, CreateBookDto, UpdateBookDto, DeleteBookDto, ErrorResponse } from "@/types";


// GET endpoints
export async function getAllBooks(token: string): Promise<ApiResponse<Book[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/all-books`, {
      method: 'GET',
      headers: await getAuthHeaders(token),
      cache: 'no-store',
    });

    return await handleApiResponse<ApiResponse<Book[]>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi lấy danh sách sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function createBook(token: string, data: CreateBookDto): Promise<ApiResponse<Book> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/create-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<Book>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi tạo sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function updateBook(token: string, data: UpdateBookDto): Promise<ApiResponse<Book> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/update-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<Book>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi cập nhật sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function deleteBook(token: string, data: DeleteBookDto): Promise<ApiResponse<any> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/delete-book`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return await handleApiResponse<ApiResponse<any>>(response);
  } catch (error) {
    return {
      message: 'Có lỗi xảy ra khi xóa sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}
