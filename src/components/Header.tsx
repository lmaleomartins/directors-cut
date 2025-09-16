import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Film, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Film className="w-8 h-8 text-primary" />
          <h1 
            className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            Director's Cut
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#catalog" className="text-foreground hover:text-primary transition-colors">
              Catálogo
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          <ThemeToggle />

          {/* Desktop Auth Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-border hidden md:inline-flex">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer hover:bg-accent"
                >
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/admin')}
                  className="cursor-pointer hover:bg-accent"
                >
                  <User className="mr-2 h-4 w-4" />
                  Painel Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer hover:bg-accent text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-border hidden md:inline-flex"
            >
              <User className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden border-border">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-foreground">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Navegação</h3>
                  <a 
                    href="#catalog" 
                    className="block px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                  >
                    Catálogo
                  </a>
                  <a 
                    href="#about" 
                    className="block px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                  >
                    Sobre
                  </a>
                  <a 
                    href="#contact" 
                    className="block px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                  >
                    Contato
                  </a>
                </div>

                <Separator className="bg-border" />

                {/* Auth Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Conta</h3>
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="w-full justify-start px-3 py-2 h-auto text-foreground hover:text-primary hover:bg-accent"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/admin')}
                        className="w-full justify-start px-3 py-2 h-auto text-foreground hover:text-primary hover:bg-accent"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start px-3 py-2 h-auto text-destructive hover:text-destructive hover:bg-accent"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/auth')}
                      className="w-full justify-start px-3 py-2 h-auto text-foreground hover:text-primary hover:bg-accent"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;