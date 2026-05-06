"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth";

const BRAND_GOLD = "#D4AF37";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    try {
      setSending(true);
      await signInWithEmail(email, password);
      router.push("/training");
    } catch {
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#101418] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center space-y-6">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Grab the Bar{" "}
            <span style={{ color: BRAND_GOLD }}>for 100</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            ベンチプレス100kg達成をサポートするトレーニング記録アプリ
          </p>
        </header>

        <section className="rounded-2xl border border-[#2A3036] bg-[#1B2026] p-5 shadow-xl">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold">ログイン</h2>
            <p className="mt-1 text-sm text-gray-400">
              記録を確認して、次のメニューへ進みましょう。
            </p>
          </div>

          <div className="space-y-4">
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

            {error && (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={sending}
              className="w-full rounded-xl py-3 font-extrabold text-black active:scale-95 disabled:opacity-60"
              style={{
                backgroundColor: BRAND_GOLD,
                boxShadow: "0 0 16px rgba(212,175,55,0.35)",
              }}
            >
              {sending ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-400">
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="font-bold underline" style={{ color: BRAND_GOLD }}>
              新規登録
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2A3036] bg-[#1B2026] p-4 text-sm text-gray-300">
          <p className="font-bold" style={{ color: BRAND_GOLD }}>
            100kgまでの道筋を自動管理
          </p>
          <div className="mt-3 space-y-2">
            <p>・MAX重量からメニュー重量を自動計算</p>
            <p>・70% / 75% / 80% / 85% を順番に管理</p>
            <p>・MAXチャレンジと成長履歴を記録</p>
          </div>
        </section>
      </div>
    </main>
  );
}