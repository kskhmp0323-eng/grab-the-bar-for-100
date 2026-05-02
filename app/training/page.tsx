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
      <main className="min-h-screen flex items-center justify-center p-4">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Grab the Bar</h1>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 underline block mx-auto"
        >
          ログアウト
        </button>

        <p className="text-center text-sm text-gray-600">
          ベンチプレス100kg達成支援アプリ
        </p>

        <section className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-bold mb-3">現在のMAX</h2>

          <div className="flex gap-2">
            <input
              type="number"
              value={inputMax}
              onChange={(e) => setInputMax(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="MAX重量"
            />
            <button
              onClick={registerMax}
              className="bg-black text-white px-4 rounded"
            >
              登録
            </button>
          </div>

          <p className="mt-3 text-lg font-bold">{max}kg</p>
          <p className="text-sm text-gray-600">
            目標まであと {Math.max(100 - max, 0)}kg
          </p>
        </section>

        <section className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-bold mb-3">メニュー</h2>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">完了日</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="space-y-3">
            {stages.map((stage) => {
              const weight = calculateWeight(max, stage);
              const completed = completedStages.includes(stage);
              const active = nextStage === stage;

              return (
                <div
                  key={stage}
                  className={`border rounded-lg p-3 ${
                    completed
                      ? "bg-gray-200"
                      : active
                      ? "bg-white"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">
                        {stage}%：{weight}kg
                      </p>
                      <p className="text-sm text-gray-600">10回 × 3セット</p>
                    </div>

                    {completed ? (
                      <span className="text-sm font-bold">完了</span>
                    ) : active ? (
                      <button
                        onClick={() => completeStage(stage)}
                        className="bg-black text-white px-3 py-2 rounded text-sm"
                      >
                        完了
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">未到達</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {isCycleComplete && (
          <section className="bg-white rounded-xl p-4 shadow border-2 border-black">
            <h2 className="font-bold mb-2">MAXチャレンジ</h2>
            <p className="text-sm text-gray-600 mb-3">
              70%〜85%を完了しました。次はMAX + 5kgに挑戦します。
            </p>

            <p className="text-2xl font-bold mb-3">{challengeWeight}kg</p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">
                MAXチャレンジ日
              </label>
              <input
                type="date"
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <button
              onClick={completeMaxChallenge}
              className="bg-black text-white w-full py-3 rounded"
            >
              MAXチャレンジ成功
            </button>
          </section>
        )}

        <section className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-bold mb-3">履歴</h2>

          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">まだ履歴はありません</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, index) => (
                <li key={index} className="text-sm border-b pb-2">
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