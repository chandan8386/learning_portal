import { LoginForm } from "@/components/AuthForms";
import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const { t } = await getDictionary();
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-center text-3xl font-extrabold">{t.login}</h1>
      <LoginForm t={t} />
    </div>
  );
}
