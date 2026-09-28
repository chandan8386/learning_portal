import { z } from "zod";
import { AVATARS } from "./constants";

export const pinSchema = z.string().regex(/^\d{4}$/);
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/);

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(40),
  username: usernameSchema,
  avatar: z.enum(AVATARS),
  classSlug: z.string().min(1),
  pin: pinSchema,
});

export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});
