import { getClasses } from "@/lib/data";
import { dictionaries } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const [locale, classes] = await Promise.all([getLocale(), getClasses()]);
  return (
    <OnboardingFlow
      initialLocale={locale}
      dictionaries={dictionaries}
      classes={classes.map((c) => ({
        slug: c.slug,
        name: c.name,
        nameHi: c.nameHi,
        stage: c.stage,
        ageRange: c.ageRange,
        audioFirst: c.audioFirst,
      }))}
    />
  );
}
