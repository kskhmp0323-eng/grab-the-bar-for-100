"use client";

import { useState } from "react";
import { loginWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await loginWithEmail(email, password);
      router.push("/training");
    } catch (err: any) {
      setError("ログインに失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-3 w-full max-w-sm"
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-3 w-full max-w-sm"
      />

      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 w-full max-w-sm"
      >
        ログイン
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <button
        onClick={() => router.push("/signup")}
        className="mt-4 text-blue-500"
      >
        アカウント作成はこちら
      </button>
    </div>
  );
}