
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import MercadoPagoTest from "@/components/mercadopago-test";

import { hasEnvVars } from "@/lib/utils";


export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-4 text-sm">
          <div className="flex gap-5 items-center font-semibold">
           
       
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center">
        <section className="w-full max-w-7xl flex-1 flex flex-col gap-20 px-8 py-12">
          <Hero />
          <MercadoPagoTest />
        </section>
      </div>

      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-8">
        <p>
          Desarrollo de EliDev{" "}
         
        </p>
      <p>Cambie el estilo aca...</p>  <ThemeSwitcher />
      </footer>
    </main>
  );
}
