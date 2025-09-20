"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginOAuth2 } from "@/app/actions/user/loginOAuth2";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/Footer";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams?.get("code");
      const error = searchParams?.get("error");

      if (error) {
        toast.error("Đăng nhập Google bị hủy hoặc có lỗi");
        setTimeout(() => router.push("/"), 2000);
        setIsProcessing(false);
        return;
      }

      if (!code) {
        toast.error("Không nhận được mã xác thực từ Google");
        setTimeout(() => router.push("/"), 2000);
        setIsProcessing(false);
        return;
      }

      try {
        // Gọi API backend để lấy tokens
        const response = await loginOAuth2(code);

        if ("statusCode" in response) {
          toast.error(response.message);
          setTimeout(() => router.push("/"), 2000);
        } else {
          // Lưu tokens vào cookie
          Cookies.set("accessToken", response.accessToken, {
            expires: 1800 / 86400, // 30 phút
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          Cookies.set("refreshToken", response.refreshToken, {
            expires: 25200 / 86400, // 7 giờ
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          if(response.role){
            Cookies.set("userRole", response.role, {
              expires: 1800 / 86400, // 30 phút
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
          toast.success("Đăng nhập Google thành công!");
          setTimeout(() => router.push("/home"), 1000);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xử lý đăng nhập Google");
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-blue-300">
      <Toaster position="top-right" />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-xl text-blue-700 font-semibold">
                Đang xử lý đăng nhập Google...
              </div>
            </>
          ) : (
            <>
              <svg
                className="w-16 h-16 text-green-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className="text-xl text-green-600 font-bold">
                Đăng nhập thành công!
              </div>
              <div className="text-gray-500">Đang chuyển hướng...</div>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
