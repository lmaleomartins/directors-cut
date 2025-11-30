import { Button } from "@/components/ui/button";
import { Play, Film } from "lucide-react";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">{/* Removido bg-gradient-hero */}
      {/* Minimalist geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-accent/8 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 text-center text-foreground max-w-4xl mx-auto px-4">
        <Film className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Director's Cut
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground leading-relaxed">
          Onde novas vozes do Cinema encontram espaço para nascer, crescer e inspirar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow" onClick={() => scrollTo('catalog')}>
            <Play className="w-5 h-5 mr-2" />
            Explorar Catálogo
          </Button>
          <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-accent" onClick={() => scrollTo('about')}>
            <Film className="w-5 h-5 mr-2" />
            Sobre o Projeto
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;