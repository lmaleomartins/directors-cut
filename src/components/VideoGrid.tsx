import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from "./VideoCard";
import { Film } from "lucide-react";
import { Search } from "lucide-react";
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
  synopsis?: string;
}

const VideoGrid = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Gêneros, anos e durações disponíveis
  const genreOptions = Array.from(new Set(movies.map(m => Array.isArray(m.genre) ? m.genre : [m.genre]).flat())).filter(Boolean);
  const yearOptions = Array.from(new Set(movies.map(m => m.year))).sort((a, b) => b - a);
  const durationOptions = Array.from(new Set(movies.map(m => m.duration))).filter(Boolean);


  // Filtragem e busca
  const filteredMovies = movies
    .filter(movie => {
      const searchLower = search.toLowerCase();
      const titleMatch = movie.title.toLowerCase().includes(searchLower);
      const directorMatch = movie.director.toLowerCase().includes(searchLower);
      const synopsisMatch = movie.synopsis ? movie.synopsis.toLowerCase().includes(searchLower) : false;
      return (
        (titleMatch || directorMatch || synopsisMatch) &&
        (!filterGenre || (Array.isArray(movie.genre) ? movie.genre.includes(filterGenre) : movie.genre === filterGenre)) &&
        (!filterYear || movie.year.toString() === filterYear) &&
        (!filterDuration || movie.duration === filterDuration)
      );
    });
  const paginatedMovies = filteredMovies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredMovies.length / PAGE_SIZE);

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
        <div className="flex flex-wrap gap-4 justify-center mb-8 items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar por título, diretor ou sinopse"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
  className="pl-10 px-3 py-2 rounded-lg border border-border bg-background text-foreground w-[326px] pr-8 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)]"
            />
            {search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive bg-background rounded-full w-6 h-6 flex items-center justify-center shadow hover:shadow-[0_0_8px_2px_rgba(220,38,38,0.4)] transition-all duration-200"
                onClick={() => { setSearch(""); setPage(1); }}
                aria-label="Limpar busca"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={filterGenre}
              onChange={e => { setFilterGenre(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground pr-8 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)]"
            >
              <option value="">Gênero</option>
              {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {filterGenre && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive bg-background rounded-full w-6 h-6 flex items-center justify-center shadow hover:shadow-[0_0_8px_2px_rgba(220,38,38,0.4)] transition-all duration-200"
                onClick={() => { setFilterGenre(""); setPage(1); }}
                aria-label="Remover filtro gênero"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={filterYear}
              onChange={e => { setFilterYear(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground pr-8 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)]"
            >
              <option value="">Ano</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {filterYear && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive bg-background rounded-full w-6 h-6 flex items-center justify-center shadow hover:shadow-[0_0_8px_2px_rgba(220,38,38,0.4)] transition-all duration-200"
                onClick={() => { setFilterYear(""); setPage(1); }}
                aria-label="Remover filtro ano"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={filterDuration}
              onChange={e => { setFilterDuration(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground pr-8 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)]"
            >
              <option value="">Duração</option>
              {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {filterDuration && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive bg-background rounded-full w-6 h-6 flex items-center justify-center shadow hover:shadow-[0_0_8px_2px_rgba(220,38,38,0.4)] transition-all duration-200"
                onClick={() => { setFilterDuration(""); setPage(1); }}
                aria-label="Remover filtro duração"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="button"
            className="px-3 py-2 rounded border border-border bg-background text-foreground shadow transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)] focus:outline-none focus:ring-2 focus:ring-primary/60"
            onClick={() => {
              setSearch("");
              setFilterGenre("");
              setFilterYear("");
              setFilterDuration("");
              setPage(1);
            }}
          >
            Limpar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-6xl">
          {paginatedMovies.map((movie) => (
            <VideoCard key={movie.id} {...movie} />
          ))}
        </div>
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded border border-border bg-background text-foreground disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >Anterior</button>
            <span className="px-2">Página {page} de {totalPages}</span>
            <button
              className="px-3 py-1 rounded border border-border bg-background text-foreground disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >Próxima</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default VideoGrid;