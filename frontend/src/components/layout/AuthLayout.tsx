"use client";

import { ReactNode } from "react";
import { Library } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Library Management</h1>
                <p className="text-sm text-blue-600">Hệ thống quản lý thư viện</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {title && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              {subtitle && (
                <p className="text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-200">
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
    </div>
  );
}