import { Submission } from "../models/Submission.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { formatDateKey } from "./dates.js";

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  username: string;
  completedCount: number;
  onTimeCount: number;
  streak: number;
  score: number;
}

const calculateStreak = (completedDateKeys: string[]) => {
  const sorted = [...completedDateKeys].sort((a, b) => +new Date(b) - +new Date(a));
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateKey of sorted) {
    const currentKey = cursor.toISOString();
    if (dateKey === currentKey) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (dateKey === cursor.toISOString()) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  }

  return streak;
};

export const buildLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const [students, tasks, submissions] = await Promise.all([
    User.find({ role: "student" }).select("name username").lean(),
    Task.find({ status: "active" }).select("deadline date type").lean(),
    Submission.find({ status: "approved" }).select("studentId taskId submittedAt").lean()
  ]);

  const taskMap = new Map(tasks.map((task) => [String(task._id), task]));
  const grouped = new Map<string, { completedCount: number; onTimeCount: number; completedDates: string[] }>();

  for (const student of students) {
    grouped.set(String(student._id), {
      completedCount: 0,
      onTimeCount: 0,
      completedDates: []
    });
  }

  for (const submission of submissions) {
    const bucket = grouped.get(String(submission.studentId));
    const task = taskMap.get(String(submission.taskId));

    if (!bucket || !task) {
      continue;
    }

    bucket.completedCount += 1;
    if (task.type === "daily") {
      bucket.completedDates.push(formatDateKey(task.date));
    }

    if (new Date(submission.submittedAt) <= new Date(task.deadline)) {
      bucket.onTimeCount += 1;
    }
  }

  return students
    .map((student) => {
      const stats = grouped.get(String(student._id)) || {
        completedCount: 0,
        onTimeCount: 0,
        completedDates: []
      };
      const streak = calculateStreak(stats.completedDates);
      const score = stats.completedCount * 10 + stats.onTimeCount * 5 + streak * 3;

      return {
        studentId: String(student._id),
        name: student.name || student.username,
        username: student.username,
        completedCount: stats.completedCount,
        onTimeCount: stats.onTimeCount,
        streak,
        score
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.onTimeCount !== a.onTimeCount) {
        return b.onTimeCount - a.onTimeCount;
      }

      return a.name.localeCompare(b.name);
    });
};
