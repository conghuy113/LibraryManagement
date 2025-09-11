"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { getMe } from "@/app/actions/user/getMe";

function formatDOB(dob: string) {
  if (!dob) return "";
  const isoMatch = dob.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch && isoMatch.length === 4) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob;
  return dob;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setUser(result);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 animate-pulse">
        <div className="text-xl text-blue-700 font-semibold">Đang tải thông tin cá nhân...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          <svg className="w-16 h-16 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
          <div className="text-xl text-red-600 font-bold">Không tìm thấy thông tin người dùng.</div>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => router.push("/home")}>Quay lại trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col gap-6 items-start w-full max-w-lg border border-blue-200">
        <div className="flex items-center gap-6 w-full">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center shadow-lg">
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-1">{user.firstName} {user.lastName}</h1>
            <span className="text-sm text-gray-500 font-medium">Thành viên Library Management</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              {/* Email icon: Envelope */}
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
              </svg>
              <span className="font-semibold w-32">Email:</span> <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Phone icon: Mobile */}
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="7" y="4" width="10" height="16" rx="2" />
                <circle cx="12" cy="18" r="1" />
              </svg>
              <span className="font-semibold w-32">Số điện thoại:</span> <span className="text-gray-700">{user.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Gender icon: User (with gender color) */}
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20v-2a6 6 0 0112 0v2" />
              </svg>
              <span className="font-semibold w-32">Giới tính:</span> <span className="text-gray-700">{user.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* DOB icon: Calendar */}
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="font-semibold w-32">Ngày sinh:</span> <span className="text-gray-700">{formatDOB(user.DOB)}</span>
            </div>
        </div>
        <div className="w-full flex justify-center">
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition-colors"
            onClick={() => router.push("/home")}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
