"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Library, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  BookOpen,
  Users,
  Shield,
  Settings
} from "lucide-react";
import { showConfirm } from "@/utils/dialog";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function MainLayout({ 
  children, 
  title, 
  subtitle,
  showSidebar = true,
  showHeader = true,
  showFooter = true
}: MainLayoutProps) {
  const router = useRouter();
  const { logout, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isManager = userRole === 'manager' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  const navigation = [
    { 
      name: 'Trang chủ', 
      href: '/home', 
      icon: Home,
      show: true
    },
    { 
      name: 'Bìa sách', 
      href: '/home?tab=covers', 
      icon: BookOpen,
      show: true
    },
    { 
      name: 'Loại sách', 
      href: '/home?tab=types', 
      icon: Settings,
      show: isManager
    },
    { 
      name: 'Tất cả sách', 
      href: '/home?tab=books', 
      icon: Library,
      show: isManager
    },
    { 
      name: 'Quản lý người dùng', 
      href: '/admin', 
      icon: Users,
      show: isAdmin
    },
    { 
      name: 'Quản lý thư viện', 
      href: '/manager', 
      icon: Shield,
      show: isManager
    }
  ];

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        console.log('Logging out...'); // Debug log
        await logout();
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error in MainLayout:', error);
    }
  };

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý';
      case 'reader':
        return 'Độc giả';
      default:
        return 'Người dùng';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-6 border-b">
                <div className="flex items-center gap-3">
                  <Library className="w-8 h-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">Library MS</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.filter(item => item.show).map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </button>
                ))}
              </nav>

              {/* User info */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getRoleDisplay()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Thoát
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  {showSidebar && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                  )}
                  <div>
                    {title && (
                      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="text-sm text-gray-600">{subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Header actions */}
                <div className="flex items-center gap-4">
                  <span className="hidden sm:block text-sm text-gray-600">
                    {getRoleDisplay()}
                  </span>
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Hồ sơ</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Thoát</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t mt-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Library className="w-4 h-4" />
                  <span>Library Management System</span>
                </div>
                <div className="text-sm text-gray-500">
                  © 2025 - Hệ thống quản lý thư viện
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}