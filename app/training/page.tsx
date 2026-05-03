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

  const [completedStages, setCompletedStages] = useState<
    { stage: number; date: string }[]
  >([]);

  const [logs, setLogs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  const nextStage = stages.find(
    (stage) => !completedStages.find((c) => c.stage === stage)
  );

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
        setCompletedStages(savedData.completedStages || []);
        setLogs(savedData.logs);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const saveData = async (
    nextMax: number,
    nextCompletedStages: { stage: number; date: string }[],
    nextLogs: string[]
  ) => {
    if (!user) return;

    const data: TrainingData = {
      max: nextMax,
      inputMax,
      completedStages: nextCompletedStages,
      logs: nextLogs,
      updatedAt: new Date().toISOString(),
    };

    await saveTrainingData(user.uid, data);
  };

  const completeStage = async (stage: number) => {
    const date = selectedDate;

    const nextCompletedStages = [
      ...completedStages,
      { stage, date },
    ];

    const nextLogs = [
      `${date}：${stage}% 完了`,
      ...logs,
    ];

    setCompletedStages(nextCompletedStages);
    setLogs(nextLogs);

    await saveData(max, nextCompletedStages, nextLogs);
  };

  if (loading) {
    return <div className="text-white p-5">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#101418] text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold text-[#D4AF37]">
          トレーニング
        </h1>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 rounded bg-black border"
        />

        {stages.map((stage) => {
          const weight = calculateWeight(max, stage);
          const completed = completedStages.find(
            (c) => c.stage === stage
          );

          return (
            <div
              key={stage}
              className="p-3 border rounded-xl bg-[#1B2026]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">
                    {stage}%：{weight}kg
                  </p>

                  {completed && (
                    <p className="text-xs text-[#D4AF37]">
                      {completed.date} 完了
                    </p>
                  )}
                </div>

                {completed ? (
                  <span className="text-[#D4AF37]">完了</span>
                ) : stage === nextStage ? (
                  <button
                    onClick={() => completeStage(stage)}
                    className="bg-[#D4AF37] text-black px-3 py-1 rounded"
                  >
                    完了
                  </button>
                ) : (
                  <span className="text-gray-500">未</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}