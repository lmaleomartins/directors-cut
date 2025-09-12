import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Film, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

          {/* Auth Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-border">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
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
              Admin
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;