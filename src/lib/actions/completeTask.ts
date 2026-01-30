"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startOfDay } from "date-fns";

export async function completeTask(taskId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const today = startOfDay(new Date());

  return db.$transaction(async (tx: any) => {
    try {
      await tx.taskCompletion.create({
        data: {
          userId,
          taskId,
          date: today,
        },
      });
    } catch {
      // ignore duplicate completion
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        lastActiveDate: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    return user;
  });
}
