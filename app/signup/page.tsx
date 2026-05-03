"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (!agreed) {
      setError("利用規約に同意してください");
      return;
    }

    try {
      await signUpWithEmail(email, password);
      router.push("/training");
    } catch (e: any) {
      setError("アカウント作成に失敗しました");
    }
  };

  return (
    <main className="min-h-screen bg-[#101418] text-white px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        {/* タイトル */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#D4AF37]">
            Grab the Bar
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            ベンチプレス100kg達成を最短でサポート
          </p>
        </div>

        {/* ベネフィット */}
        <div className="rounded-2xl border border-[#2A3036] bg-[#1B2026] p-4 text-sm text-gray-300 space-y-2">
          <p>・進捗を自動管理</p>
          <p>・成長が見える</p>
          <p>・最短で100kgへ</p>
        </div>

        {/* フォーム */}
        <div className="rounded-2xl border border-[#2A3036] bg-[#1B2026] p-5 space-y-4">
          <h2 className="font-bold text-lg">アカウント作成</h2>

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#343B44] bg-[#11161B] p-3 text-sm text-white outline-none focus:border-[#D4AF37]"
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#343B44] bg-[#11161B] p-3 text-sm text-white outline-none focus:border-[#D4AF37]"
          />

          {/* 利用規約同意 */}
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              <a href="/terms" className="text-[#D4AF37] underline">
                利用規約
              </a>
              に同意する
            </span>
          </label>

          {/* エラー */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* ボタン */}
          <button
            onClick={handleSignup}
            disabled={!agreed}
            className={`w-full py-3 font-bold rounded-xl ${
              agreed
                ? "bg-[#D4AF37] text-black"
                : "bg-gray-600 text-gray-400"
            }`}
          >
            アカウント作成
          </button>

          {/* ログイン導線 */}
          <p className="text-sm text-gray-400 text-center">
            すでにアカウントをお持ちの方は{" "}
            <a href="/login" className="text-[#D4AF37] underline">
              ログイン
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}