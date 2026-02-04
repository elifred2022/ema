import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeAdmin from "@/components/administrador/homeadmin";
import HomeUsuario from "@/components/clientes/homeclientes";



export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user || !data.user.email) {
    redirect("/auth/login");
  }

  const email = (data.user.email as string).toLowerCase().trim();

  // Depuración: verificar el email recibido
  console.log("DEBUG - Email del usuario recibido:", JSON.stringify(email));
  console.log("DEBUG - Bytes del email:", Array.from(email).map(c => c.charCodeAt(0)));
  
  const adminEmailsSet = new Set([
    "elifredmason@gmail.com",
    "mirimer6@gmail.com",
    "damtreo2022@gmail.com",
    "emanuelmedinaalmacen@gmail.com",
  ].map(e => e.toLowerCase().trim()));

  console.log("DEBUG - Emails de admin:", Array.from(adminEmailsSet));
  console.log("DEBUG - ¿Es admin?:", adminEmailsSet.has(email));

  let ComponentToRender = <HomeUsuario />;

  if (adminEmailsSet.has(email)) {
    console.log("DEBUG - Renderizando HomeAdmin");
    ComponentToRender = <HomeAdmin/>;
  } else {
    console.log("DEBUG - Renderizando HomeUsuario. Email no coincide:", `"${email}"`);
    // Verificar si hay algún email similar
    adminEmailsSet.forEach(adminEmail => {
      if (adminEmail === email) {
        console.log("DEBUG - ¡Coincidencia exacta encontrada!");
      } else {
        console.log(`DEBUG - Comparando: "${adminEmail}" vs "${email}" - Iguales: ${adminEmail === email}`);
      }
    });
  }
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        
        {ComponentToRender}
      </div>
    </div>
  );
}
