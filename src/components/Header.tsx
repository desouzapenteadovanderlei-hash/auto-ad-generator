import { Link } from "@tanstack/react-router";
import { Car, Heart, Bell, User as UserIcon, LogOut, Shield, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/estoque", label: "Estoque" },
  { to: "/venda-seu-carro", label: "Venda seu carro" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Car className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">VSP Veículos</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to} to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm font-medium text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/favoritos" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" aria-label="Favoritos"><Heart className="h-4 w-4" /></Button>
              </Link>
              <Link to="/alertas" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" aria-label="Alertas"><Bell className="h-4 w-4" /></Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><UserIcon className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/favoritos"><Heart className="mr-2 h-4 w-4" />Favoritos</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/alertas"><Bell className="mr-2 h-4 w-4" />Alertas</Link></DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Painel Admin</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-3">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm hover:bg-accent">{n.label}</Link>
                ))}
                {user ? (
                  <>
                    <Link to="/favoritos" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">Favoritos</Link>
                    <Link to="/alertas" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">Alertas</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-accent">Painel Admin</Link>}
                    <Button variant="outline" onClick={() => { setOpen(false); signOut(); }}>Sair</Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}><Button className="w-full">Entrar</Button></Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}