"use client";

import SignupPage from "./signup";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions/user/login";
import toast, { Toaster } from "react-hot-toast";
import Cookies from 'js-cookie';

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
          // Hiển thị thông báo thành công
          toast.success('Đăng nhập thành công!');
          // Redirect ngay lập tức sau khi đăng nhập thành công
          router.push('/home');
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi đăng nhập');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster position="top-right" />
      {mode === "login" ? (
        <div
          className="w-full max-w-lg bg-white rounded-xl shadow-lg p-12 flex flex-col gap-8"
          style={{ width: 480, minHeight: 600 }}
        >
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Library Management
          </h1>
          <h2 className="text-lg font-medium text-center text-gray-600 mb-6">
            Đăng nhập hệ thống
          </h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleLogin}
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập email"
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors mt-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="text-center text-sm text-gray-500 mt-4">
            Bạn chưa có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setMode("signup")}
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <SignupPage />
          <div className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
