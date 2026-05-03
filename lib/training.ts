import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type CompletedStage = {
  stage: number;
  date: string;
};

export type TrainingData = {
  max: number;
  inputMax: string;
  completedStages: CompletedStage[];
  logs: string[];
  updatedAt: string;
};

export async function saveTrainingData(userId: string, data: TrainingData) {
  const ref = doc(db, "users", userId);

  await setDoc(
    ref,
    {
      training: data,
    },
    { merge: true }
  );
}

export async function getTrainingData(userId: string) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();

  return data.training as TrainingData | undefined;
}