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

  const email = data.user.email as string;

  const adminEmails = [
    
    "elifredmason@gmail.com",
    "mirimer6@gmail.com",
   
    
  ];

  let ComponentToRender = <HomeUsuario />;

  if (adminEmails.includes(email)) {
    ComponentToRender =  <HomeAdmin/>;
  }
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        
        {ComponentToRender}
      </div>
    </div>
  );
}
