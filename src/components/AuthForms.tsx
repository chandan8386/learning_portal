"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register, type FormState } from "@/app/actions";
import { AVATAR_EMOJI, AVATARS, type Avatar } from "@/lib/constants";
import type { Dictionary } from "@/lib/dictionaries";
import { PinPad } from "./PinPad";

const inputClass =
  "w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-3 text-lg focus:border-brand-500";

function ErrorMessage({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-2xl bg-rose-100 p-3 font-semibold text-rose-800">
      {state.error}
    </p>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      disabled={pending}
      className="min-h-14 w-full rounded-full bg-brand-500 text-xl font-extrabold text-white shadow-md hover:bg-brand-600 active:scale-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function LoginForm({ t }: { t: Dictionary }) {
  const [state, action, pending] = useActionState(login, undefined);
  // Controlled so React doesn't clear it when a failed login resets the form.
  const [username, setUsername] = useState("");
  return (
    <form action={action} className="space-y-5">
      <ErrorMessage state={state} />
      <label className="block">
        <span className="mb-1 block font-bold">{t.username}</span>
        <input
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          className={inputClass}
        />
      </label>
      <fieldset>
        <legend className="mb-2 font-bold">{t.pin}</legend>
        <PinPad name="pin" clearLabel={t.clear} />
      </fieldset>
      <SubmitButton pending={pending} label={t.login} />
      <p className="text-center">
        {t.noAccount}{" "}
        <Link href="/register" className="font-bold text-brand-700 underline">
          {t.register}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({
  t,
  classes,
  defaultClass,
}: {
  t: Dictionary;
  classes: { slug: string; label: string }[];
  defaultClass?: string;
}) {
  const [state, action, pending] = useActionState(register, undefined);
  const [avatar, setAvatar] = useState<Avatar>("lion");
  // Controlled so React doesn't clear them when a failed sign-up resets the form.
  const [fields, setFields] = useState({ name: "", username: "", classSlug: defaultClass ?? classes[0]?.slug ?? "" });
  const bind = (key: keyof typeof fields) => ({
    name: key,
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value })),
  });
  return (
    <form action={action} className="space-y-5">
      <ErrorMessage state={state} />
      <label className="block">
        <span className="mb-1 block font-bold">{t.yourName}</span>
        <input {...bind("name")} required maxLength={40} autoComplete="given-name" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block font-bold">{t.username}</span>
        <input
          {...bind("username")}
          required
          pattern="[a-zA-Z0-9_]{3,20}"
          autoCapitalize="none"
          autoComplete="username"
          className={inputClass}
        />
        <span className="text-sm text-slate-500">{t.usernameHint}</span>
      </label>
      <fieldset>
        <legend className="mb-2 font-bold">{t.pickAvatar}</legend>
        <input type="hidden" name="avatar" value={avatar} />
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-label={a}
              aria-pressed={avatar === a}
              onClick={() => setAvatar(a)}
              className={`aspect-square rounded-2xl border-4 bg-white text-3xl ${avatar === a ? "border-brand-500" : "border-amber-100"}`}
            >
              {AVATAR_EMOJI[a]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1 block font-bold">{t.yourClass}</span>
        <select {...bind("classSlug")} required className={inputClass}>
          {classes.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-1 font-bold">{t.pin}</legend>
        <p className="mb-2 text-sm text-slate-500">{t.pinHint}</p>
        <PinPad name="pin" clearLabel={t.clear} />
      </fieldset>
      <SubmitButton pending={pending} label={t.createAccount} />
      <p className="text-center">
        {t.haveAccount}{" "}
        <Link href="/login" className="font-bold text-brand-700 underline">
          {t.login}
        </Link>
      </p>
    </form>
  );
}
