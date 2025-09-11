"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { logout as logoutAction } from '../actions/user/logout';
import { getAllUsers } from '../actions/admin/getAllUsers';
import { updateUserAdmin } from '../actions/admin/updateUser';
import toast, { Toaster } from "react-hot-toast";
import { 
  Users, 
  Edit3, 
  Shield, 
  BookOpen, 
  Search, 
  Filter,
  LogOut,
  Info,
  X,
  Calendar,
  Mail,
  Phone,
  User as UserIcon
} from 'lucide-react';

interface User {
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

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  // const [isRefreshing, setIsRefreshing] = useState(false); // removed refresh feature

  // Kiểm tra quyền admin từ Cookie
  useEffect(() => {
    const validateAdminAccess = () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const userRole = Cookies.get('userRole');
        
        if (!accessToken) {
          router.push('/');
          return;
        }

        if (!userRole || userRole !== 'admin') {
          router.push('/home');
          return;
        }

        setUserRole(userRole);
        setIsValidating(false);
      } catch (error) {
        console.error('Token validation error:', error);
        router.push('/');
      }
    };

    validateAdminAccess();
  }, [router]);

  // Fetch users data từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers();
      
      if ('statusCode' in result) {
        // Xử lý lỗi
        if (result.statusCode === 401) {
          // Token hết hạn hoặc không hợp lệ
          toast.error('Phiên đăng nhập đã hết hạn');
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('userRole');
          router.push('/');
          return;
        }
        toast.error(result.message || 'Không thể tải danh sách người dùng');
        setUsers([]);
        setFilteredUsers([]);
      } else {
        // Thành công
        setUsers(result.users);
        setFilteredUsers(result.users);
        toast.success(`Đã tải ${result.totalUsers} người dùng`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load users khi component mount và admin đã được validate
  useEffect(() => {
    if (!isValidating && userRole === 'admin') {
      fetchUsers();
    }
  }, [isValidating, userRole]);

  // Refresh button removed by requirement

  // Filter users
  useEffect(() => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, selectedRole, searchTerm]);

  // Handle logout
  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      try {
        setIsLoggingOut(true);
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        
        if (accessToken && refreshToken) {
          const result = await logoutAction(accessToken, refreshToken);
        }
        
        // Xóa tất cả cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('userRole');
        
        // Redirect về trang đăng nhập
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
        // Vẫn xóa cookies và redirect trong trường hợp lỗi
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('userRole');
        router.push('/');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  // Callback khi cập nhật user thành công từ modal
  const handleUserUpdated = (updated: User) => {
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
    // Cập nhật selectedUser nếu đang mở modal chi tiết (giữ đồng bộ)
    setSelectedUser(prev => prev && prev._id === updated._id ? updated : prev);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'manager':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'reader':
        return <BookOpen className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      reader: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      not_verified: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      verified: 'Đã xác thực',
      not_verified: 'Chưa xác thực',
      banned: 'Bị khóa'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Hiển thị loading khi đang validate token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
              <p className="text-gray-600">
                Quản lý tài khoản Manager và Reader
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="manager">Manager</option>
                <option value="reader">Reader</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            {getRoleBadge(user.role)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Xem chi tiết"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedRole !== 'all' 
                      ? 'Không tìm thấy người dùng nào phù hợp với bộ lọc.'
                      : 'Chưa có người dùng nào trong hệ thống.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }} 
        />
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

// User Detail Modal Component
function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Không xác định';
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Không xác định';
    }
  };

  const getGenderLabel = (gender: string) => {
    const genderMap = {
      'male': 'Nam',
      'female': 'Nữ',
      'other': 'Khác'
    };
    return genderMap[gender as keyof typeof genderMap] || gender;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'manager':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'reader':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'verified': 'Đã xác thực',
      'not_verified': 'Chưa xác thực',
      'banned': 'Bị khóa'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết người dùng</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar và thông tin cơ bản */}
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h4>
              <div className="flex items-center gap-3 mb-2">
                {getRoleIcon(user.role)}
                <span className="text-lg font-medium text-gray-700 capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : user.status === 'not_verified'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h5>
                
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Thông tin cá nhân</h5>
                
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Giới tính</p>
                    <p className="font-medium text-gray-900">{getGenderLabel(user.gender)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-medium text-gray-900">{formatDateOfBirth(user.DOB)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Thông tin hệ thống</h5>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">ID người dùng</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{user._id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                    <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                    <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                  </div>

                  {user.deleted_at && (
                    <div>
                      <p className="text-sm text-gray-500">Ngày xóa</p>
                      <p className="font-medium text-red-600">{formatDate(user.deleted_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trạng thái tài khoản */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Trạng thái tài khoản</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'not_verified'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vai trò:</span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tài khoản bị xóa:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.deleted_at 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.deleted_at ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onUpdated }: { user: User; onClose: () => void; onUpdated: (user: User) => void }) {
  const [formData, setFormData] = useState<{ role: User['role']; status: User['status']}>({
    role: user.role,
    // Nếu status là not_verified, giữ nguyên, ngược lại chỉ cho phép verified hoặc banned
    status: user.status === 'not_verified' ? 'not_verified' : user.status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const originalRole = user.role;
  const originalStatus = user.status;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNotVerified) {
      toast.error('Tài khoản chưa xác thực không thể cập nhật');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload: any = { id: user._id };
      if (formData.role !== originalRole) payload.role = formData.role;
      if (formData.status !== originalStatus && formData.status !== 'not_verified') payload.status = formData.status;

      if (!payload.role && !payload.status) {
        toast('Không có thay đổi nào');
        onClose();
        return;
      }

      const result = await updateUserAdmin(payload);
      if ('statusCode' in result) {
        if (result.statusCode === 401) {
          toast.error('Phiên hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error(result.message || 'Cập nhật thất bại');
        }
      } else {
        toast.success(result.message || 'Cập nhật thành công');
        // Cập nhật ngay danh sách (optimistic sync)
        onUpdated({
          ...user,
          role: formData.role,
          status: formData.status as User['status']
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kiểm tra nếu trạng thái là "not_verified"
  const isNotVerified = user.status === 'not_verified';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa tài khoản</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hiển thị thông tin cơ bản - chỉ đọc */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <p className="text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <p className="text-gray-900">{user.phoneNumber}</p>
            </div>
          </div>
          
          {user.role !== 'admin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                {isNotVerified ? (
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 select-none cursor-not-allowed">
                    {formData.role === 'manager' ? 'Manager' : 'Reader'}
                  </div>
                ) : (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'manager' | 'reader'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="reader">Reader</option>
                    <option value="manager">Manager</option>
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                {isNotVerified ? (
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 select-none cursor-not-allowed">
                    Chưa xác thực
                  </div>
                ) : (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as User['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="verified">Đã xác thực</option>
                    <option value="banned">Bị khóa</option>
                  </select>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isNotVerified || isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2 ${
                isNotVerified || isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}