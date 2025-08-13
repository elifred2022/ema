"use client";

import ListaArticulosCliente from "../articulos/listarticuloscliente";
import Carrito from "../carrito/carrito";
import ClienteInfo from "./clienteinfo";


function HomeClientes() {
  


  return (
    <div className="p-4 space-y-4">
      <ClienteInfo/>
       <Carrito/>
       <ListaArticulosCliente />

      
      

     
    </div>
  );
}

export default HomeClientes;
