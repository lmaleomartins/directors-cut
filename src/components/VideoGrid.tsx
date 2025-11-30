import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from "./VideoCard";
import { Film, Search, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Sempre exige todos os gêneros selecionados (modo AND fixo)
  const [filterYear, setFilterYear] = useState("");
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 0]);
  const [durationBounds, setDurationBounds] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  // Removido fetch explícito de gêneros; usamos apenas os presentes nos filmes

  // Gêneros, anos e durações disponíveis
  const normalizeGenreName = (raw: string) => {
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    return trimmed
      .split(' ')
      .map(word => word
        .split('-')
        .map(part => part.length === 0 ? part : part[0].toLocaleUpperCase('pt-BR') + part.slice(1).toLocaleLowerCase('pt-BR'))
        .join('-')
      )
      .join(' ');
  };
  // Gêneros disponíveis realmente presentes nos filmes (evita mostrar gêneros não usados)
  const genreOptions = Array.from(new Set(
    movies.flatMap(m => {
      const raw = m.genre;
      const list = Array.isArray(raw)
        ? raw
        : String(raw)
            .split(',')
            .map(seg => seg.trim())
            .filter(Boolean);
      return list.map(g => normalizeGenreName(String(g)));
    })
  ))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  const yearOptions = Array.from(new Set(movies.map(m => m.year))).sort((a, b) => b - a);
  const parseDurationToMinutes = (raw: string): number => {
    if (!raw) return 0;
    const s = raw.trim();
    // HH:MM
    const hhmmMatch = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (hhmmMatch) return parseInt(hhmmMatch[1], 10) * 60 + parseInt(hhmmMatch[2], 10);
    // Xh Ym ou Xh
    const hMinMatch = /^(\d+)h(?:\s*(\d+)m)?$/i.exec(s);
    if (hMinMatch) {
      const h = parseInt(hMinMatch[1], 10);
      const mm = hMinMatch[2] ? parseInt(hMinMatch[2], 10) : 0;
      return h * 60 + mm;
    }
    // Xm ou X min
    const justMinMatch = /^(\d+)\s*m(?:in)?$/i.exec(s);
    if (justMinMatch) return parseInt(justMinMatch[1], 10);
    // Número sozinho assume minutos
    const soloMatch = /^(\d+)$/.exec(s);
    if (soloMatch) return parseInt(soloMatch[1], 10);
    return 0;
  };


  // Filtragem e busca
  const filteredMovies = movies
    .filter(movie => {
      const searchLower = search.toLowerCase();
      const titleMatch = movie.title.toLowerCase().includes(searchLower);
      const directorMatch = movie.director.toLowerCase().includes(searchLower);
      const synopsisMatch = movie.synopsis ? movie.synopsis.toLowerCase().includes(searchLower) : false;
      const movieGenres = Array.isArray(movie.genre)
        ? movie.genre
        : String(movie.genre)
            .split(',')
            .map(seg => seg.trim())
            .filter(Boolean);
      const movieGenresNorm = movieGenres.map(g => normalizeGenreName(String(g)));
      const genreOk = selectedGenres.length === 0
        ? true
        : selectedGenres.every(g => movieGenresNorm.includes(g));
      const movieMinutes = parseDurationToMinutes(movie.duration);
      const minOk = movieMinutes >= durationRange[0];
      const maxOk = movieMinutes <= durationRange[1];
      return (
        (titleMatch || directorMatch || synopsisMatch) &&
        genreOk &&
        (!filterYear || movie.year.toString() === filterYear) &&
        minOk && maxOk
      );
    });
  const paginatedMovies = filteredMovies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredMovies.length / PAGE_SIZE);

  const fetchMovies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error: unknown) {
      toast.error('Erro ao carregar filmes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Ajusta bounds de duração quando filmes carregam
  useEffect(() => {
    if (movies.length === 0) return;
    const durations = movies.map(m => parseDurationToMinutes(m.duration)).filter(d => d > 0);
    if (durations.length === 0) {
      setDurationBounds({ min: 0, max: 0 });
      setDurationRange([0, 0]);
      return;
    }
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    setDurationBounds({ min, max });
    // Se range inicial ainda é [0,0] ou fora dos limites, ajusta
    setDurationRange(prev => {
      if (prev[0] === 0 && prev[1] === 0) return [min, max];
      const newMin = Math.max(min, prev[0]);
      const newMax = Math.min(max, prev[1]);
      return [newMin, newMax];
    });
  }, [movies]);

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
  const hasActiveFilters = (
    search.trim().length > 0 ||
    selectedGenres.length > 0 ||
    filterYear !== '' ||
    durationRange[0] !== durationBounds.min ||
    durationRange[1] !== durationBounds.max
  );
  // Quando há filtros ativos, ocultamos a seção de destaque para evitar confusão;
  // filmes em destaque continuam aparecendo normalmente na listagem filtrada.

  return (
    <div id="catalog" className="container mx-auto px-4 py-12">
      {/* Seção em Destaque */}
      {!hasActiveFilters && featuredMovies.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Em Destaque
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-4xl justify-items-center">
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
            <div className="flex flex-col items-start gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[220px] justify-between">
                    {selectedGenres.length === 0
                      ? 'Filtrar gêneros'
                      : selectedGenres.slice(0,2).join(', ') + (selectedGenres.length > 2 ? ` +${selectedGenres.length-2}` : '')}
                    <span className="ml-2 text-xs text-muted-foreground">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                  {genreOptions.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum gênero disponível</div>
                  )}
                  {genreOptions.map(g => {
                    const checked = selectedGenres.includes(g);
                    return (
                      <DropdownMenuCheckboxItem
                        key={g}
                        checked={checked}
                        onCheckedChange={(v) => {
                          setPage(1);
                          setSelectedGenres(prev => v ? [...prev, g] : prev.filter(x => x !== g));
                        }}
                      >
                        {g}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                  {selectedGenres.length > 0 && (
                    <div className="px-2 py-2 border-t mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => { setSelectedGenres([]); setPage(1); }}
                      >Limpar seleção</Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="relative">
            <Select value={filterYear} onValueChange={(value) => { setFilterYear(value); setPage(1); }}>
              <SelectTrigger className="w-[120px] bg-background border-border transition-all duration-200 hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.4)]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {yearOptions.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="inline-flex items-center h-10 px-3 gap-2 rounded-md border border-input bg-background w-[280px] text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <span className="text-xs text-muted-foreground mr-2">Duração</span>
            <div className="flex-1 relative">
              <Slider
                value={durationRange}
                min={durationBounds.min}
                max={durationBounds.max}
                step={5}
                onValueChange={(val) => { setDurationRange(val as [number, number]); setPage(1); }}
                showValueTooltip
                valueSuffix="m"
                className="w-full"
              />
            </div>
            <span className="ml-3 text-xs font-medium">{durationRange[0]}–{durationRange[1]}m</span>
            { (durationRange[0] !== durationBounds.min || durationRange[1] !== durationBounds.max) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { setDurationRange([durationBounds.min, durationBounds.max]); setPage(1); }}
                className="ml-1 hover:bg-destructive/15"
                aria-label="Resetar duração"
                title="Resetar duração"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedGenres([]);
              setFilterYear("");
              setDurationRange([durationBounds.min, durationBounds.max]);
              setPage(1);
            }}
            className="border-border hover:bg-destructive hover:text-destructive-foreground"
          >
            Limpar filtros
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-6xl justify-items-center">
          {paginatedMovies.map((movie) => (
            <VideoCard key={movie.id} {...movie} />
          ))}
        </div>
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-border"
            >
              Anterior
            </Button>
            <span className="px-2 text-foreground">Página {page} de {totalPages}</span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="border-border"
            >
              Próxima
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default VideoGrid;