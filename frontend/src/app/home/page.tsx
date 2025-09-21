"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, BookCover, CreateBookCoverDto, CreateBookDto, DeleteCoverBookDto, TypeBook, UpdateCoverBookDto, UpdateBookDto, DeleteBookDto, History } from "@/types";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { 
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} from "@/app/actions/books/books";
import { 
  getAllCoverBooks,
  createCoverBook,
  updateCoverBook,
  deleteCoverBook,
} from "@/app/actions/books/coverBooks";
import { 
  getAllTypeBooks,
  createTypeBook,
  updateTypeBook,
} from "@/app/actions/books/typeBooks";
import { createHistory, getMyHistory, getBookDetail, getAllBorrowHistory, handleBorrowRequest, approveBorrowRequest, rejectBorrowRequest } from "@/app/actions/history/history";
import { getUserById, UserProfile } from "@/app/actions/user/getUserById";
import { refreshToken } from "@/app/actions/user/refresh";
import Cookies from "js-cookie";
import { Library, User, LogOut, Home, BookOpen, Users, Shield } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { showConfirm } from "@/utils/dialog";
import toast, { Toaster } from 'react-hot-toast';
import {
  CreateTypeBookDto,
  UpdateTypeBookDto,
  CreateHistoryDto
} from "@/types";

// Enum for book index positions
export enum IndexBook {
  A_1 = 'A1',
  B_2 = 'B2', 
  C_3 = 'C3',
  D_4 = 'D4',
}

// Error checking function
function isErrorResponse(response: any): response is { message: string; statusCode?: number } {
  return response && typeof response.message === 'string';
}

