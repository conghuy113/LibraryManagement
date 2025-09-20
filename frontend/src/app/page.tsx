"use client";

import SignupPage from "./signup";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions/user/login";
import toast, { Toaster } from "react-hot-toast";
import Cookies from 'js-cookie';
import AuthLayout from "@/components/layout/AuthLayout";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;
    
    if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ");
      valid = false;
    } else {
      setEmailError("");
    }
    
    if (!validateStrongPassword(password)) {
      setPasswordError(
        "Mật khẩu phải tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
      );
      valid = false;
    } else {
      setPasswordError("");
    }
    
    if (valid) {
      try {
        setIsLoading(true);
        const response = await login({ email, password });
        
        if ('statusCode' in response) {
          // Xử lý lỗi
          toast.error(response.message);
        } else {
          // Lưu token vào cookie ở client-side
          Cookies.set('accessToken', response.accessToken, {
            expires: 1800/86400, // 30 phút
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          Cookies.set('refreshToken', response.refreshToken, {
            expires: 25200/86400, // 7 giờ
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          // Lưu role vào cookie (từ response backend)
          if (response.role) {
            Cookies.set('userRole', response.role, {
              expires: 1800/86400, // 30 phút
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
          }

          // Hiển thị thông báo thành công
          toast.success('Đăng nhập thành công!');
          
          // Redirect dựa trên role
          if (response.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/home');
          }
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi đăng nhập');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthLayout
      title={mode === "login" ? "Đăng nhập" : "Đăng ký"}
      subtitle={mode === "login" ? "Đăng nhập vào hệ thống quản lý thư viện" : "Tạo tài khoản mới"}
    >
      <Toaster position="top-right" />
      {mode === "login" ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <form
            className="space-y-6"
            onSubmit={handleLogin}
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập địa chỉ email"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                isLoading ? 'cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-4 text-gray-500 font-medium">Hoặc</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
          
          {/* Google OAuth2 login button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl shadow-sm transition-colors"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <g>
                <path d="M21.805 10.023h-9.765v3.955h5.627c-.243 1.243-1.482 3.65-5.627 3.65-3.386 0-6.145-2.797-6.145-6.25s2.759-6.25 6.145-6.25c1.93 0 3.222.82 3.965 1.527l2.713-2.646C17.09 2.797 14.805 1.75 12.04 1.75 6.477 1.75 2 6.227 2 11.75s4.477 10 10.04 10c5.797 0 9.627-4.07 9.627-9.797 0-.66-.07-1.16-.162-1.93z" fill="#4285F4"/>
                <path d="M3.153 7.345l3.27 2.398c.89-1.34 2.36-2.25 4.017-2.25 1.93 0 3.222.82 3.965 1.527l2.713-2.646C17.09 2.797 14.805 1.75 12.04 1.75c-3.09 0-5.797 1.25-7.887 3.595z" fill="#EA4335"/>
                <path d="M12.04 21.75c2.765 0 5.05-.91 6.91-2.477l-3.18-2.594c-.89.6-2.09.977-3.73.977-3.386 0-6.145-2.797-6.145-6.25 0-.66.09-1.3.243-1.91l-3.27-2.398C2.09 8.797 2 10.227 2 11.75c0 5.523 4.477 10 10.04 10z" fill="#34A853"/>
                <path d="M21.805 10.023h-9.765v3.955h5.627c-.243 1.243-1.482 3.65-5.627 3.65-1.93 0-3.627-.637-4.817-1.727l-3.27 2.398C5.797 20.5 8.477 21.75 12.04 21.75c2.765 0 5.05-.91 6.91-2.477z" fill="#FBBC05"/>
                <path d="M21.805 10.023h-9.765v3.955h5.627c-.243 1.243-1.482 3.65-5.627 3.65-1.93 0-3.627-.637-4.817-1.727l-3.27 2.398C5.797 20.5 8.477 21.75 12.04 21.75c2.765 0 5.05-.91 6.91-2.477z" fill="#4285F4"/>
              </g>
            </svg>
            <span>Đăng nhập với Google</span>
          </button>
          
          <div className="text-center text-sm text-gray-600 mt-6">
            Bạn chưa có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              onClick={() => setMode("signup")}
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
          <SignupPage />
          <div className="text-center text-sm text-gray-600 p-6 border-t">
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
