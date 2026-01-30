import type { User, Program, Enrollment, DailyTask, TaskCompletion } from "@prisma/client";

export type { User, Program, Enrollment, DailyTask, TaskCompletion };

export type ProgramWithDays = Program & {
  days: {
    id: string;
    dayNumber: number;
    principle: string;
    tasks: DailyTask[];
  }[];
};

export type EnrollmentWithProgram = Enrollment & {
  program: Program;
};

export type TaskWithCompletion = DailyTask & {
  isCompleted: boolean;
};

export type DashboardData = {
  enrollment: EnrollmentWithProgram | null;
  todaysTasks: TaskWithCompletion[];
  todaysPrinciple: string | null;
  currentStreak: number;
  longestStreak: number;
  completionPercentage: number;
};
