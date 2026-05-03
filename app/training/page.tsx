// 変更点だけじゃなく完全版で出す

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
  CompletedStage,
} from "@/lib/training";

const stages = [70, 75, 80, 85];

function calculateWeight(max: number, percent: number) {
  return Math.round((max * percent) / 100);
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TrainingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [max, setMax] = useState(90);
  const [inputMax, setInputMax] = useState("90");
  const [completedStages, setCompletedStages] = useState<CompletedStage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const nextStage = stages.find(
    (s) => !completedStages.some((c) => c.stage === s)
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      const saved = await getTrainingData(u.uid);

      if (saved) {
        setMax(saved.max);
        setInputMax(saved.inputMax);
        setCompletedStages(saved.completedStages || []);
        setLogs(saved.logs || []);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const save = async (
    nextCompleted: CompletedStage[],
    nextLogs: string[]
  ) => {
    if (!user) return;

    const data: TrainingData = {
      max,
      inputMax,
      completedStages: nextCompleted,
      logs: nextLogs,
      updatedAt: new Date().toISOString(),
    };

    await saveTrainingData(user.uid, data);
  };

  const completeStage = async (stage: number) => {
    const date = selectedDate;

    const nextCompleted = [
      ...completedStages,
      { stage, date },
    ];

    const nextLogs = [
      `${formatDate(date)}：${stage}% 完了`,
      ...logs,
    ];

    setCompletedStages(nextCompleted);
    setLogs(nextLogs);

    await save(nextCompleted, nextLogs);
  };

  // ★ここが追加
  const undoLast = async () => {
    if (completedStages.length === 0) return;

    const nextCompleted = completedStages.slice(0, -1);
    const nextLogs = logs.slice(1);

    setCompletedStages(nextCompleted);
    setLogs(nextLogs);

    await save(nextCompleted, nextLogs);
  };

  if (loading) return <div className="text-white p-5">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#101418] text-white p-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* 取り消しボタン */}
        <button
          onClick={undoLast}
          className="w-full py-2 text-sm rounded bg-red-500 text-white"
        >
          直前を取り消す
        </button>

        {stages.map((stage) => {
          const weight = calculateWeight(max, stage);
          const completed = completedStages.find(
            (c) => c.stage === stage
          );

          return (
            <div key={stage} className="p-3 border rounded">
              <p>
                {stage}%：{weight}kg
              </p>

              {completed && (
                <p>{formatDate(completed.date)} 完了</p>
              )}

              {!completed && stage === nextStage && (
                <button onClick={() => completeStage(stage)}>
                  完了
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}