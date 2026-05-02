"use client";

import { useState } from "react";
import { signUpWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      await signUpWithEmail(email, password);
      router.push("/training");
} catch (err: any) {
  console.error(err);
  setError(`エラー: ${err.code || err.message}`);
}
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">アカウント作成</h1>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-3 w-full max-w-sm"
      />

      <input
        type="password"
        placeholder="パスワード（6文字以上）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-3 w-full max-w-sm"
      />

      <button
        onClick={handleSignup}
        className="bg-black text-white px-4 py-2 w-full max-w-sm"
      >
        アカウント作成
      </button>

      {error && <p className="text-red-500 mt-3 max-w-sm text-sm">{error}</p>}

      <button
        onClick={() => router.push("/login")}
        className="mt-4 text-blue-500"
      >
        ログインはこちら
      </button>
    </div>
  );
}