"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/app/actions/user/getMe";
import { updateUser } from "@/app/actions/user/updateUser";
import { Library, User, LogOut, Home, BookOpen, Users, Shield, X, Calendar, Phone } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function formatDOB(dob: string) {
  if (!dob) return "";
  const isoMatch = dob.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch && isoMatch.length === 4) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob;
  return dob;
}

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

export default function ProfilePage() {
  const router = useRouter();
  const { logout, userRole } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    DOB: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        await logout();
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('userRole');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isManager = userRole === 'manager' || userRole === 'admin';

  useEffect(() => {
    async function fetchProfile() {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        router.push("/");
        return;
      }
      const result = await getMe(accessToken);
      if ("error" in result) {
        setUser(null);
      } else {
        // Transform API result to match User interface
        const userData: User = {
          _id: result._id,
          firstName: result.firstName || '',
          lastName: result.lastName || '',
          gender: result.gender || '',
          email: result.email,
          DOB: result.DOB || '',
          phoneNumber: result.phoneNumber || '',
          role: result.role,
          status: result.status,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          deleted_at: result.deleted_at
        };
        setUser(userData);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-blue-600 font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-gray-600 mb-6">Không thể tải thông tin người dùng.</p>
          <button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            onClick={() => router.push("/home")}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                <p className="text-sm text-gray-600">Thông tin tài khoản</p>
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
                  <button
                    onClick={() => handleNavigation('/manager')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Quản lý
                  </button>
                  
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
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg"
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-blue-100">Thành viên Library Management</p>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                    <p className="text-gray-900">{user.phoneNumber || "Chưa cập nhật"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7v13a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h1m0 0h8m-9 0h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Giới tính</p>
                    <p className="text-gray-900">
                      {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7v13a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h1m0 0h8m-9 0h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ngày sinh</p>
                    <p className="text-gray-900">{formatDOB(user.DOB)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => router.push("/home")}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Quay lại trang chủ
                </button>
                <button
                  onClick={() => {
                    // Khởi tạo form với giá trị hiện tại của user
                    const initialFormData = {
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phoneNumber: user.phoneNumber || "",
                      gender: user.gender,
                      DOB: formatDOB(user.DOB)
                    };
                    setEditForm(initialFormData);
                    setIsEditing(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            ) : (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <form onSubmit={async (e) => {
                  e.preventDefault();

                  // Validate required fields
                  if (!editForm.firstName || !editForm.lastName) {
                    toast.error("Họ và tên không được để trống");
                    return;
                  }

                  // Check if there are any changes
                  const hasChanges = 
                    editForm.firstName.trim() !== user.firstName ||
                    editForm.lastName.trim() !== user.lastName ||
                    editForm.phoneNumber.trim() !== (user.phoneNumber || "") ||
                    editForm.gender !== user.gender ||
                    editForm.DOB !== formatDOB(user.DOB);

                  if (!hasChanges) {
                    toast.error("Không có thông tin nào được thay đổi");
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    // Validate phone number
                    if (editForm.phoneNumber) {
                      const phoneRegex = /^(0[0-9]{9})$/;
                      const cleanPhone = editForm.phoneNumber.trim().replace(/\s+/g, '');
                      if (!phoneRegex.test(cleanPhone)) {
                        setIsSubmitting(false);
                        toast.error("Số điện thoại không hợp lệ. Vui lòng nhập theo định dạng: 0xxxxxxxxx");
                        return;
                      }
                      // Chuẩn hóa số điện thoại
                      editForm.phoneNumber = cleanPhone;
                    }

                    // Validate date format and check valid date
                    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                    let formattedDate = editForm.DOB;
                    if (editForm.DOB) {
                      const match = editForm.DOB.match(dateRegex);
                      if (!match) {
                        setIsSubmitting(false);
                        toast.error("Định dạng ngày sinh không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY");
                        return;
                      }

                      // Kiểm tra tính hợp lệ của ngày tháng
                      const day = parseInt(match[1], 10);
                      const month = parseInt(match[2], 10);
                      const year = parseInt(match[3], 10);
                      
                      console.log('Date validation:', { day, month, year, input: editForm.DOB, match });
                      
                      // Kiểm tra năm hợp lệ trước
                      const currentYear = new Date().getFullYear();
                      if (year < 1900 || year > currentYear) {
                        setIsSubmitting(false);
                        toast.error("Năm sinh phải từ 1900 đến hiện tại");
                        return;
                      }

                      // Kiểm tra tháng hợp lệ
                      if (month < 1 || month > 12) {
                        setIsSubmitting(false);
                        toast.error("Tháng phải từ 01 đến 12");
                        return;
                      }

                      // Kiểm tra ngày hợp lệ
                      if (day < 1 || day > 31) {
                        setIsSubmitting(false);
                        toast.error("Ngày phải từ 01 đến 31");
                        return;
                      }

                      // Kiểm tra ngày có hợp lệ với tháng không (ví dụ: không có 31/02)
                      const daysInMonth = new Date(year, month, 0).getDate();
                      if (day > daysInMonth) {
                        setIsSubmitting(false);
                        toast.error(`Tháng ${month} năm ${year} chỉ có ${daysInMonth} ngày`);
                        return;
                      }

                      // Kiểm tra tuổi phải lớn hơn 0
                      const today = new Date();
                      const age = today.getFullYear() - year - 
                        (today.getMonth() < month - 1 || 
                         (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
                      
                      if (age < 0) {
                        setIsSubmitting(false);
                        toast.error("Ngày sinh không thể là ngày trong tương lai");
                        return;
                      }

                      formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Convert to YYYY-MM-DD
                    }

                    // Prepare phone number
                    const phoneNumber = editForm.phoneNumber.trim();
                    if (phoneNumber && !/^(0[0-9]{9})$/.test(phoneNumber)) {
                      throw new Error("Số điện thoại không hợp lệ");
                    }

                    // Prepare DOB - send as DD/MM/YYYY string format as required by backend
                    let dobToSend = undefined;
                    if (editForm.DOB) {
                      // DOB is already in DD/MM/YYYY format, just validate it matches backend regex
                      const backendDobRegex = /^([0-2][0-9]|(3)[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
                      if (!backendDobRegex.test(editForm.DOB)) {
                        throw new Error("Định dạng ngày sinh không đúng yêu cầu");
                      }
                      dobToSend = editForm.DOB; // Send as string in DD/MM/YYYY format
                    }

                    const updateData = {
                      firstName: editForm.firstName.trim(),
                      lastName: editForm.lastName.trim(),
                      ...(phoneNumber && { phoneNumber }),
                      ...(editForm.gender && { gender: editForm.gender }),
                      ...(dobToSend && { DOB: dobToSend })
                    };

                    const result = await updateUser(Cookies.get('accessToken') as string, updateData);
                    
                    if ('statusCode' in result) {
                      throw new Error(result.message);
                    }

                    // Update local user data
                    if (user) {
                      const updatedUser: User = {
                        ...user,
                        firstName: updateData.firstName,
                        lastName: updateData.lastName,
                        phoneNumber: updateData.phoneNumber || user.phoneNumber,
                        gender: updateData.gender || user.gender,
                        DOB: editForm.DOB || user.DOB
                      };
                      setUser(updatedUser);
                    }

                    toast.success("Cập nhật thông tin thành công");
                    setIsEditing(false);
                  } catch (error: any) {
                    toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                          type="text"
                          maxLength={50}
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                          type="text"
                          maxLength={50}
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                          
                        </label>
                        <input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[0+\d]*$/.test(value)) {
                              setEditForm(prev => ({ ...prev, phoneNumber: value }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0xxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                          <span className="text-xs text-gray-500 ml-1">(Định dạng: DD/MM/YYYY)</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.DOB}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[\d/]*$/.test(value)) { // Chỉ cho phép số và dấu /
                              setEditForm(prev => ({ ...prev, DOB: value }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
