"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CLASS_COOKIE, LOCALE_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validation";

const ONE_YEAR = 60 * 60 * 24 * 365;

export type FormState = { error?: string } | undefined;

async function setPreferenceCookie(name: string, value: string) {
  (await cookies()).set(name, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
}

export async function setLocale(locale: string, returnTo = "/") {
  if (isLocale(locale)) await setPreferenceCookie(LOCALE_COOKIE, locale);
  redirect(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/");
}

export async function completeOnboarding(locale: string, classSlug: string) {
  const klass = await prisma.class.findUnique({ where: { slug: classSlug }, select: { slug: true } });
  if (!klass || !isLocale(locale)) redirect("/onboarding");
  await setPreferenceCookie(LOCALE_COOKIE, locale);
  await setPreferenceCookie(CLASS_COOKIE, klass.slug);
  redirect(`/class/${klass.slug}`);
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getDictionary();
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.invalidForm };
  const { name, username, avatar, classSlug, pin } = parsed.data;

  const [klass, board, existing] = await Promise.all([
    prisma.class.findUnique({ where: { slug: classSlug }, select: { id: true, slug: true } }),
    prisma.board.findUnique({ where: { code: "CBSE" }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);
  if (!klass || !board) return { error: t.invalidForm };
  if (existing) return { error: t.usernameTaken };

  const user = await prisma.user.create({
    data: {
      name,
      username,
      avatar,
      role: "STUDENT",
      pinHash: await bcrypt.hash(pin, 10),
      studentProfile: { create: { classId: klass.id, boardId: board.id } },
    },
  });

  await createSession(user.id);
  await setPreferenceCookie(CLASS_COOKIE, klass.slug);
  redirect(`/class/${klass.slug}`);
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getDictionary();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.wrongLogin };
  const { username, pin } = parsed.data;

  const limitKey = `login:${username}`;
  if (!checkRateLimit(limitKey)) return { error: t.tooManyTries };

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      pinHash: true,
      studentProfile: { select: { class: { select: { slug: true } } } },
    },
  });
  if (!user?.pinHash || !(await bcrypt.compare(pin, user.pinHash))) {
    return { error: t.wrongLogin };
  }

  resetRateLimit(limitKey);
  await createSession(user.id);
  const classSlug = user.studentProfile?.class.slug;
  if (classSlug) await setPreferenceCookie(CLASS_COOKIE, classSlug);
  redirect(classSlug ? `/class/${classSlug}` : "/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
