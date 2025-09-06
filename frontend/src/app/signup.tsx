"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  DOB: string;
  gender: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  DOB?: string;
  gender?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

function validatePhoneVN(phone: string): boolean {
  return /^(0|\+84)[0-9]{9,10}$/.test(phone) || phone === "";
}

function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    DOB: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!form.firstName || form.firstName.length > 50) {
      newErrors.firstName = "Họ không được để trống và tối đa 50 ký tự";
    }
    if (!form.lastName || form.lastName.length > 50) {
      newErrors.lastName = "Tên không được để trống và tối đa 50 ký tự";
    }
    if (!form.email || form.email.length > 50 || !validateEmail(form.email)) {
      newErrors.email = "Email không hợp lệ hoặc quá 50 ký tự";
    }
    if (form.phoneNumber && !validatePhoneVN(form.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (VN)";
    }
    if (!form.password || !validateStrongPassword(form.password)) {
      newErrors.password = "Mật khẩu phải mạnh: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt";
    }
    if (!form.DOB || !validateDate(form.DOB)) {
      newErrors.DOB = "Ngày sinh không hợp lệ (YYYY-MM-DD)";
    }
    if (!form.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // TODO: Integrate with signup API
      alert("Đăng ký thành công (demo)");
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6"
      style={{ minHeight: 600 }}
    >
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
        Đăng ký tài khoản
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              maxLength={50}
              required
              value={form.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập họ"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="w-1/2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              maxLength={50}
              required
              value={form.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
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
            maxLength={50}
            required
            value={form.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Số điện thoại (tùy chọn)
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
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
              required
              value={form.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
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
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="DOB"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ngày sinh
          </label>
          <input
            id="DOB"
            name="DOB"
            type="date"
            required
            value={form.DOB}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.DOB ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="YYYY-MM-DD"
          />
          {errors.DOB && <p className="text-red-500 text-xs mt-1">{errors.DOB}</p>}
        </div>
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Giới tính
          </label>
          <select
            id="gender"
            name="gender"
            required
            value={form.gender}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors mt-2"
        >
          Đăng ký
        </button>
      </form>
      <div className="text-center text-sm text-gray-500 mt-4">
        © {new Date().getFullYear()} Library Management
      </div>
    </div>
  );
}
