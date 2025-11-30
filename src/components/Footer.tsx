import { Film, Heart } from "lucide-react";

const MEMBERS: string[] = [
  "Leonardo Martins",
  "Bryan Vourakis",
  "Guilherme Miranda",
  "Joshua Logrado",
];

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Film className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold bg-gradient-accent bg-clip-text text-transparent">
                Director's Cut
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-snug">
              Arquivo vivo de curtas e projetos autorais feitos por estudantes de Cinema — publicar, preservar e inspirar. Uma comunidade de estudantes criando, compartilhando e eternizando suas histórias.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Integrantes do Projeto</h4>
            <ul className="grid grid-cols-2 gap-y-1.5 text-foreground text-sm">
              {MEMBERS.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-primary" />
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-4 pt-4 text-center">
          <p className="text-muted-foreground flex items-center justify-center text-sm">
            Feito com o <Heart className="w-4 h-4 text-primary mx-1" /> para os amantes de cinema
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;