// ====================================================================
// CORE ENTITY INTERFACES
// ====================================================================

export interface TypeBook {
  _id: string;
  name: string; // Tên loại sách
  description: string; // Mô tả loại sách
  createdAt: Date;
  updatedAt: Date;
}

export interface BookCover {
  _id: string;
  title: string;
  authorName: string;
  publicationYear: string; // Year as string to match backend
  publisher: string;
  typeBookId: string;
  image?: string; // URL ảnh bìa (optional)
  typeBook?: TypeBook; // Populated relation
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  _id: string;
  idBook: string; // Mã sách nội bộ
  importDate: Date;
  status: string;
  index: string; // Vị trí/ký hiệu lưu kho
  idBookCover: string; // ID bìa sách
  bookCover?: BookCover; // Populated relation
  createdAt: Date;
  updatedAt: Date;
}

// Keep old interfaces for backward compatibility if needed

// ====================================================================
// ADMIN USER INTERFACE
// ====================================================================

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  DOB: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'reader';
  status: 'verified' | 'not_verified' | 'banned';
  createdAt: string;
  updatedAt: string;
  deleted_at: string | null;
}

// ====================================================================
// API RESPONSE INTERFACES
// ====================================================================

export interface ApiResponse<T> {
  message?: string;
  status?: number;
  data?: T;
  items?: T[];
}

export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// ====================================================================
// AUTHENTICATION INTERFACES
// ====================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginOAuth2Response {
  accessToken: string;
  refreshToken: string;
  role?: string;
}

export interface LoginOAuth2ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export interface LogoutResponse {
  message: string;
  status: number;
}

// ====================================================================
// USER PROFILE INTERFACES
// ====================================================================

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

// ====================================================================
// USER REGISTRATION INTERFACES
// ====================================================================

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  DOB: string;
}

export interface RegisterSuccess {
  message?: string;
  [key: string]: any;
}

export interface RegisterError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ====================================================================
// USER VERIFICATION INTERFACES
// ====================================================================

export interface VerifyResult {
  message: string;
  statusCode: number;
}

export interface VerifyError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ====================================================================
// USER UPDATE INTERFACES
// ====================================================================

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  DOB?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

// ====================================================================
// ADMIN UPDATE USER INTERFACES
// ====================================================================

export interface UpdateUserPayload {
  id: string;
  role?: 'manager' | 'reader';
  status?: 'verified' | 'banned';
}



export interface GetAllUsersResponse {
  users: AdminUser[];
  totalUsers: number;
}

// ====================================================================
// BOOK COVER DTO INTERFACES
// ====================================================================

export interface CreateBookCoverDto {
  title: string;
  authorName: string;
  publicationYear: string;
  publisher: string;
  typeBookId: string;
  image: string;
}

export interface UpdateCoverBookDto {
  id: string;
  title?: string;
  authorName?: string;
  publicationYear?: string;
  publisher?: string;
  typeBookId?: string;
  image?: string;
}

export interface DeleteCoverBookDto {
  id: string;
}

// ====================================================================
// TYPE BOOK DTO INTERFACES
// ====================================================================

export interface CreateTypeBookDto {
  name: string;
  description: string;
}

export interface UpdateTypeBookDto {
  name: string;
  description: string;
}

// ====================================================================
// BOOK DTO INTERFACES
// ====================================================================

export interface CreateBookDto {
  idBook: string;
  importDate: string; // DD-MM-YYYY format from backend
  index: string;
  idBookCover: string;
}

export interface UpdateBookDto {
  id: string;
  idBook?: string;
  importDate?: string; // DD-MM-YYYY format
  index?: string;
  idBookCover?: string;
  status?: string;
}

export interface DeleteBookDto {
  id: string;
}

// ====================================================================
// HISTORY INTERFACES
// ====================================================================

export enum StatusHistory {
  REQUESTED = 'requested',
  REJECTED = 'rejected',
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue'
}

export interface History {
  _id: string;
  idUser: string;
  idBook: string;
  borrowDate: Date;
  returnDate: Date;
  actualReturnDate: Date | null;
  status: StatusHistory;
  book?: Book; // Populated relation
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// HISTORY DTO INTERFACES
// ====================================================================

export interface CreateHistoryDto {
  bookId: string;
  numberDate: number;
}