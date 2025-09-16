import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from "./VideoCard";
import { Film } from "lucide-react";
import { toast } from 'sonner';

interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  duration: string;
  genre: string;
  thumbnail: string | null;
  views: number;
  featured: boolean;
}

const VideoGrid = () => {
  // Estado para busca
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar filmes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Film className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Carregando catálogo...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Catálogo vazio
        </h3>
        <p className="text-muted-foreground">
          Nenhum filme encontrado no momento.
        </p>
      </div>
    );
  }

  const featuredMovies = movies.filter(movie => movie.featured);
  // Catálogo agora exibe todos os filmes, inclusive os destacados

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Seção em Destaque */}
      {featuredMovies.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Em Destaque
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-4xl">
            {featuredMovies.slice(0, 3).map((movie) => (
              <VideoCard key={movie.id} {...movie} />
            ))}
          </div>
        </section>
      )}

      {/* Catálogo Principal */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Catálogo</h2>
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Pesquisar por título ou diretor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-background text-foreground w-64"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-6xl">
          {movies
            .filter(movie =>
              movie.title.toLowerCase().includes(search.toLowerCase()) ||
              movie.director.toLowerCase().includes(search.toLowerCase())
            )
            .map((movie) => (
              <VideoCard key={movie.id} {...movie} />
            ))}
        </div>
      </section>
    </div>
  );
};

export default VideoGrid;