
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { hasEnvVars } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full max-w-7xl flex justify-between items-center p-4 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Almacén
            </span>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center">
        <section className="w-full max-w-7xl flex-1 flex flex-col gap-20 px-8 py-16">
          <Hero />
        </section>
      </div>

      <footer className="w-full flex items-center justify-center border-t border-t-foreground/10 text-center text-xs gap-8 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Desarrollo de EliDev
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
