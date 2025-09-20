"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book, BookCover, CreateBookCoverDto, CreateBookDto, DeleteCoverBookDto, TypeBook, UpdateCoverBookDto, UpdateBookDto, DeleteBookDto } from "@/types";
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
import Cookies from "js-cookie";
import { Library, User, LogOut, Home, BookOpen, Users, Shield } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { showConfirm } from "@/utils/dialog";
import toast, { Toaster } from 'react-hot-toast';
import {
  CreateTypeBookDto,
  UpdateTypeBookDto
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

    console.log('Form data being sent:', updateData); // Debug log
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

// Card Components
interface BookCoverCardProps {
  cover: BookCover;
  onClick: () => void;
  onEdit?: (cover: BookCover) => void;
  onDelete?: (cover: BookCover) => void;
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
  const { logout, userRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'covers' | 'books' | 'types'>('covers');
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
  
  // Data states
  const [bookCovers, setBookCovers] = useState<BookCover[]>([]);
  const [typeBooks, setTypeBooks] = useState<TypeBook[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const isManager = userRole === 'manager' || userRole === 'admin';

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
        const [coversResponse, typesResponse] = await Promise.all([
          getAllCoverBooks(token),
          getAllTypeBooks(token)
        ]);
        
        // Load books separately with proper error handling
        const booksResponse = await getAllBooks(token);


        // Handle book covers
        if (isErrorResponse(coversResponse)) {
          throw new Error(coversResponse.message);
        }
        const covers = coversResponse.items || coversResponse.data || [];
        setBookCovers(Array.isArray(covers) ? (covers as BookCover[]) : []);

        // Handle type books
        if (isErrorResponse(typesResponse)) {
          throw new Error(typesResponse.message);
        }
        const types = typesResponse.items || typesResponse.data || [];
        setTypeBooks(Array.isArray(types) ? (types as TypeBook[]) : []);

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

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

    console.log('Sending update data:', updateData); // Debug log
    
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
              <h2 className="text-2xl font-bold text-gray-900">Loại sách</h2>
              <button
                onClick={() => setShowCreateTypeModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tạo loại sách
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {typeBooks.map((type) => (
                <TypeBookCard 
                  key={type._id} 
                  type={type} 
                  onEdit={handleEditType}
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
          {isManager && (
            <>
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
