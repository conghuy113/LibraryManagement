"use client";

import { useState, FormEvent } from "react";
import { Book } from "@/types";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Mock data for demonstration
const mockBooks: Book[] = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programming",
    publishYear: 2008,
    coverImage: "/books/clean-code.jpg",
    available: true,
  },
  {
    id: 2,
    title: "Design Patterns",
    author: "Erich Gamma",
    category: "Software Engineering",
    publishYear: 1994,
    coverImage: "/books/design-patterns.jpg",
    available: true,
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Andy Hunt",
    category: "Programming",
    publishYear: 1999,
    coverImage: "/books/pragmatic-programmer.jpg",
    available: false,
  },
  // Thêm sách mẫu để kiểm tra giao diện
  ...Array(8).fill(null).map((_, index) => ({
    id: index + 4,
    title: `Sample Book ${index + 1}`,
    author: `Author ${index + 1}`,
    category: index % 2 === 0 ? "Fiction" : "Non-fiction",
    publishYear: 2020 + index,
    coverImage: "/books/default-book.jpg",
    available: index % 3 === 0,
  })),
];

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 bg-gray-200 relative">
        {/* Placeholder cho hình ảnh sách */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              book.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {book.available ? "Có sẵn" : "Đã mượn"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
            {book.category}
          </span>
          <span>{book.publishYear}</span>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Lấy danh sách category duy nhất từ books
  const categories = ["all", ...Array.from(new Set(mockBooks.map((book) => book.category)))];

  // Lọc sách theo search term và category
  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Thư viện sách</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Tất cả thể loại" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid hiển thị sách */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Hiển thị thông báo khi không tìm thấy sách */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sách phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
