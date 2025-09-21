"use server";

import { getAuthHeaders, handleApiResponse } from "@/app/utils/auth";
import { ApiResponse, CreateHistoryDto, ErrorResponse, Book, BookCover, TypeBook } from "@/types";



export async function createHistory(token: string, data: CreateHistoryDto): Promise<ApiResponse<any> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/history/add-history`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    const dr = await handleApiResponse<ApiResponse<any>>(response);
    console.log("Create history response:", dr);
    return dr;
  } catch (error) {
    console.log("Error creating history:", error);
    return {
      message: 'Có lỗi xảy ra khi tạo yêu cầu thuê sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function getMyHistory(token: string): Promise<ApiResponse<any> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/history/my-history`, {
      method: 'GET',
      headers: await getAuthHeaders(token),
    });
    const dr = await handleApiResponse<ApiResponse<any>>(response);
    console.log("Get my history response:", dr);
    return dr;
  } catch (error) {
    console.log("Error getting my history:", error);
    return {
      message: 'Có lỗi xảy ra khi lấy lịch sử thuê sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function getBookDetail(token: string, id: string): Promise<ApiResponse<Book & { coverBook?: BookCover; typeBook?: TypeBook }> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/books/get-book-detail`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify({ id }),
    });
    const dr = await handleApiResponse<ApiResponse<Book & { coverBook?: BookCover; typeBook?: TypeBook }>>(response);
    console.log("Get book detail response:", dr);
    return dr;
  } catch (error) {
    console.log("Error getting book detail:", error);
    return {
      message: 'Có lỗi xảy ra khi lấy thông tin chi tiết sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}


export async function getAllBorrowHistory(token: string): Promise<{ count: number; items: any[] } | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/history/all-history`, {
      method: 'GET',
      headers: await getAuthHeaders(token),
    });
    const dr = await handleApiResponse<{ count: number; items: any[] }>(response);
    console.log("Get all borrow history response:", dr);
    return dr;
  } catch (error) {
    console.log("Error getting all borrow history:", error);
    return {
      message: 'Có lỗi xảy ra khi lấy lịch sử mượn sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

export async function handleBorrowRequest(token: string, historyId: string, approve: boolean): Promise<ApiResponse<any> | ErrorResponse> {
  try {
    const apiUrl = process.env.API_BACKEND_URL as string;
    const response = await fetch(`${apiUrl}/history/handle-request`, {
      method: 'POST',
      headers: await getAuthHeaders(token),
      body: JSON.stringify({ historyId, approve }),
    });
    const dr = await handleApiResponse<ApiResponse<any>>(response);
    console.log("Handle borrow request response:", dr);
    return dr;
  } catch (error) {
    console.log("Error handling borrow request:", error);
    return {
      message: 'Có lỗi xảy ra khi xử lý yêu cầu mượn sách',
      error: 'Network Error',
      statusCode: 500,
    };
  }
}

// Legacy functions - kept for backward compatibility but will use the new unified endpoint
export async function approveBorrowRequest(token: string, requestId: string): Promise<ApiResponse<any> | ErrorResponse> {
  return handleBorrowRequest(token, requestId, true);
}

export async function rejectBorrowRequest(token: string, requestId: string): Promise<ApiResponse<any> | ErrorResponse> {
  return handleBorrowRequest(token, requestId, false);
}