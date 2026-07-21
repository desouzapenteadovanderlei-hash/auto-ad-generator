import { Link } from "@tanstack/react-router";
import { Car, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold"><Car className="h-5 w-5 text-primary" /> VSP Veículos</div>
          <p className="mt-2 text-sm text-muted-foreground">VSP Comércio de Veículos LTDA — Seminovos com procedência e garantia.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Navegue</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/estoque" className="hover:text-foreground">Estoque</Link></li>
            <li><Link to="/venda-seu-carro" className="hover:text-foreground">Venda seu carro</Link></li>
            <li><Link to="/sobre" className="hover:text-foreground">Sobre a loja</Link></li>
            <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Contato</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> (11) 4000-0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@vspveiculos.com.br</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Av. Exemplo, 1000 — São Paulo/SP</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Horário</p>
          <p className="text-sm text-muted-foreground">Seg a Sex: 9h – 19h<br/>Sábado: 9h – 17h<br/>Domingo: fechado</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VSP Comércio de Veículos LTDA — Todos os direitos reservados.
      </div>
    </footer>
  );
}