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
export interface LegacyBook {
  id: number;
  title: string;
  author: string;
  category: string;
  publishYear: number;
  coverImage: string;
  available: boolean;
  bookCoverId?: number;
  bookTypeId?: number;
  bookCover?: BookCover;
  bookType?: TypeBook;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  DOB: Date;
  gender: 'male' | 'female' | 'other';
}

export interface LoginCredentials {
  email: string;
  password: string;
}
