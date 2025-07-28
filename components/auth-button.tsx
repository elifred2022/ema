import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Usuario; {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-4">
       <p>Si esta registrado ingrese aca:</p>
      <Button asChild size="sm" variant={"outline"}>
       <Link href="/auth/login">Ingresar</Link>
      </Button> 
        <p>Si no lo esta ingrese aca:</p>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Nuevo usuario</Link>
      </Button>
   
     
    </div>
  );
}
