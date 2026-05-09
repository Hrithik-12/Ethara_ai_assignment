import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  email: z.string().trim().toLowerCase().email("That doesn't look like an email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password required"),
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  description: z.string().max(2000).optional().nullable(),
  deadline: z.string().date().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(160),
  description: z.string().max(4000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.string().date().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const memberAddSchema = z.object({
  userId: z.string().uuid(),
});

export const userUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
});

export type Role = "ADMIN" | "MANAGER" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
