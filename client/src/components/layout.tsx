import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const navLinks = [
    { href: "/", label: "Gallery" },
    { href: "/contact", label: "Contact" },
    ...(user?.isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <div className="flex flex-col cursor-pointer group">
              <span className="font-serif text-2xl font-bold tracking-tighter group-hover:opacity-70 transition-opacity uppercase">
                ASSIS
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                Art Gallery
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "text-sm font-medium tracking-wide uppercase cursor-pointer hover:text-primary/60 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-primary after:transition-all hover:after:w-full",
                    location === link.href ? "after:w-full text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-none hover:bg-accent"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l">
                <span className="text-xs text-muted-foreground">
                  Hello, {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  className="text-xs uppercase tracking-widest hover:bg-transparent hover:underline"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm" className="ml-4 rounded-none px-6">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden">
          <nav className="flex flex-col space-y-6 text-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className="text-2xl font-serif cursor-pointer block py-2 uppercase"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="flex justify-center py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-none"
              >
                {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              </Button>
            </div>
            {user ? (
              <button
                onClick={() => {
                  logoutMutation.mutate();
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg text-muted-foreground pt-4 uppercase tracking-widest"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth">
                <span
                  className="text-2xl font-serif cursor-pointer block py-2 uppercase"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </span>
              </Link>
            )}
          </nav>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-12 bg-black text-white">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-serif text-xl mb-4 tracking-widest uppercase">ASSIS</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Curadoria exclusiva de arte monocromática para o colecionador moderno.
              Simplicidade é o último grau de sofisticação.
            </p>
          </div>
          <div className="md:col-span-2 flex flex-col md:items-end justify-center">
            <div className="space-x-6 text-sm text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Artsy</a>
            </div>
            <p className="mt-8 text-xs text-gray-600 uppercase tracking-widest">
              © {new Date().getFullYear()} ASSIS Gallery. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
