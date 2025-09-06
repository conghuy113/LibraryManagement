export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  publishYear: number;
  coverImage: string;
  available: boolean;
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
