"use client";

import { Library } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Library className="w-4 h-4" />
            <span>Library Management System</span>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 - Hệ thống quản lý thư viện. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}