// Helper function to format date
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Helper function to get status color
function getHistoryStatusColor(status: string): string {
  switch (status) {
    case 'requested':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'borrowed':
      return 'bg-green-100 text-green-800';
    case 'returned':
      return 'bg-gray-100 text-gray-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get status text
function getHistoryStatusText(status: string): string {
  switch (status) {
    case 'requested':
      return 'Đã yêu cầu';
    case 'borrowed':
      return 'Đang mượn';
    case 'returned':
      return 'Đã trả';
    case 'overdue':
      return 'Quá hạn';
    default:
      return status;
  }
}

// Modal Components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <button
          onClick={onClose}
          className="float-right text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// Create Book Cover Modal
function CreateBookCoverModal({ isOpen, onClose, onSave, typeBooks, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cover: Omit<BookCover, '_id' | 'createdAt' | 'updatedAt'>) => void;
  typeBooks: TypeBook[];
  loading?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [typeBookId, setTypeBookId] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ title, authorName, publicationYear, publisher, typeBookId, image });
    setTitle("");
    setAuthorName("");
    setPublicationYear("");
    setPublisher("");
    setTypeBookId("");
    setImage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">Tạo bìa sách mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tiêu đề sách</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tên tác giả</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Năm xuất bản</label>
          <input
            type="text"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            pattern="^\d{4}$"
            title="Nhập năm 4 chữ số"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nhà xuất bản</label>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Loại sách</label>
          <select
            value={typeBookId}
            onChange={(e) => setTypeBookId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn loại sách</option>
            {typeBooks.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">URL hình ảnh</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Đang tạo...' : 'Tạo'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Create Book Type Modal
function CreateTypeBookModal({ isOpen, onClose, onSave, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: Omit<TypeBook, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">Tạo loại sách mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tên loại sách</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Update Book Type Modal
function UpdateTypeBookModal({ isOpen, onClose, onSave, typeBook, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateTypeBookDto) => void;
  typeBook: TypeBook | null;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Initialize form with existing data when typeBook changes
  useEffect(() => {
    if (typeBook) {
      setName(typeBook.name);
      setDescription(typeBook.description);
    }
  }, [typeBook]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Only send the original name and updated description
    onSave({ name: typeBook?.name || name, description });
    onClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h3 className="text-lg font-semibold mb-4">Cập nhật loại sách</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tên loại sách</label>
          <input
            type="text"
            value={name}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            disabled
            title="Không thể thay đổi tên loại sách"
          />
          <p className="text-xs text-gray-500 mt-1">Tên loại sách không thể thay đổi</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Update Book Cover Modal
function UpdateCoverBookModal({ isOpen, onClose, onSave, coverBook, typeBooks, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateCoverBookDto) => void;
  coverBook: BookCover | null;
  typeBooks: TypeBook[];
  loading?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [typeBookId, setTypeBookId] = useState("");
  const [image, setImage] = useState("");

  // Initialize form with existing data when coverBook changes
  useEffect(() => {
    if (coverBook) {
      setTitle(coverBook.title);
      setAuthorName(coverBook.authorName);
      setPublicationYear(coverBook.publicationYear);
      setPublisher(coverBook.publisher);
      setTypeBookId(coverBook.typeBookId);
      setImage(coverBook.image || "");
    }
  }, [coverBook]);

  // Check if form has changes
  const hasChanges = coverBook ? (
    title !== coverBook.title ||
    authorName !== coverBook.authorName ||
    publicationYear !== coverBook.publicationYear ||
    publisher !== coverBook.publisher ||
    typeBookId !== coverBook.typeBookId ||
    image !== (coverBook.image || "")
  ) : false;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!coverBook || !hasChanges) return;

    const updateData: UpdateCoverBookDto = {
      id: coverBook._id,
    };

    // Only include changed fields
    if (title !== coverBook.title) updateData.title = title;
    if (authorName !== coverBook.authorName) updateData.authorName = authorName;
    if (publicationYear !== coverBook.publicationYear) updateData.publicationYear = publicationYear;
    if (publisher !== coverBook.publisher) updateData.publisher = publisher;
    if (typeBookId !== coverBook.typeBookId) updateData.typeBookId = typeBookId;
    if (image !== (coverBook.image || "")) updateData.image = image;

    onSave(updateData);
    onClose();
  };

  const handleClose = () => {
    if (coverBook) {
      setTitle(coverBook.title);
      setAuthorName(coverBook.authorName);
      setPublicationYear(coverBook.publicationYear);
      setPublisher(coverBook.publisher);
      setTypeBookId(coverBook.typeBookId);
      setImage(coverBook.image || "");
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h3 className="text-lg font-semibold mb-4">Cập nhật bìa sách</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tiêu đề sách</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tên tác giả</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Năm xuất bản</label>
          <input
            type="text"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            pattern="^\d{4}$"
            title="Nhập năm 4 chữ số"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nhà xuất bản</label>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Loại sách</label>
          <select
            value={typeBookId}
            onChange={(e) => setTypeBookId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn loại sách</option>
            {typeBooks.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">URL hình ảnh</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            title={!hasChanges ? "Không có thông tin nào thay đổi" : ""}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang cập nhật...
              </>
            ) : 'Cập nhật'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Create Book Modal
function CreateBookModal({ isOpen, onClose, onSave, bookCovers, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Omit<Book, '_id' | 'createdAt' | 'updatedAt'>) => void;
  bookCovers: BookCover[];
  loading?: boolean;
}) {
  const [idBook, setIdBook] = useState("");
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [index, setIndex] = useState("");
  const [idBookCover, setIdBookCover] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      idBook,
      importDate: new Date(importDate),
      status: "available", // Default status for new books
      index,
      idBookCover,
    });
    setIdBook("");
    setImportDate(new Date().toISOString().split('T')[0]);
    setIndex("");
    setIdBookCover("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">Tạo sách mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Chọn bìa sách</label>
          <select
            value={idBookCover}
            onChange={(e) => setIdBookCover(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn bìa sách</option>
            {bookCovers.map((cover) => (
              <option key={cover._id} value={cover._id}>
                {cover.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mã sách</label>
          <input
            type="text"
            value={idBook}
            onChange={(e) => setIdBook(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="VD: BK001"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ngày nhập</label>
          <input
            type="date"
            value={importDate}
            onChange={(e) => setImportDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Vị trí lưu kho</label>
          <select
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn vị trí lưu kho</option>
            {Object.values(IndexBook).map((indexValue) => (
              <option key={indexValue} value={indexValue}>
                {indexValue}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Update Book Modal
function UpdateBookModal({ isOpen, onClose, onSave, book, bookCovers, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateBookDto) => void;
  book: Book | null;
  bookCovers: BookCover[];
  loading?: boolean;
}) {
  const [idBook, setIdBook] = useState("");
  const [importDate, setImportDate] = useState("");
  const [index, setIndex] = useState("");
  const [idBookCover, setIdBookCover] = useState("");
  const [status, setStatus] = useState("");

  // Initialize form with existing data when book changes
  useEffect(() => {
    if (book) {
      setIdBook(String(book.idBook));
      setImportDate(new Date(book.importDate).toISOString().split('T')[0]);
      setIndex(String(book.index));
      setIdBookCover(String(book.idBookCover));
      setStatus(String(book.status));
    }
  }, [book]);

  // Check if form has changes
  const hasChanges = book ? (
    String(idBook) !== String(book.idBook) ||
    importDate !== new Date(book.importDate).toISOString().split('T')[0] ||
    String(index) !== String(book.index) ||
    String(idBookCover) !== String(book.idBookCover) ||
    String(status) !== String(book.status)
  ) : false;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!book || !hasChanges) return;

    const updateData: UpdateBookDto = {
      id: book._id,
    };

    // Only include changed fields - ensure all values are strings and properly formatted
    if (String(idBook) !== String(book.idBook)) {
      updateData.idBook = String(idBook);
    }
    
    if (importDate !== new Date(book.importDate).toISOString().split('T')[0]) {
      // Ensure proper DD-MM-YYYY format
      const dateObj = new Date(importDate);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      updateData.importDate = `${day}-${month}-${year}`;
    }
    
    if (String(index) !== String(book.index)) {
      updateData.index = String(index);
    }
    
    if (String(idBookCover) !== String(book.idBookCover)) {
      updateData.idBookCover = String(idBookCover);
    }
    
    if (String(status) !== String(book.status)) {
      updateData.status = String(status);
    }

    onSave(updateData);
    onClose();
  };

  const handleClose = () => {
    if (book) {
      setIdBook(String(book.idBook));
      setImportDate(new Date(book.importDate).toISOString().split('T')[0]);
      setIndex(String(book.index));
      setIdBookCover(String(book.idBookCover));
      setStatus(String(book.status));
    }
    onClose();
  };

  const statusOptions = [
    { value: 'available', label: 'Có sẵn' },
    { value: 'borrowed', label: 'Đã mượn' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'lost', label: 'Mất' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h3 className="text-lg font-semibold mb-4">Cập nhật sách</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Bìa sách</label>
          <select
            value={idBookCover}
            onChange={(e) => setIdBookCover(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn bìa sách</option>
            {bookCovers.map((cover) => (
              <option key={cover._id} value={cover._id}>
                {cover.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mã sách</label>
          <input
            type="text"
            value={idBook}
            onChange={(e) => setIdBook(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="VD: BK001"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ngày nhập</label>
          <input
            type="date"
            value={importDate}
            onChange={(e) => setImportDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Vị trí lưu kho</label>
          <select
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn vị trí lưu kho</option>
            {Object.values(IndexBook).map((indexValue) => (
              <option key={indexValue} value={indexValue}>
                {indexValue}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn trạng thái</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !hasChanges}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            title={!hasChanges ? "Không có thông tin nào thay đổi" : ""}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang cập nhật...
              </>
            ) : 'Cập nhật'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}

// User Profile Modal
function UserProfileModal({ isOpen, onClose, userProfile, loading = false }: {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  loading?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">Thông tin người dùng</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
        </div>
      ) : userProfile ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {userProfile.firstName?.charAt(0) || userProfile.lastName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {`${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Không có tên'}
              </h4>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{userProfile._id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <p className="text-sm text-gray-900">{userProfile.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ:</label>
              <p className="text-sm text-gray-900">{userProfile.firstName || 'Chưa cập nhật'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên:</label>
              <p className="text-sm text-gray-900">{userProfile.lastName || 'Chưa cập nhật'}</p>
            </div>
            
            {userProfile.gender && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính:</label>
                <p className="text-sm text-gray-900">
                  {userProfile.gender === 'male' ? 'Nam' : 
                   userProfile.gender === 'female' ? 'Nữ' : 'Khác'}
                </p>
              </div>
            )}
            
            {userProfile.phoneNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại:</label>
                <p className="text-sm text-gray-900">{userProfile.phoneNumber}</p>
              </div>
            )}
            
            {userProfile.DOB && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh:</label>
                <p className="text-sm text-gray-900">
                  {new Date(userProfile.DOB).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            
            {userProfile.role && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò:</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userProfile.role === 'admin' ? 'Quản trị viên' : 
                   userProfile.role === 'manager' ? 'Quản lý' : 'Người dùng'}
                </span>
              </div>
            )}
            
            {userProfile.status && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userProfile.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userProfile.status === 'verified' ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo:</label>
              <p className="text-sm text-gray-900">
                {new Date(userProfile.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Không thể tải thông tin người dùng</p>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}

// Card Components
interface BookCoverCardProps {
  cover: BookCover;
  onClick: () => void;
  onEdit?: (cover: BookCover) => void;
  onDelete?: (cover: BookCover) => void;
}

interface HistoryCardProps {
  history: History & { 
    book?: Book;
    bookCover?: BookCover;
    typeBook?: TypeBook;
  };
}

function HistoryCard({ history }: HistoryCardProps) {
  const book = history.book;
  const bookCover = history.bookCover; // Backend directly populates bookCover
  const typeBook = history.typeBook; // Type book information

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 bg-gray-200 relative">
        {bookCover?.image ? (
          <img 
            src={bookCover.image} 
            alt={bookCover.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHistoryStatusColor(history.status)}`}>
            {getHistoryStatusText(history.status)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
          {bookCover?.title || 'Không có tiêu đề'}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          Tác giả: {bookCover?.authorName || 'Không rõ'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Thể loại: {typeBook?.name || 'Không rõ'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Năm xuất bản: {bookCover?.publicationYear || 'Không rõ'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Nhà xuất bản: {bookCover?.publisher || 'Không rõ'}
        </p>
        <p className="text-gray-600 text-sm mb-2">
          Mã sách: {book?.idBook || 'Không rõ'}
        </p>
        <p className="text-gray-600 text-sm mb-3">
          Vị trí: {book?.index || 'Không rõ'}
        </p>
        
        <div className="space-y-1 text-sm border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày mượn:</span>
            <span className="font-medium">
              {history.borrowDate ? formatDate(history.borrowDate) : 'Chưa mượn'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày trả dự kiến:</span>
            <span className="font-medium">
              {history.returnDate ? formatDate(history.returnDate) : 'Chưa xác định'}
            </span>
          </div>
          {history.actualReturnDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày trả thực tế:</span>
              <span className="font-medium">
                {formatDate(history.actualReturnDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookCoverCard({ cover, onClick, availableCount, isManager, onEdit, onDelete }: BookCoverCardProps & { 
  availableCount: number; 
  isManager: boolean; 
}) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 ${
        isManager ? 'cursor-pointer' : ''
      }`}
      onClick={isManager ? onClick : undefined}
    >
      <div className="h-48 bg-gray-200 relative">
        {cover.image ? (
          <img 
            src={cover.image} 
            alt={cover.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
          <svg
            className="w-16 h-16 text-white"
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
        {/* Available count badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            availableCount > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {availableCount > 0 ? `${availableCount} có sẵn` : 'Hết sách'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {cover.title}
        </h3>
        <p className="text-sm text-gray-600 mb-1">Tác giả: {cover.authorName}</p>
        <p className="text-sm text-gray-600 mb-1">NXB: {cover.publisher}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-blue-600">Năm: {cover.publicationYear}</p>
          {cover.typeBook && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              {cover.typeBook.name}
            </span>
          )}
        </div>
        {isManager && (
          <div className="mt-2 text-xs text-gray-500">
            Click để xem chi tiết sách
          </div>
        )}
        {isManager && onEdit && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(cover);
                }}
                className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cover);
                  }}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TypeBookCardProps {
  type: TypeBook;
  onEdit?: (type: TypeBook) => void;
}

function TypeBookCard({ type, onEdit }: TypeBookCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </div>
        </div>
        {onEdit && (
          <div className="flex gap-2 ml-4">
            {/* Only show edit button for managers */}
            <button
              onClick={() => onEdit(type)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface BookCardProps {
  book: Book;
  showCover?: boolean;
  showType?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  showActions?: boolean;
}

interface BorrowRequestCardProps {
  request: any; // Will be properly typed when we get the API structure
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onUserClick: (userId: string) => void;
}

interface BorrowHistoryCardProps {
  history: any; // Will be properly typed when we get the API structure
  onUserClick: (userId: string) => void;
}

function BorrowRequestCard({ request, onApprove, onReject, onUserClick }: BorrowRequestCardProps) {
  // Extract book information from enriched data
  const book = request.book;
  const bookCover = request.bookCover || request.coverBook;
  const typeBook = request.typeBook;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              📖
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              ID: 
              <button
                onClick={() => onUserClick(request.idUser)}
                className="ml-1 text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              >
                {request.idUser}
              </button>
            </h3>
            <p className="text-sm text-gray-500">Mã sách: {book?.idBook || request.idBook}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Chờ duyệt
        </span>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">{bookCover?.title || 'Chưa có thông tin sách'}</h4>
        <p className="text-sm text-gray-600">Tác giả: {bookCover?.authorName || 'N/A'}</p>
        {typeBook && (
          <p className="text-sm text-gray-500">Thể loại: {typeBook.name}</p>
        )}
        <p className="text-sm text-gray-500">
          Ngày yêu cầu: {new Date(request.borrowDate || request.createdAt).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(request._id)}
          className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          Duyệt
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}

function BorrowHistoryCard({ history, onUserClick }: BorrowHistoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BORROWED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RETURNED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'REQUESTED':
        return 'Chờ duyệt';
      case 'BORROWED':
        return 'Đang mượn';
      case 'RETURNED':
        return 'Đã trả';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  // Extract book information from enriched data
  const book = history.book;
  const bookCover = history.bookCover || history.coverBook;
  const typeBook = history.typeBook;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-lg">
              📚
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              ID: 
              <button
                onClick={() => onUserClick(history.idUser)}
                className="ml-1 text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              >
                {history.idUser}
              </button>
            </h3>
            <p className="text-sm text-gray-500">Mã sách: {book?.idBook || history.idBook}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(history.status)}`}>
          {getStatusText(history.status)}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{bookCover?.title || 'Chưa có thông tin sách'}</h4>
        <div className="space-y-1 mb-3">
          <p className="text-sm text-gray-600 flex items-center">
            <span className="w-16 text-gray-500">Tác giả:</span>
            <span className="font-medium">{bookCover?.authorName || 'N/A'}</span>
          </p>
          {typeBook && (
            <p className="text-sm text-gray-600 flex items-center">
              <span className="w-16 text-gray-500">Thể loại:</span>
              <span className="font-medium">{typeBook.name}</span>
            </p>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Ngày mượn</span>
              <p className="font-medium text-gray-900">{new Date(history.borrowDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Hạn trả</span>
              <p className="font-medium text-gray-900">{new Date(history.returnDate).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          
          {history.actualReturnDate && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Ngày trả thực tế</span>
              <p className="font-medium text-gray-900 mt-1">{new Date(history.actualReturnDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
          
          {(history.status?.toUpperCase() === 'REJECTED' || history.status?.toUpperCase() === 'CANCELED') && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Lý do</span>
              <p className="font-medium text-gray-900 mt-1">
                {history.status?.toUpperCase() === 'REJECTED' ? 'Yêu cầu bị từ chối bởi quản lý' : 'Yêu cầu đã bị hủy'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, showCover = false, showType = false, onEdit, onDelete, showActions = false }: BookCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'borrowed':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'borrowed':
        return 'Đã mượn';
      case 'maintenance':
        return 'Bảo trì';
      case 'lost':
        return 'Mất';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 bg-gray-200 relative">
        {book.bookCover?.image ? (
          <img 
            src={book.bookCover.image} 
            alt={book.bookCover.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {book.bookCover?.title|| 'Không có tiêu đề'}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Mã: {book.idBook} | Vị trí: {book.index}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(book.status)}`}>
            {getStatusText(book.status)}
          </span>
        </div>
        
        <div className="space-y-2">
          {book.bookCover && (
            <>
              <p className="text-sm text-gray-600">Tác giả: {book.bookCover.authorName}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {book.bookCover.publisher}
                </span>
                <span>Năm: {book.bookCover.publicationYear}</span>
              </div>
            </>
          )}
          
          {showCover && book.bookCover && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Bìa: {book.bookCover.title}
            </div>
          )}
          
          {showType && book.bookCover?.typeBook && (
            <div className="text-xs text-white bg-blue-500 px-2 py-1 rounded">
              {book.bookCover.typeBook.name}
            </div>
          )}

          <div className="text-xs text-gray-500">
            Nhập: {new Date(book.importDate).toLocaleDateString('vi-VN')}
          </div>

          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sửa
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(book)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { logout, userRole, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'covers' | 'books' | 'types' | 'rental' | 'history' | 'requests' | 'borrowHistory'>('covers');
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showCreateCoverModal, setShowCreateCoverModal] = useState(false);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showCreateBookModal, setShowCreateBookModal] = useState(false);
  const [showUpdateTypeModal, setShowUpdateTypeModal] = useState(false);
  const [showUpdateCoverModal, setShowUpdateCoverModal] = useState(false);
  const [showUpdateBookModal, setShowUpdateBookModal] = useState(false);
  const [selectedTypeForUpdate, setSelectedTypeForUpdate] = useState<TypeBook | null>(null);
  const [selectedCoverForUpdate, setSelectedCoverForUpdate] = useState<BookCover | null>(null);
  const [selectedBookForUpdate, setSelectedBookForUpdate] = useState<Book | null>(null);
  
  // User profile modal states
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  
  // Data states
  const [bookCovers, setBookCovers] = useState<BookCover[]>([]);
  const [typeBooks, setTypeBooks] = useState<TypeBook[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [myHistory, setMyHistory] = useState<(History & { 
    book?: Book;
    bookCover?: BookCover;
    typeBook?: TypeBook;
  })[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
  
  // Rental states
  const [selectedCoverBooks, setSelectedCoverBooks] = useState<Set<string>>(new Set());
  const [rentalDays, setRentalDays] = useState<number>(7);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isManager = userRole === 'manager' || userRole === 'admin';
  const isReader = userRole === null || userRole === undefined; // Reader has no role in cookies

  // Helper function to get valid token with refresh if needed
  const getValidToken = async (): Promise<string | null> => {
    let token = Cookies.get('accessToken');
    
    if (!token) {
      return null;
    }

    return token;

    // For authentication errors, try to refresh the token
    // const refreshTokenValue = Cookies.get('refreshToken');
    // console.log('Refresh token available:', !!refreshTokenValue);
    
    // if (!refreshTokenValue) {
    //   console.log('No refresh token available, returning original token');
    //   return token; // Return original token if no refresh token
    // }

    // try {
    //   const refreshResult = await refreshToken(refreshTokenValue);
    //   if ('accessToken' in refreshResult && refreshResult.accessToken) {
    //     console.log('Token refreshed successfully');
    //     Cookies.set('accessToken', refreshResult.accessToken);
    //     return refreshResult.accessToken;
    //   }
    // } catch (error) {
    //   console.error('Token refresh failed:', error);
    // }

    // return token;
  };

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        await logout();
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Helper function to enrich history data with book details
  const enrichHistoryData = async (token: string, historyList: any[]) => {
    setHistoryLoading(true);
    const enrichedHistory = [];
    
    for (const historyItem of historyList) {
      try {
        // Fetch complete book details using the new consolidated API
        const bookDetailResponse = await getBookDetail(token, historyItem.idBook);
        
        if (!isErrorResponse(bookDetailResponse)) {
          // Check if response has a data wrapper or is the data itself
          const bookDetail = (bookDetailResponse as any).data || bookDetailResponse;
          
          // Check if the response is directly the data we need or wrapped
          let book, bookCover, typeBook;
          
          if ((bookDetail as any).book && (bookDetail as any).coverBook && (bookDetail as any).typeBook) {
            // Response structure: { book: {}, coverBook: {}, typeBook: {} }
            book = (bookDetail as any).book;
            bookCover = (bookDetail as any).coverBook;
            typeBook = (bookDetail as any).typeBook;
          } else if ((bookDetail as any).idBook) {
            // Response is the book itself with nested data
            book = bookDetail;
            bookCover = (bookDetail as any).coverBook;
            typeBook = (bookDetail as any).typeBook;
          } else {
            // Fallback: try to extract from any level
            book = (bookDetail as any).book || bookDetail;
            bookCover = (bookDetail as any).coverBook || null;
            typeBook = (bookDetail as any).typeBook || null;
          }
          
          // Add enriched data to history item
          enrichedHistory.push({
            ...historyItem,
            book,
            bookCover,
            typeBook
          });
        } else {
          // If we can't get book details, add the history item as is
          enrichedHistory.push(historyItem);
        }
      } catch (error) {
        console.error('Error enriching history item:', error);
        // If there's an error, add the history item as is
        enrichedHistory.push(historyItem);
      }
    }
    
    setHistoryLoading(false);
    return enrichedHistory;
  };

  // Handle user ID click to show user profile
  const handleUserIdClick = async (userId: string) => {
    try {
      setUserProfileLoading(true);
      setShowUserProfileModal(true);
      
      const token = Cookies.get('accessToken');
      if (!token) {
        toast.error('Không tìm thấy token đăng nhập');
        setShowUserProfileModal(false);
        return;
      }
      
      const result = await getUserById(token, userId);
      
      // Check if result is an error response
      if ('error' in result) {
        toast.error(result.message || 'Không thể tải thông tin người dùng');
        setShowUserProfileModal(false);
      } else {
        setSelectedUserProfile(result as UserProfile);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng');
      console.error('Error fetching user profile:', error);
      setShowUserProfileModal(false);
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      const token = Cookies.get('accessToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load all data in parallel
        const promises = [
          getAllCoverBooks(token),
          getAllTypeBooks(token),
          getAllBooks(token)
        ];
        
        // Only load history for readers (userRole === null)
        if (userRole === null) {
          promises.push(getMyHistory(token));
        }
        
        const responses = await Promise.all(promises);
        const [coversResponse, typesResponse, booksResponse, historyResponse] = responses;

        // Handle book covers
        if (isErrorResponse(coversResponse)) {
          throw new Error(coversResponse.message);
        }
        const covers = coversResponse.items || coversResponse.data || [];
        let processedCovers = Array.isArray(covers) ? (covers as BookCover[]) : [];
        
        // Handle type books
        if (isErrorResponse(typesResponse)) {
          throw new Error(typesResponse.message);
        }
        const types = typesResponse.items || typesResponse.data || [];
        setTypeBooks(Array.isArray(types) ? (types as TypeBook[]) : []);
        
        // Manually populate typeBook in covers if not populated
        if (processedCovers.length > 0 && !processedCovers[0].typeBook) {
          const typeMap = new Map((types as TypeBook[]).map(type => [type._id, type]));
          
          processedCovers = processedCovers.map(cover => ({
            ...cover,
            typeBook: typeMap.get(cover.typeBookId)
          }));
        }
        
        setBookCovers(processedCovers);

        // Handle books
        if (isErrorResponse(booksResponse)) {
          throw new Error(booksResponse.message);
        }
        const booksList = booksResponse.items || booksResponse.data || [];
        let processedBooks = Array.isArray(booksList) ? (booksList as Book[]) : [];
        
        // If books don't have populated bookCover, manually populate from covers
        if (processedBooks.length > 0 && !processedBooks[0].bookCover) {
          const covers = coversResponse.items || coversResponse.data || [];
          const coverMap = new Map((covers as BookCover[]).map(cover => [cover._id, cover]));
          
          processedBooks = processedBooks.map(book => ({
            ...book,
            bookCover: coverMap.get(book.idBookCover)
          }));
        }
        
        setBooks(processedBooks);

        // Handle history for readers
        if (userRole === null && historyResponse && !isErrorResponse(historyResponse)) {
          const historyList = historyResponse.data || historyResponse.items || [];
          const rawHistory = Array.isArray(historyList) ? (historyList as any[]) : [];
          
          // Enrich history data with book, cover, and type details
          const enrichedHistory = await enrichHistoryData(token, rawHistory);
          setMyHistory(enrichedHistory);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userRole]); // Add userRole as dependency

  // Load manager-specific data when needed
  useEffect(() => {
    if (isManager && activeTab === 'requests') {
      fetchBorrowRequests();
    } else if (isManager && activeTab === 'borrowHistory') {
      fetchAllBorrowHistory();
    }
  }, [activeTab, isManager]);

  // Helper function to get available book count for a cover
  const getAvailableBooksCount = (coverId: string) => {
    return books.filter(book => 
      book.idBookCover === coverId && book.status === 'available'
    ).length;
  };

  // Filter functions
  const filteredBooks = books.filter((book) => {
    const searchMatch = searchTerm === "" || (
      book.bookCover?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.bookCover?.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.idBook.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const coverMatch = selectedCoverId ? book.idBookCover === selectedCoverId : true;
    const typeMatch = selectedTypeId ? book.bookCover?.typeBookId === selectedTypeId : true;
    return searchMatch && coverMatch && typeMatch;
  });

  const filteredBookCovers = bookCovers.filter((cover) => {
    const typeMatch = selectedTypeId ? cover.typeBookId === selectedTypeId : true;
    return typeMatch;
  });

  const booksInSelectedCover = selectedCoverId 
    ? books.filter(book => book.idBookCover === selectedCoverId)
    : [];

  // Create handlers
  const handleCreateCover = async (coverData: Omit<BookCover, '_id' | 'createdAt' | 'updatedAt'>) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      const createData: CreateBookCoverDto = {
        title: coverData.title,
        authorName: coverData.authorName,
        publicationYear: coverData.publicationYear,
        publisher: coverData.publisher,
        typeBookId: coverData.typeBookId,
        image: coverData.image || '',
      };

      const response = await createCoverBook(token, createData);

      // Reload book covers data
      const coversResponse = await getAllCoverBooks(token);
      if (!isErrorResponse(coversResponse)) {
        const covers = coversResponse.items || coversResponse.data || [];
        setBookCovers(Array.isArray(covers) ? (covers as BookCover[]) : []);
      }
      
      // Show success notification
      toast.success('Tạo bìa sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bìa sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateType = async (typeData: Omit<TypeBook, '_id' | 'createdAt' | 'updatedAt'>) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      const createData: CreateTypeBookDto = {
        name: typeData.name,
        description: typeData.description,
      };

      const response = await createTypeBook(token, createData);
      
      if (isErrorResponse(response)) {
        throw new Error(response.message);
      }

      // Reload type books data
      const typesResponse = await getAllTypeBooks(token);
      if (!isErrorResponse(typesResponse)) {
        const types = typesResponse.items || typesResponse.data || [];
        setTypeBooks(Array.isArray(types) ? (types as TypeBook[]) : []);
      }
      
      // Show success notification
      toast.success('Tạo loại sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo loại sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateType = async (typeData: UpdateTypeBookDto) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await updateTypeBook(token, typeData);
      
      if (isErrorResponse(response)) {
        throw new Error(response.message);
      }

      // Reload type books data
      const typesResponse = await getAllTypeBooks(token);
      if (!isErrorResponse(typesResponse)) {
        const types = typesResponse.items || typesResponse.data || [];
        setTypeBooks(Array.isArray(types) ? (types as TypeBook[]) : []);
      }

      setSelectedTypeForUpdate(null);
      
      // Show success notification
      toast.success('Cập nhật loại sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật loại sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditType = (type: TypeBook) => {
    setSelectedTypeForUpdate(type);
    setShowUpdateTypeModal(true);
  };

  const handleUpdateCover = async (coverData: UpdateCoverBookDto) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await updateCoverBook(token, coverData);
      
      if (isErrorResponse(response)) {
        throw new Error(response.message);
      }

      // Reload book covers data
      const coversResponse = await getAllCoverBooks(token);
      if (!isErrorResponse(coversResponse)) {
        const covers = coversResponse.items || coversResponse.data || [];
        setBookCovers(Array.isArray(covers) ? (covers as BookCover[]) : []);
      }

      setSelectedCoverForUpdate(null);
      
      // Show success notification
      toast.success('Cập nhật bìa sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật bìa sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditCover = (cover: BookCover) => {
    setSelectedCoverForUpdate(cover);
    setShowUpdateCoverModal(true);
  };

  const handleDeleteCover = async (cover: BookCover) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    try {
      // Check if there are books using this cover
      const booksWithCover = books.filter(book => book.idBookCover === cover._id);
      
      if (booksWithCover.length > 0) {
        toast.error(`Không thể xóa bìa sách "${cover.title}" vì vẫn còn ${booksWithCover.length} cuốn sách đang sử dụng bìa này.`);
        return;
      }

      const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa bìa sách "${cover.title}"?`);
      if (!confirmed) return;

      setCreateLoading(true);
      
      const deleteData: DeleteCoverBookDto = {
        id: cover._id,
      };

      const response = await deleteCoverBook(token, deleteData);
      
      if (isErrorResponse(response)) {
        console.error('Delete cover error:', response);
        if (response.statusCode === 400) {
          toast.error('Không thể xóa bìa sách vì vẫn còn sách đang sử dụng bìa này.');
          return;
        } 
      }

      // Show success notification first
      toast.success(`Xóa bìa sách "${cover.title}" thành công!`);

      // Force reload the page to ensure fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Small delay to show the success message

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa bìa sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateBook = async (bookData: Omit<Book, '_id' | 'createdAt' | 'updatedAt'>) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      // Format date properly for backend (DD-MM-YYYY)
      const formattedDate = bookData.importDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const ddmmyyyy = formattedDate.replace(/\//g, '-'); // Convert to DD-MM-YYYY
      
      const createData: CreateBookDto = {
        idBook: bookData.idBook,
        importDate: ddmmyyyy,
        index: bookData.index,
        idBookCover: bookData.idBookCover,
      };

      const response = await createBook(token, createData);
      
      // Reload books data
      const booksResponse = await getAllBooks(token);
      if (!isErrorResponse(booksResponse)) {
        const booksList = booksResponse.items || booksResponse.data || [];
        let processedBooks = Array.isArray(booksList) ? (booksList as Book[]) : [];
        
        // If books don't have populated bookCover, manually populate from covers
        if (processedBooks.length > 0 && !processedBooks[0].bookCover) {
          const coverMap = new Map(bookCovers.map(cover => [cover._id, cover]));
          
          processedBooks = processedBooks.map(book => ({
            ...book,
            bookCover: coverMap.get(book.idBookCover)
          }));
        }
        
        setBooks(processedBooks);
      }
      
      // Show success notification
      toast.success('Tạo sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateBook = async (updateData: UpdateBookDto) => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }
    
    setCreateLoading(true);
    try {
      const response = await updateBook(token, updateData);
      if(isErrorResponse(response)) {
        // Handle conflict error
        if(response.statusCode === 409) {
          toast.error('Mã sách đã tồn tại. Vui lòng sử dụng mã khác.');
          return;
        }
        if(response.statusCode === 400) {
          toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
          return;
        }
      }
      // Reload books data
      const booksResponse = await getAllBooks(token);
      if (!isErrorResponse(booksResponse)) {
        const booksList = booksResponse.items || booksResponse.data || [];
        let processedBooks = Array.isArray(booksList) ? (booksList as Book[]) : [];
        
        // If books don't have populated bookCover, manually populate from covers
        if (processedBooks.length > 0 && !processedBooks[0].bookCover) {
          const coverMap = new Map(bookCovers.map(cover => [cover._id, cover]));
          
          processedBooks = processedBooks.map(book => ({
            ...book,
            bookCover: coverMap.get(book.idBookCover)
          }));
        }
        
        setBooks(processedBooks);
      }
      
      // Show success notification
      toast.success('Cập nhật sách thành công!');
      setShowUpdateBookModal(false);
      setSelectedBookForUpdate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa sách "${book.idBook}"?`);
    if (!confirmed) {
      return;
    }

    const token = Cookies.get('accessToken');
    if (!token) {
      setError('Không tìm thấy token đăng nhập');
      return;
    }

    setCreateLoading(true);
    try {
      const deleteData: DeleteBookDto = { id: book._id };
      const response = await deleteBook(token, deleteData);
      
      // Reload books data
      const booksResponse = await getAllBooks(token);
      if (!isErrorResponse(booksResponse)) {
        const booksList = booksResponse.items || booksResponse.data || [];
        let processedBooks = Array.isArray(booksList) ? (booksList as Book[]) : [];
        
        // If books don't have populated bookCover, manually populate from covers
        if (processedBooks.length > 0 && !processedBooks[0].bookCover) {
          const coverMap = new Map(bookCovers.map(cover => [cover._id, cover]));
          
          processedBooks = processedBooks.map(book => ({
            ...book,
            bookCover: coverMap.get(book.idBookCover)
          }));
        }
        
        setBooks(processedBooks);
      }
      
      // Show success notification
      toast.success('Xóa sách thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBookForUpdate(book);
    setShowUpdateBookModal(true);
  };

  // Rental handling functions
  const handleCoverBookSelection = (coverId: string) => {
    const newSelection = new Set(selectedCoverBooks);
    if (newSelection.has(coverId)) {
      newSelection.delete(coverId);
    } else {
      newSelection.add(coverId);
    }
    setSelectedCoverBooks(newSelection);
  };

  // Function to refresh history
  const refreshHistory = async () => {
    if (userRole !== null) return; // Only for readers (userRole === null)
    
    const token = await getValidToken();
    if (!token) return;
    
    setHistoryLoading(true);
    try {
      const historyResponse = await getMyHistory(token);
      if (!isErrorResponse(historyResponse)) {
        const historyList = historyResponse.data || historyResponse.items || [];
        const rawHistory = Array.isArray(historyList) ? (historyList as any[]) : [];
        
        // Enrich history data with book, cover, and type details
        const enrichedHistory = await enrichHistoryData(token, rawHistory);
        setMyHistory(enrichedHistory);
        toast.success('Đã cập nhật lịch sử thuê sách');
      } else {
        toast.error('Không thể tải lịch sử: ' + historyResponse.message);
      }
    } catch (error) {
      console.error('Error refreshing history:', error);
      toast.error('Có lỗi xảy ra khi tải lịch sử');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Function to fetch borrow requests for managers
  const fetchBorrowRequests = async () => {
    if (!isManager) return;
    
    const token = await getValidToken();
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await getAllBorrowHistory(token);
      if (!isErrorResponse(response)) {
        const history = response.items || [];
        const rawHistory = Array.isArray(history) ? history : [];
        
        // Filter only REQUESTED status
        const requestedHistory = rawHistory.filter(item => item.status?.toUpperCase() === 'REQUESTED');
        
        // Enrich history data with book, cover, and type details
        const enrichedHistory = await enrichHistoryData(token, requestedHistory);
        setBorrowRequests(enrichedHistory);
      } else {
        toast.error('Không thể tải danh sách yêu cầu: ' + response.message);
        setBorrowRequests([]);
      }
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách yêu cầu');
      setBorrowRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all borrow history for managers
  const fetchAllBorrowHistory = async () => {
    if (!isManager) return;
    
    const token = await getValidToken();
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await getAllBorrowHistory(token);
      if (!isErrorResponse(response)) {
        const history = response.items || [];
        const rawHistory = Array.isArray(history) ? history : [];
        
        // Enrich history data with book, cover, and type details
        const enrichedHistory = await enrichHistoryData(token, rawHistory);
        setBorrowHistory(enrichedHistory);
      } else {
        toast.error('Không thể tải lịch sử mượn sách: ' + response.message);
        setBorrowHistory([]);
      }
    } catch (error) {
      console.error('Error fetching all borrow history:', error);
      toast.error('Có lỗi xảy ra khi tải lịch sử mượn sách');
      setBorrowHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle approve borrow request
  const handleApproveRequest = async (requestId: string) => {
    const token = await getValidToken();
    if (!token) return;
    
    try {
      const response = await handleBorrowRequest(token, requestId, true);
      if (!isErrorResponse(response)) {
        toast.success('Đã duyệt yêu cầu mượn sách');
        await fetchBorrowRequests(); // Refresh the list
      } else {
        toast.error('Không thể duyệt yêu cầu: ' + response.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Có lỗi xảy ra khi duyệt yêu cầu');
    }
  };

  // Function to handle reject borrow request
  const handleRejectRequest = async (requestId: string) => {
    const token = await getValidToken();
    if (!token) return;
    
    try {
      const response = await handleBorrowRequest(token, requestId, false);
      if (!isErrorResponse(response)) {
        toast.success('Đã từ chối yêu cầu mượn sách');
        await fetchBorrowRequests(); // Refresh the list
      } else {
        toast.error('Không thể từ chối yêu cầu: ' + response.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Có lỗi xảy ra khi từ chối yêu cầu');
    }
  };

  const handleCreateRentalRequests = async () => {
    if (selectedCoverBooks.size === 0) {
      toast.error('Vui lòng chọn ít nhất một bìa sách để thuê');
      return;
    }

    if (rentalDays <= 1) {
      toast.error('Số ngày thuê phải lớn hơn 1');
      return;
    }

    let token = await getValidToken();
    
    if (!token) {
      toast.error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    // Check if user is a reader (in this system, reader has no role - only manager/admin have roles)
    // So if userRole is null or undefined, that means it's a reader
    if (userRole !== null && userRole !== 'reader') {
      toast.error(`Chỉ người dùng với quyền reader mới có thể thuê sách. Quyền hiện tại: ${userRole || 'reader (không có role)'}`);
      return;
    }

    setCreateLoading(true);
    
    try {
      const requests: Promise<any>[] = [];
      
      // For each selected cover book, find an available book and create a rental request
      const selectedArray = Array.from(selectedCoverBooks);
      for (const coverId of selectedArray) {
        const availableBook = books.find(book => 
          book.idBookCover === coverId && book.status === 'available'
        );
        
        if (availableBook) {
          const historyData: CreateHistoryDto = {
            bookId: availableBook._id,
            numberDate: rentalDays
          };
          
          requests.push(createHistory(token, historyData));
        }
      }

      const results = await Promise.allSettled(requests);
      
      let successCount = 0;
      let errorCount = 0;
      let authErrors = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (!('message' in result.value) || !result.value.statusCode) {
            successCount++;
          } else {
            errorCount++;
            console.error('Rental request failed:', result.value);
            
            // Check for authentication errors
            if (result.value.statusCode === 403 || result.value.statusCode === 401) {
              authErrors++;
              console.error('Authentication error detected:', result.value);
            }
          }
        } else {
          errorCount++;
          console.error('Rental request error:', result.reason);
        }
      });

      if (authErrors > 0) {
        toast.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        // You might want to logout the user here
        // logout();
        return;
      }

      if (successCount > 0) {
        toast.success(`Tạo thành công ${successCount} yêu cầu thuê sách!`);
        
        // Reload books data to update status
        const booksResponse = await getAllBooks(token);
        if (!isErrorResponse(booksResponse)) {
          const booksList = booksResponse.items || booksResponse.data || [];
          let processedBooks = Array.isArray(booksList) ? (booksList as Book[]) : [];
          
          if (processedBooks.length > 0 && !processedBooks[0].bookCover) {
            const coverMap = new Map(bookCovers.map(cover => [cover._id, cover]));
            processedBooks = processedBooks.map(book => ({
              ...book,
              bookCover: coverMap.get(book.idBookCover)
            }));
          }
          
          setBooks(processedBooks);
        }
        
        // Reload history for readers
        if (userRole === null) {
          const historyResponse = await getMyHistory(token);
          if (!isErrorResponse(historyResponse)) {
            const historyList = historyResponse.data || historyResponse.items || [];
            const rawHistory = Array.isArray(historyList) ? (historyList as any[]) : [];
            const enrichedHistory = await enrichHistoryData(token, rawHistory);
            setMyHistory(enrichedHistory);
          }
        }
        
        // Clear selection
        setSelectedCoverBooks(new Set());
      }
      
      if (errorCount > 0) {
        toast.error(`Có ${errorCount} yêu cầu thất bại`);
      }
      
    } catch (error) {
      console.error('Error creating rental requests:', error);
      toast.error('Có lỗi xảy ra khi tạo yêu cầu thuê sách');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      );
    }
    switch (activeTab) {
      case 'covers':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bìa sách</h2>
              {isManager && (
                <button
                  onClick={() => setShowCreateCoverModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tạo bìa sách
                </button>
              )}
            </div>
            
            {selectedCoverId ? (
              <div>
                {isManager ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => setSelectedCoverId(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        ← Quay lại
                      </button>
                      <h3 className="text-xl font-semibold">
                        Sách trong bìa: {bookCovers.find(c => c._id === selectedCoverId)?.title}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {booksInSelectedCover.map((book) => (
                        <BookCard 
                          key={book._id} 
                          book={book} 
                          showType={true}
                          onEdit={isManager ? handleEditBook : undefined}
                          onDelete={isManager ? handleDeleteBook : undefined}
                          showActions={isManager}
                        />
                      ))}
                    </div>
                    {booksInSelectedCover.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có sách nào trong bìa này.</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Regular users shouldn't see this, redirect back
                  <div className="text-center py-12">
                    <p className="text-gray-500">Bạn không có quyền xem chi tiết sách.</p>
                    <button
                      onClick={() => setSelectedCoverId(null)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Quay lại danh sách bìa sách
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bookCovers.map((cover) => (
                  <BookCoverCard 
                    key={cover._id} 
                    cover={cover} 
                    onClick={() => setSelectedCoverId(cover._id)}
                    availableCount={getAvailableBooksCount(cover._id)}
                    isManager={isManager}
                    onEdit={isManager ? handleEditCover : undefined}
                    onDelete={isManager ? handleDeleteCover : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'types':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Loại sách</h2>
              {isManager && (
                <button
                  onClick={() => setShowCreateTypeModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Tạo loại sách
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {typeBooks.map((type) => (
                <TypeBookCard 
                  key={type._id} 
                  type={type} 
                  onEdit={isManager ? handleEditType : undefined}
                />
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Lọc bìa sách theo loại</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTypeId(null)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedTypeId === null 
                      ? "bg-gray-800 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Tất cả
                </button>
                {typeBooks.map((type) => (
                  <button
                    key={type._id}
                    onClick={() => setSelectedTypeId(type._id)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedTypeId === type._id 
                        ? "bg-blue-600 text-white" 
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredBookCovers.map((cover) => (
                <BookCoverCard 
                  key={cover._id} 
                  cover={cover} 
                  onClick={() => setSelectedCoverId(cover._id)}
                  availableCount={getAvailableBooksCount(cover._id)}
                  isManager={isManager}
                  onEdit={isManager ? handleEditCover : undefined}
                  onDelete={isManager ? handleDeleteCover : undefined}
                />
              ))}
            </div>

            {filteredBookCovers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có bìa sách nào thuộc loại này.</p>
              </div>
            )}
          </div>
        );

      case 'rental':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thuê sách</h2>
              {selectedCoverBooks.size > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Số ngày thuê:</label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCreateRentalRequests}
                    disabled={createLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {createLoading ? 'Đang tạo yêu cầu...' : `Tạo yêu cầu (${selectedCoverBooks.size})`}
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sách theo tên, tác giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBookCovers.map((cover) => {
                const availableCount = getAvailableBooksCount(cover._id);
                const isSelected = selectedCoverBooks.has(cover._id);
                const canSelect = availableCount > 0;
                
                return (
                  <div 
                    key={cover._id} 
                    className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
                      canSelect ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    } ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                    onClick={() => canSelect && handleCoverBookSelection(cover._id)}
                  >
                    <div className="h-48 bg-gray-200 relative">
                      {cover.image ? (
                        <img 
                          src={cover.image} 
                          alt={cover.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      
                      {/* Available count badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          availableCount > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {availableCount > 0 ? `${availableCount} có sẵn` : 'Hết sách'}
                        </span>
                      </div>
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 left-2">
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {cover.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">Tác giả: {cover.authorName}</p>
                      <p className="text-sm text-gray-600 mb-1">NXB: {cover.publisher}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-blue-600">Năm: {cover.publicationYear}</span>
                        {cover.typeBook && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {cover.typeBook.name}
                          </span>
                        )}
                      </div>
                      
                      {!canSelect && (
                        <div className="mt-3 text-center text-sm text-red-500 font-medium">
                          Không có sách khả dụng
                        </div>
                      )}
                      
                      {canSelect && !isSelected && (
                        <div className="mt-3 text-center text-sm text-gray-500">
                          Click để chọn mượn
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="mt-3 text-center text-sm text-yellow-600 font-medium">
                          ✓ Đã chọn
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBookCovers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sách phù hợp với tìm kiếm của bạn.
                </p>
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lịch sử thuê sách</h2>
              <button
                onClick={refreshHistory}
                disabled={createLoading || historyLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {(createLoading || historyLoading) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm mới
                  </>
                )}
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải thông tin chi tiết lịch sử thuê sách...</p>
                <p className="text-gray-400 text-sm">Vui lòng đợi trong giây lát</p>
              </div>
            ) : myHistory.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Bạn chưa có lịch sử thuê sách nào</p>
                <p className="text-gray-400 text-sm">Hãy thuê sách để xem lịch sử tại đây</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group history by status */}
                {[
                  { status: 'requested', title: 'Đang chờ duyệt', color: 'border-yellow-200' },
                  
                  { status: 'borrowed', title: 'Đang mượn', color: 'border-green-200' },
                  { status: 'overdue', title: 'Quá hạn', color: 'border-red-200' },
                  { status: 'returned', title: 'Đã trả', color: 'border-gray-200' },
                  { status: 'rejected', title: 'Bị từ chối', color: 'border-red-200' },
                ].map((section) => {
                  const sectionHistory = myHistory.filter(h => h.status === section.status);
                  
                  if (sectionHistory.length === 0) return null;
                  
                  return (
                    <div key={section.status} className={`bg-white rounded-lg shadow-sm border-l-4 ${section.color} p-6`}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        {section.title}
                        <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                          {sectionHistory.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sectionHistory.map((historyItem, index) => (
                          <HistoryCard key={historyItem._id || `history-${section.status}-${index}`} history={historyItem} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Show all history if no specific status grouping is visible */}
                {myHistory.every(h => !['requested', 'approved', 'borrowed', 'overdue', 'returned', 'rejected'].includes(h.status)) && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Tất cả lịch sử</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {myHistory.map((historyItem, index) => (
                        <HistoryCard key={historyItem._id || `history-all-${index}`} history={historyItem} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'books':
        // Only managers can access this tab
        if (!isManager) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Bạn không có quyền truy cập trang này.</p>
            </div>
          );
        }
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tất cả sách</h2>
              <button
                onClick={() => setShowCreateBookModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Tạo sách mới
              </button>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sách theo tên, tác giả, mã sách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard 
                  key={book._id} 
                  book={book} 
                  showCover={true} 
                  showType={true}
                  onEdit={isManager ? handleEditBook : undefined}
                  onDelete={isManager ? handleDeleteBook : undefined}
                  showActions={isManager}
                />
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sách phù hợp với tìm kiếm của bạn.
                </p>
              </div>
            )}
          </div>
        );

      case 'requests':
        // Only managers can access this tab
        if (!isManager) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Bạn không có quyền truy cập trang này.</p>
            </div>
          );
        }
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yêu cầu mượn sách</h2>
              <button
                onClick={fetchBorrowRequests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm mới
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải danh sách yêu cầu...</p>
              </div>
            ) : borrowRequests.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không có yêu cầu mượn sách nào</p>
                <p className="text-gray-400 text-sm">Tất cả yêu cầu đã được xử lý</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {borrowRequests.map((request) => (
                  <BorrowRequestCard
                    key={request._id}
                    request={request}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                    onUserClick={handleUserIdClick}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'borrowHistory':
        // Only managers can access this tab
        if (!isManager) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Bạn không có quyền truy cập trang này.</p>
            </div>
          );
        }
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lịch sử mượn sách</h2>
              <button
                onClick={fetchAllBorrowHistory}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm mới
                  </>
                )}
              </button>
            </div>

            {/* Statistics Overview */}
            {borrowHistory.length > 0 && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { status: 'REQUESTED', title: 'Chờ duyệt', color: 'bg-yellow-500', icon: '⏳' },
                  
                  { status: 'BORROWED', title: 'Đang mượn', color: 'bg-green-500', icon: '📖' },
                  { status: 'RETURNED', title: 'Đã trả', color: 'bg-gray-500', icon: '✔️' },
                  { status: 'OVERDUE', title: 'Quá hạn', color: 'bg-red-500', icon: '⚠️' },
                  
                  { status: 'CANCELED', title: 'Đã hủy', color: 'bg-orange-500', icon: '🚫' },
                ].map((stat) => {
                  const count = borrowHistory.filter(h => h.status?.toUpperCase() === stat.status).length;
                  return (
                    <div key={stat.status} className="bg-white rounded-lg shadow-sm border p-4 text-center">
                      <div className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <span className="text-white text-sm">{stat.icon}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải lịch sử mượn sách...</p>
              </div>
            ) : borrowHistory.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có lịch sử mượn sách nào</p>
                <p className="text-gray-400 text-sm">Lịch sử sẽ hiển thị khi có người dùng mượn sách</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group history by status */}
                {[
                  { status: 'REQUESTED', title: 'Chờ duyệt', color: 'border-yellow-200', bgColor: 'bg-yellow-50' },
                
                  { status: 'BORROWED', title: 'Đang mượn', color: 'border-green-200', bgColor: 'bg-green-50' },
                  { status: 'RETURNED', title: 'Đã trả', color: 'border-gray-200', bgColor: 'bg-gray-50' },
                  { status: 'OVERDUE', title: 'Quá hạn', color: 'border-red-200', bgColor: 'bg-red-50' },
                  
                  { status: 'CANCELED', title: 'Đã hủy', color: 'border-orange-200', bgColor: 'bg-orange-50' },
                ].map((section) => {
                  const sectionHistory = borrowHistory.filter(h => h.status?.toUpperCase() === section.status);
                  
                  if (sectionHistory.length === 0) return null;
                  
                  return (
                    <div key={section.status} className={`${section.bgColor} rounded-lg shadow-sm border-l-4 ${section.color} p-6`}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                        <span className="flex items-center">
                          {section.title}
                          <span className="ml-2 bg-white text-gray-700 text-sm px-3 py-1 rounded-full font-medium shadow-sm">
                            {sectionHistory.length}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date().toLocaleDateString('vi-VN')}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectionHistory.map((historyItem) => (
                          <BorrowHistoryCard 
                            key={historyItem._id || historyItem.id} 
                            history={historyItem} 
                            onUserClick={handleUserIdClick}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Custom Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Library className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Library MS</h1>
                <p className="text-sm text-gray-600">Hệ thống quản lý thư viện</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavigation('/home')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </button>
              
              {isManager && (
                <>                 
                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Admin
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => handleNavigation('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Hồ sơ
              </button>
            </div>

            {/* User info and logout */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {userRole === 'admin' ? 'Quản trị viên' : userRole === 'manager' ? 'Quản lý' : 'Người dùng'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="space-y-8">


        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('covers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'covers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bìa sách
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'types'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Loại sách
          </button>
          {isManager ? (
            <>
              <button
                onClick={() => setActiveTab('books')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'books'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả sách
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yêu cầu mượn sách
              </button>
              <button
                onClick={() => setActiveTab('borrowHistory')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'borrowHistory'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lịch sử mượn sách
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('rental')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'rental'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Thuê sách
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lịch sử thuê
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Modals */}
        <CreateBookCoverModal
          isOpen={showCreateCoverModal}
          onClose={() => setShowCreateCoverModal(false)}
          onSave={handleCreateCover}
          typeBooks={typeBooks}
          loading={createLoading}
        />

        <CreateTypeBookModal
          isOpen={showCreateTypeModal}
          onClose={() => setShowCreateTypeModal(false)}
          onSave={handleCreateType}
          loading={createLoading}
        />

        <UpdateTypeBookModal
          isOpen={showUpdateTypeModal}
          onClose={() => {
            setShowUpdateTypeModal(false);
            setSelectedTypeForUpdate(null);
          }}
          onSave={handleUpdateType}
          typeBook={selectedTypeForUpdate}
          loading={createLoading}
        />

        <UpdateCoverBookModal
          isOpen={showUpdateCoverModal}
          onClose={() => {
            setShowUpdateCoverModal(false);
            setSelectedCoverForUpdate(null);
          }}
          onSave={handleUpdateCover}
          coverBook={selectedCoverForUpdate}
          typeBooks={typeBooks}
          loading={createLoading}
        />

        <CreateBookModal
          isOpen={showCreateBookModal}
          onClose={() => setShowCreateBookModal(false)}
          onSave={handleCreateBook}
          bookCovers={bookCovers}
          loading={createLoading}
        />

        <UpdateBookModal
          isOpen={showUpdateBookModal}
          onClose={() => {
            setShowUpdateBookModal(false);
            setSelectedBookForUpdate(null);
          }}
          onSave={handleUpdateBook}
          book={selectedBookForUpdate}
          bookCovers={bookCovers}
          loading={createLoading}
        />

        <UserProfileModal
          isOpen={showUserProfileModal}
          onClose={() => {
            setShowUserProfileModal(false);
            setSelectedUserProfile(null);
          }}
          userProfile={selectedUserProfile}
          loading={userProfileLoading}
        />
        </div>
      </main>
      
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
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
