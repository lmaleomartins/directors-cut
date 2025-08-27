import { Film, Heart, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Film className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                CineCult
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Uma curadoria especial de cinema cult, arthouse e filmes independentes. 
              Preservando e compartilhando obras cinematográficas únicas.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categorias</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Cinema Cult</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Arthouse</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Horror Independente</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentários</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Sobre</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Nossa Missão</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contribuir</a></li>
              <li><a href="#" className="flex items-center hover:text-primary transition-colors">
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground flex items-center justify-center">
            Feito com <Heart className="w-4 h-4 text-primary mx-1" /> para os amantes do cinema cult
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;