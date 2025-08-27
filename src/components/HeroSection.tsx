import { Button } from "@/components/ui/button";
import { Play, Film } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <Film className="w-16 h-16 mx-auto mb-6 text-primary" />
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            CineCult
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
          Seu repositório de cinema cult, arthouse e filmes independentes. 
          Descubra obras-primas esquecidas e clássicos alternativos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
            <Play className="w-5 h-5 mr-2" />
            Explorar Catálogo
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
            <Film className="w-5 h-5 mr-2" />
            Sobre o Projeto
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;