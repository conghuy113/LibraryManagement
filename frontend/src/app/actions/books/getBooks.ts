"use server";

import { TypeBook, BookCover, Book } from "@/types";

interface ApiResponse<T> {
  message?: string;
  status?: number;
  data?: T;
  items?: T[];
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Helper function to get auth headers
function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T | ErrorResponse> {
  const data = await response.json();
  if (!response.ok) {
    return {
      message: data.message || 'Có lỗi xảy ra',
      error: data.error,
      statusCode: response.status,
    } as ErrorResponse;
  }
  return data as T;
}

// GET endpoints
export async function getAllCoverBooks(token: string): Promise<ApiResponse<BookCover[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/all-cover-books`, {
      method: 'GET',
      headers: getAuthHeaders(token),
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

export async function getAllTypeBooks(token: string): Promise<ApiResponse<TypeBook[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/all-type-books`, {
      method: 'GET',
      headers: getAuthHeaders(token),
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

export async function getAllBooks(token: string): Promise<ApiResponse<Book[]> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/all-books`, {
      method: 'GET',
      headers: getAuthHeaders(token),
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

// POST endpoints
export interface CreateBookCoverDto {
  title: string;
  authorName: string;
  publicationYear: string;
  publisher: string;
  typeBookId: string;
  image: string;
}

export async function createCoverBook(token: string, data: CreateBookCoverDto): Promise<ApiResponse<BookCover> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/create-cover-book`, {
      method: 'POST',
      headers: getAuthHeaders(token),
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

export interface CreateTypeBookDto {
  name: string;
  description: string;
}

export async function createTypeBook(token: string, data: CreateTypeBookDto): Promise<ApiResponse<TypeBook> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/create-type-book`, {
      method: 'POST',
      headers: getAuthHeaders(token),
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

export interface CreateBookDto {
  idBook: string;
  importDate: string; // DD-MM-YYYY format from backend
  index: string;
  idBookCover: string;
}

export async function createBook(token: string, data: CreateBookDto): Promise<ApiResponse<Book> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/books/create-book`, {
      method: 'POST',
      headers: getAuthHeaders(token),
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
