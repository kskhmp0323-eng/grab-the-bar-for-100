"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { logout } from "@/lib/auth";
import {
  getTrainingData,
  saveTrainingData,
  TrainingData,
} from "@/lib/training";

const stages = [70, 75, 80, 85];
const GOLD = "#D4AF37";

function calculateWeight(max: number, percent: number) {
  return Math.round((max * percent) / 100);
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function TrainingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [max, setMax] = useState<number>(90);
  const [inputMax, setInputMax] = useState<string>("90");
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [challengeDate, setChallengeDate] = useState<string>(getToday());

  const nextStage = stages.find((stage) => !completedStages.includes(stage));
  const isCycleComplete = completedStages.length === stages.length;
  const challengeWeight = max + 5;
  const progress = Math.round((completedStages.length / stages.length) * 100);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const savedData = await getTrainingData(currentUser.uid);

      if (savedData) {
        setMax(savedData.max);
        setInputMax(savedData.inputMax);
        setCompletedStages(savedData.completedStages);
        setLogs(savedData.logs);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const saveData = async (
    nextMax: number,
    nextInputMax: string,
    nextCompletedStages: number[],
    nextLogs: string[]
  ) => {
    if (!user) return;

    const data: TrainingData = {
      max: nextMax,
      inputMax: nextInputMax,
      completedStages: nextCompletedStages,
      logs: nextLogs,
      updatedAt: new Date().toISOString(),
    };

    await saveTrainingData(user.uid, data);
  };

  const registerMax = async () => {
    const newMax = Number(inputMax);
    if (!newMax || newMax <= 0) return;

    const nextCompletedStages: number[] = [];
    const nextLogs = [`${selectedDate}：MAX ${newMax}kg を登録`, ...logs];

    setMax(newMax);
    setCompletedStages(nextCompletedStages);
    setLogs(nextLogs);

    await saveData(newMax, String(newMax), nextCompletedStages, nextLogs);
  };

  const completeStage = async (stage: number) => {
    const weight = calculateWeight(max, stage);
    const date = selectedDate || getToday();

    const nextCompletedStages = [...completedStages, stage];
    const nextLogs = [
      `${date}：MAX ${max}kg / ${stage}% / ${weight}kg 完了`,
      ...logs,
    ];

    setCompletedStages(nextCompletedStages);
    setLogs(nextLogs);
    setSelectedDate(getToday());

    await saveData(max, inputMax, nextCompletedStages, nextLogs);
  };

  const completeMaxChallenge = async () => {
    const date = challengeDate || getToday();

    const nextMax = challengeWeight;
    const nextInputMax = String(challengeWeight);
    const nextCompletedStages: number[] = [];
    const nextLogs = [
      `${date}：MAXチャレンジ成功 ${challengeWeight}kg`,
      ...logs,
    ];

    setMax(nextMax);
    setInputMax(nextInputMax);
    setCompletedStages(nextCompletedStages);
    setLogs(nextLogs);
    setChallengeDate(getToday());

    await saveData(nextMax, nextInputMax, nextCompletedStages, nextLogs);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#101418] text-white">
        <p className="text-sm text-gray-300">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101418] text-white px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Grab the Bar
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              ベンチプレス100kg目標サポート
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-[#2A3036] px-3 py-1 text-xs text-gray-300"
          >
            ログアウト
          </button>
        </header>

        <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#2A3036]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">現在のMAX</h2>
            <div className="text-xs text-gray-400">{progress}% 完了</div>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="number"
              value={inputMax}
              onChange={(e) => setInputMax(e.target.value)}
              className="w-full rounded-lg border border-[#343B44] bg-[#11161B] p-3 text-lg font-bold text-white outline-none focus:border-[#D4AF37]"
              placeholder="MAX重量"
            />
            <button
              onClick={registerMax}
              className="rounded-lg bg-[#D4AF37] px-5 font-bold text-black shadow-[0_0_16px_rgba(212,175,55,0.35)] active:scale-95"
            >
              登録
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-extrabold text-[#D4AF37]">
                {max}kg
              </p>
              <p className="mt-1 text-sm text-gray-400">
                目標まであと {Math.max(100 - max, 0)}kg
              </p>
            </div>

            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-[#30363D]" />
              <div
                className="absolute inset-0 rounded-full border-4 border-[#D4AF37]"
                style={{
                  clipPath:
                    progress >= 75
                      ? "inset(0 0 0 0)"
                      : progress >= 50
                      ? "inset(0 0 0 25%)"
                      : progress >= 25
                      ? "inset(0 50% 0 0)"
                      : "inset(0 75% 0 0)",
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#2A3036]">
          <h2 className="font-bold text-lg">メニュー</h2>

          <div className="mt-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-[#343B44] bg-[#11161B] p-3 text-sm text-white outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="mt-4 space-y-3">
            {stages.map((stage) => {
              const weight = calculateWeight(max, stage);
              const completed = completedStages.includes(stage);
              const active = nextStage === stage;

              return (
                <div
                  key={stage}
                  className={`rounded-xl border p-3 transition ${
                    completed
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_16px_rgba(212,175,55,0.35)]"
                      : active
                      ? "border-[#D4AF37] bg-[#151A20]"
                      : "border-[#30363D] bg-[#151A20] opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-4 ${
                          completed
                            ? "border-black"
                            : active
                            ? "border-[#D4AF37]"
                            : "border-[#3A414A]"
                        }`}
                      >
                        {completed ? "✓" : ""}
                      </div>

                      <div>
                        <p className="font-extrabold">
                          {stage}%：{weight}kg
                        </p>
                        <p
                          className={`text-xs ${
                            completed ? "text-black/70" : "text-gray-400"
                          }`}
                        >
                          10回 × 3セット
                        </p>
                      </div>
                    </div>

                    {completed ? (
                      <span className="text-sm font-extrabold">完了</span>
                    ) : active ? (
                      <button
                        onClick={() => completeStage(stage)}
                        className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black active:scale-95"
                      >
                        完了
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">未</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {isCycleComplete && (
          <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#D4AF37]">
            <h2 className="font-bold text-lg text-[#D4AF37]">
              MAXチャレンジ
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              70%〜85%を完了しました。次はMAX + 5kgに挑戦します。
            </p>

            <p className="mt-4 text-4xl font-extrabold text-[#D4AF37]">
              {challengeWeight}kg
            </p>

            <div className="mt-4">
              <input
                type="date"
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
                className="w-full rounded-lg border border-[#343B44] bg-[#11161B] p-3 text-sm text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={completeMaxChallenge}
              className="mt-4 w-full rounded-xl bg-[#D4AF37] py-3 font-extrabold text-black shadow-[0_0_16px_rgba(212,175,55,0.35)] active:scale-95"
            >
              MAXチャレンジ成功
            </button>
          </section>
        )}

        <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#2A3036]">
          <h2 className="font-bold text-lg">履歴</h2>

          {logs.length === 0 ? (
            <div className="mt-4 rounded-xl bg-[#151A20] p-4 text-sm text-gray-400">
              まだ記録がありません。
              <br />
              トレーニングを記録して、履歴を作成しましょう。
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-[#30363D] bg-[#151A20] p-3 text-sm text-gray-200"
                >
                  {log}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}