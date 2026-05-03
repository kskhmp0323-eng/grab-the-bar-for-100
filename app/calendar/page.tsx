"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getTrainingData } from "@/lib/training";

type DayRecord = {
  date: string;
  logs: string[];
  level: "max" | "85" | "80" | "75" | "70" | "normal";
};

function getToday() {
  return new Date();
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getLevelFromLogs(logs: string[]): DayRecord["level"] {
  if (logs.some((log) => log.includes("MAXチャレンジ成功"))) return "max";
  if (logs.some((log) => log.includes("85%"))) return "85";
  if (logs.some((log) => log.includes("80%"))) return "80";
  if (logs.some((log) => log.includes("75%"))) return "75";
  if (logs.some((log) => log.includes("70%"))) return "70";
  return "normal";
}

function getColorClass(level?: DayRecord["level"]) {
  switch (level) {
    case "max":
      return "bg-red-500 text-white";
    case "85":
      return "bg-blue-500 text-white";
    case "80":
      return "bg-green-500 text-white";
    case "75":
      return "bg-orange-500 text-white";
    case "70":
      return "bg-[#D4AF37] text-black";
    case "normal":
      return "bg-[#2A3036] text-white";
    default:
      return "bg-transparent text-gray-300";
  }
}

export default function CalendarPage() {
  const router = useRouter();

  const today = getToday();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const savedData = await getTrainingData(currentUser.uid);

      if (savedData) {
        setLogs(savedData.logs || []);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, string[]>();

    logs.forEach((log) => {
      const date = log.split("：")[0];
      if (!date) return;

      const current = map.get(date) || [];
      map.set(date, [...current, log]);
    });

    const result = new Map<string, DayRecord>();

    map.forEach((dateLogs, date) => {
      result.set(date, {
        date,
        logs: dateLogs,
        level: getLevelFromLogs(dateLogs),
      });
    });

    return result;
  }, [logs]);

  const selectedRecord = recordsByDate.get(selectedDate);

  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [currentYear, currentMonth]);

  const moveMonth = (diff: number) => {
    const next = new Date(currentYear, currentMonth + diff, 1);
    setCurrentYear(next.getFullYear());
    setCurrentMonth(next.getMonth());
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#101418] text-white">
        <p className="text-sm text-gray-300">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101418] text-white px-4 py-5 pb-24">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#D4AF37]">
            カレンダー
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            トレーニング記録を日付で確認
          </p>
        </header>

        <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#2A3036]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => moveMonth(-1)}
              className="rounded-full border border-[#343B44] px-3 py-1 text-sm"
            >
              ←
            </button>

            <h2 className="text-xl font-extrabold">
              {currentYear}年{currentMonth + 1}月
            </h2>

            <button
              onClick={() => moveMonth(1)}
              className="rounded-full border border-[#343B44] px-3 py-1 text-sm"
            >
              →
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs text-gray-400">
            <div>日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div>土</div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendarCells.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-10" />;
              }

              const dateKey = `${currentYear}/${currentMonth + 1}/${day}`;
              const record = recordsByDate.get(dateKey);
              const isSelected = selectedDate === dateKey;

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`h-10 rounded-xl text-sm font-bold border ${
                    isSelected
                      ? "border-red-400"
                      : "border-[#2A3036]"
                  } ${getColorClass(record?.level)}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#D4AF37] px-2 py-1 text-black">
              70%
            </span>
            <span className="rounded-full bg-orange-500 px-2 py-1 text-white">
              75%
            </span>
            <span className="rounded-full bg-green-500 px-2 py-1 text-white">
              80%
            </span>
            <span className="rounded-full bg-blue-500 px-2 py-1 text-white">
              85%
            </span>
            <span className="rounded-full bg-red-500 px-2 py-1 text-white">
              MAX成功
            </span>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1B2026] p-4 shadow-xl border border-[#2A3036]">
          <h2 className="font-bold text-lg">{selectedDate} の記録</h2>

          {!selectedRecord ? (
            <div className="mt-4 rounded-xl bg-[#151A20] p-4 text-sm text-gray-400">
              この日の記録はありません。
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {selectedRecord.logs.map((log, index) => (
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

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#2A3036] bg-[#101418]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md justify-around text-xs">
          <Link href="/training" className="text-gray-400">
            ホーム
          </Link>
          <Link href="/calendar" className="font-bold text-[#D4AF37]">
            カレンダー
          </Link>
          <Link href="/training" className="text-gray-400">
            履歴
          </Link>
          <Link href="/training" className="text-gray-400">
            設定
          </Link>
        </div>
      </nav>
    </main>
  );
}