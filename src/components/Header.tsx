import { Button } from "@/components/ui/button";
import { Film, Search, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Film className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            CineCult
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Filmes
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Séries
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Documentários
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Curtas
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;