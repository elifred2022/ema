"use client";

import Link from "next/link";



function HomeAdmin() {
  


  return (
    <div className="p-4 space-y-4">
      <h1>Administrador</h1>
        <div className="flex flex-wrap gap-4 items-center" >

          <Link
              href="/auth/rut-articulos/list-articulos"
              className="inline-block px-4 py-2 mb-4 bg-white text-black font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
            >
              Seccion Articulos
            </Link>  
           
        

            
           
       </div>
      <div className="flex gap-4 items-center">
       
      </div>

     
    </div>
  );
}

export default HomeAdmin;
