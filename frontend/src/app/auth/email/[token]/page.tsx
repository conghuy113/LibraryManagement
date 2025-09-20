"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { verifyUser } from "@/app/actions/user/verifyUser";
import Footer from "@/components/layout/Footer";

export default function VerifyPage() {
  const params = useParams();
  const token = params?.token;
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function handleVerify() {
      if (!token) return;
      const result = await verifyUser(token as string);
      if ("error" in result) {
        setStatus("error");
        setMessage(result.error || result.message || "Xác thực thất bại");
      } else {
        setStatus("success");
        setMessage(result.message || "Xác thực thành công!");
      }
      setTimeout(() => {
        router.push("/");
      }, 2500);
    }
    handleVerify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 items-center">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Xác thực email
          </h1>
          {status === "pending" && (
            <p className="text-blue-600">Đang xác thực...</p>
          )}
          {status === "success" && (
            <p className="text-green-600 font-semibold">{message}</p>
          )}
          {status === "error" && (
            <p className="text-red-600 font-semibold">{message}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">Bạn sẽ được chuyển về trang đăng nhập sau vài giây.</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
