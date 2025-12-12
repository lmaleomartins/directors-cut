import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Film, Plus, Edit, Trash2, LogOut, Eye, Users, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { UserManagement } from '@/components/UserManagement';
import { movieSchema } from '@/lib/validationSchemas';
import { mapToUserError } from '@/lib/errorUtils';

interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  duration: string;
  genre: string | string[];
  thumbnail: string | null;
  video_url: string | null;
  views: number;
  synopsis: string | null;
  featured: boolean;
  created_at: string;
  created_by: string | null;
}

// Opções pré-definidas para os dropdowns
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1895 + 1 }, (_, i) => CURRENT_YEAR - i);


// Lista de gêneros dinâmica via Supabase
interface Genre { id: string; name: string }

const Admin = () => {
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const { user, signOut } = useAuth();
  // Buscar perfil do usuário logado
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        if (!error && data) setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);
  const { userRole, canManageAllMovies, canManageUsers, loading: roleLoading } = useUserRole();
  const canAll = canManageAllMovies();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieSearch, setMovieSearch] = useState('');
  // Genres
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [updatingGenre, setUpdatingGenre] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState('');

  // Controle de requisições (single-flight + throttling)
  const moviesInFlightRef = useRef(false);
  const genresInFlightRef = useRef(false);
  const lastMoviesFetchRef = useRef(0);
  const lastGenresFetchRef = useRef(0);
  const lastErrorRef = useRef(0);

  // Normaliza o nome do gênero: remove espaços extras e aplica Title Case (pt-BR)
  const normalizeGenreName = (raw: string) => {
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    // Divide por espaços e hifens para capitalizar partes compostas
    return trimmed
      .split(' ')
      .map(word => word
        .split('-')
        .map(part => part.length === 0 ? part : part[0].toLocaleUpperCase('pt-BR') + part.slice(1).toLocaleLowerCase('pt-BR'))
        .join('-')
      )
      .join(' ');
  };
  
  // Form states
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState('');
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [genre, setGenre] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [featured, setFeatured] = useState(false);

  // (moved below) Fetch movies and genres when ready

  const fetchMovies = useCallback(async () => {
    const now = Date.now();
    // Throttle: evita disparos em menos de 1.5s ou concorrentes
    if (moviesInFlightRef.current || (now - lastMoviesFetchRef.current) < 1500) return;
    moviesInFlightRef.current = true;
    lastMoviesFetchRef.current = now;
    try {
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!canAll && user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMovies(data || []);
    } catch (error: unknown) {
      const t = Date.now();
      if (t - lastErrorRef.current > 5000) { // cooldown de toast
        lastErrorRef.current = t;
        toast.error(mapToUserError(error));
      }
    } finally {
      moviesInFlightRef.current = false;
      setLoading(false);
    }
  }, [user, canAll]);

  const fetchGenres = useCallback(async () => {
    const now = Date.now();
    if (genresInFlightRef.current || (now - lastGenresFetchRef.current) < 3000) return;
    genresInFlightRef.current = true;
    lastGenresFetchRef.current = now;
    try {
      const { data, error } = await supabase
        .from('genres' as never)
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setGenres(
        ((data || []).map((g: unknown) => {
          const rec = g as { id: string; name: string };
          return { id: rec.id, name: rec.name };
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
      );
    } catch (error: unknown) {
      // Silencia erros repetidos da ausência de tabela/políticas
      const t = Date.now();
      if (t - lastErrorRef.current > 5000) {
        lastErrorRef.current = t;
        // toast.error('Falha ao carregar gêneros.'); // opcional
      }
    } finally {
      genresInFlightRef.current = false;
    }
  }, []);

  const addGenre = async () => {
    const name = normalizeGenreName(newGenreName);
    if (!name) {
      toast.error('Informe um nome de gênero.');
      return;
    }
    if (genres.some(g => g.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) {
      toast.error('Este gênero já existe.');
      return;
    }
    try {
      setUpdatingGenre(true);
      const { error } = await (supabase as unknown as { from: (relation: string) => { insert: (vals: unknown[]) => Promise<{ error: unknown }>; delete: () => unknown } })
        .from('genres')
        .insert([{ name }]);
      if (error) throw error;
      toast.success('Gênero adicionado.');
      setNewGenreName('');
      await fetchGenres();
    } catch (error: unknown) {
      toast.error(mapToUserError(error));
    } finally {
      setUpdatingGenre(false);
    }
  };

  const deleteGenre = async (id: string) => {
    if (!confirm('Excluir este gênero? Filmes existentes não serão alterados automaticamente.')) return;
    try {
      setUpdatingGenre(true);
      const { error } = await (supabase as unknown as { from: (relation: string) => { delete: () => { eq: (col: string, val: unknown) => Promise<{ error: unknown }> } } })
        .from('genres')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Gênero excluído.');
      await fetchGenres();
    } catch (error: unknown) {
      toast.error(mapToUserError(error));
    } finally {
      setUpdatingGenre(false);
    }
  };

  const startEditGenre = (g: Genre) => {
    setEditingGenreId(g.id);
    setEditingGenreName(g.name);
  };

  const cancelEditGenre = () => {
    setEditingGenreId(null);
    setEditingGenreName('');
  };

  const saveEditGenre = async () => {
    if (!editingGenreId) return;
    const newNameRaw = editingGenreName.trim();
    if (!newNameRaw) {
      toast.error('Nome não pode ser vazio.');
      return;
    }
    const normalized = normalizeGenreName(newNameRaw);
    if (genres.some(g => g.id !== editingGenreId && g.name.toLocaleLowerCase('pt-BR') === normalized.toLocaleLowerCase('pt-BR'))) {
      toast.error('Já existe outro gênero com esse nome.');
      return;
    }
    try {
      setUpdatingGenre(true);
      const { error } = await (supabase as unknown as { from: (relation: string) => { update: (vals: unknown) => { eq: (col: string, v: unknown) => Promise<{ error: unknown }> } } })
        .from('genres')
        .update({ name: normalized })
        .eq('id', editingGenreId);
      if (error) throw error;
      toast.success('Gênero atualizado.');
      setEditingGenreId(null);
      setEditingGenreName('');
      await fetchGenres();
    } catch (err: unknown) {
      toast.error(mapToUserError(err));
    } finally {
      setUpdatingGenre(false);
    }
  };

  // Fetch movies and genres when ready (placed after declarations to satisfy hooks lint)
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!roleLoading) {
      fetchMovies();
      fetchGenres();
    }
  }, [user, roleLoading, fetchMovies, fetchGenres, navigate]);

  // Abrir o diálogo de adicionar filme quando a query string conter `openAdd=true`
  useEffect(() => {
    if (!user) return;
    if (roleLoading) return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openAdd') === 'true') {
        resetForm();
        setDialogOpen(true);
        params.delete('openAdd');
        const newSearch = params.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newPath);
      }
    } catch (err) {
      // silence parsing errors
    }
  }, [user, roleLoading]);

  const resetForm = () => {
    setTitle('');
    setDirector('');
    setYear(new Date().getFullYear());
    setDuration('');
    setDurationHours(0);
    setDurationMinutes(0);
    setGenre([]);
    setThumbnail('');
    setVideoUrl('');
    setSynopsis('');
    setFeatured(false);
    setEditingMovie(null);
  };

  const openEditDialog = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDirector(movie.director);
    setYear(movie.year);
    setDuration(movie.duration);
    // Parse duration in HH:MM:SS or minutes text
    const match = /^(\d{1,2}):(\d{2})$/.exec(movie.duration);
    if (match) {
      setDurationHours(parseInt(match[1]));
      setDurationMinutes(parseInt(match[2]));
    } else {
      const minMatch = /(\d+)\s*min/.exec(movie.duration);
      const total = minMatch ? parseInt(minMatch[1]) * 60 : 0;
      setDurationHours(Math.floor(total / 3600));
      setDurationMinutes(Math.floor((total % 3600) / 60));
    }
    setGenre(Array.isArray(movie.genre) ? movie.genre : [movie.genre]);
    setThumbnail(movie.thumbnail || '');
    setVideoUrl(movie.video_url || '');
    setSynopsis(movie.synopsis || '');
    setFeatured(canManageAllMovies() ? movie.featured : false);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input first
    const composedDuration = `${String(durationHours).padStart(2, '0')}:${String(durationMinutes).padStart(2, '0')}`;
    setDuration(composedDuration);
    const validation = movieSchema.safeParse({
      title,
      director,
      year,
      duration: composedDuration,
      genre,
      synopsis,
      thumbnail,
      video_url: videoUrl
    });
    
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Validação de limite de filmes em destaque no frontend
    if (canManageAllMovies() && featured) {
      const currentFeaturedCount = movies.filter(movie => 
        movie.featured && movie.id !== editingMovie?.id
      ).length;
      
      if (currentFeaturedCount >= 3) {
        toast.error('Limite máximo de 3 filmes em destaque atingido. Desmarque outro filme primeiro.');
        return;
      }
    }

    const movieData = {
      title: validation.data.title,
      director: validation.data.director,
      year: validation.data.year,
      duration: validation.data.duration,
      genre: validation.data.genre.join(', '),
      thumbnail: validation.data.thumbnail || null,
      video_url: validation.data.video_url || null,
      synopsis: validation.data.synopsis || null,
      featured: canManageAllMovies() ? featured : (editingMovie?.featured || false),
      created_by: user.id
    };

    try {
      if (editingMovie) {
        const { error } = await supabase
          .from('movies')
          .update(movieData)
          .eq('id', editingMovie.id);

        if (error) throw error;
        toast.success('Filme atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('movies')
          .insert([movieData]);

        if (error) throw error;
        toast.success('Filme adicionado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      fetchMovies();
    } catch (error: unknown) {
      toast.error(mapToUserError(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este filme?')) return;

    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Filme excluído com sucesso!');
      fetchMovies();
    } catch (error: unknown) {
      toast.error(mapToUserError(error));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const canEditMovie = (movie: Movie) => {
    return canManageAllMovies() || (user && movie.created_by === user.id);
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'master': return 'Master';
      case 'admin': return 'Admin';
      case 'user': return 'Usuário';
      default: return 'Usuário';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (userRole) {
      case 'master': return 'destructive';
      case 'admin': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <Film className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">Perfil:</p>
                  <span className="font-semibold text-foreground">
                    {profile?.first_name || ''} {profile?.last_name || ''}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${userRole === 'master' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : userRole === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {userRole === 'master' ? 'Master' : userRole === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-stretch gap-2 sm:items-center sm:gap-4 sm:flex-row flex-col">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-border w-full sm:w-auto h-9 sm:h-10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-border text-destructive hover:text-destructive w-full sm:w-auto h-9 sm:h-10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="flex w-full flex-wrap gap-2">
            <TabsTrigger value="movies">
              <Film className="w-4 h-4 mr-2" />
              Filmes
            </TabsTrigger>
            {userRole === 'master' && (
              <TabsTrigger value="genres">
                <Tag className="w-4 h-4 mr-2" />
                Gêneros
              </TabsTrigger>
            )}
            {canManageUsers() && (
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="movies" className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {canManageAllMovies() ? 'Catálogo de Filmes' : 'Meus Filmes'}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {movies.length} filme{movies.length !== 1 ? 's' : ''} 
                    {canManageAllMovies() ? ' no catálogo' : ' criado(s) por você'}
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      id="add-movie-button"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                      onClick={resetForm}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Filme
                    </Button>
                  </DialogTrigger>
                
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {editingMovie ? 'Editar Filme' : 'Adicionar Filme'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Preencha as informações do filme abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-input border-border"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="director">Diretor *</Label>
                        <Input
                          id="director"
                          value={director}
                          onChange={(e) => setDirector(e.target.value)}
                          className="bg-input border-border"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">Ano *</Label>
                        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border max-h-60">
                            {YEAR_OPTIONS.map((yearOption) => (
                              <SelectItem key={yearOption} value={yearOption.toString()}>
                                {yearOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Duração *</Label>
                        <div className="grid grid-cols-2 gap-2 items-end">
                          <div>
                            <Label htmlFor="duration-hours" className="sr-only">Horas</Label>
                            <Select value={String(durationHours)} onValueChange={(v) => setDurationHours(parseInt(v))}>
                              <SelectTrigger id="duration-hours" className="bg-input border-border w-full h-10 justify-center text-center">
                                <SelectValue placeholder="Horas (HH)" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border max-h-60 text-center">
                                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                  <SelectItem key={h} value={String(h)} className="text-center">
                                    {String(h).padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="duration-minutes" className="sr-only">Minutos</Label>
                            <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(parseInt(v))}>
                              <SelectTrigger id="duration-minutes" className="bg-input border-border w-full h-10 justify-center text-center">
                                <SelectValue placeholder="Minutos (MM)" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border max-h-60 text-center">
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                  <SelectItem key={m} value={String(m)} className="text-center">
                                    {String(m).padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <span className="text-xs text-muted-foreground text-center">Horas</span>
                          <span className="text-xs text-muted-foreground text-center">Minutos</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="genre">Gênero(s) *</Label>
                          <div className="space-y-2">
                          <Select onValueChange={(value) => {
                            // Validação: não permitir "Adulto" e "Infantil" ao mesmo tempo
                            if (value === "Adulto" && genre.includes("Infantil")) {
                              setGenre(genre.filter(g => g !== "Infantil").concat(value));
                              return;
                            }
                            if (value === "Infantil" && genre.includes("Adulto")) {
                              setGenre(genre.filter(g => g !== "Adulto").concat(value));
                              return;
                            }
                            
                            if (!genre.includes(value)) {
                              setGenre([...genre, value]);
                            }
                          }}>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Adicione gêneros" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border max-h-60">
                              {genres
                                .filter(option => !genre.includes(option.name))
                                .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
                                .map((genreOption) => (
                                <SelectItem key={genreOption.id} value={genreOption.name}>
                                  {genreOption.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {genre.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {genre.map((selectedGenre) => (
                                <Badge
                                  key={selectedGenre}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => setGenre(genre.filter(g => g !== selectedGenre))}
                                >
                                  {normalizeGenreName(selectedGenre)} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">URL da Imagem</Label>
                      <Input
                        id="thumbnail"
                        placeholder="https://exemplo.com/image.jpg"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">URL do Vídeo *</Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://exemplo.com/video.mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="bg-input border-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="synopsis">Sinopse</Label>
                      <Textarea
                        id="synopsis"
                        placeholder="Descrição do filme..."
                        value={synopsis}
                        onChange={(e) => setSynopsis(e.target.value)}
                        className="bg-input border-border min-h-20"
                      />
                    </div>

                    {canManageAllMovies() && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={featured}
                          onCheckedChange={setFeatured}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor="featured" className="text-sm">
                            Filme em destaque
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {movies.filter(movie => movie.featured && movie.id !== editingMovie?.id).length}/3 filmes em destaque
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        {editingMovie ? 'Salvar Alterações' : 'Adicionar Filme'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-96">
                  <Input
                    placeholder="Buscar por título, diretor, ano ou gênero"
                    value={movieSearch}
                    onChange={(e) => setMovieSearch(e.target.value)}
                    className="bg-input border-border pr-10"
                  />
                  {movieSearch && (
                    <button
                      type="button"
                      onClick={() => setMovieSearch('')}
                      aria-label="Limpar busca"
                      className="absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Painel de gêneros movido para tab própria */}

            {(() => {
              const term = movieSearch.trim().toLocaleLowerCase('pt-BR');
              const filtered = term
                ? movies.filter(m => {
                    const genresText = Array.isArray(m.genre) ? m.genre.join(', ') : m.genre;
                    return (
                      m.title.toLocaleLowerCase('pt-BR').includes(term) ||
                      m.director.toLocaleLowerCase('pt-BR').includes(term) ||
                      String(m.year).includes(term) ||
                      genresText.toLocaleLowerCase('pt-BR').includes(term)
                    );
                  })
                : movies;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((movie) => (
                <Card key={movie.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 text-foreground">
                          {movie.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {movie.director} • {movie.year}
                        </CardDescription>
                      </div>
                      {movie.featured && (
                        <Badge className="bg-primary text-primary-foreground">
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>Duração: {movie.duration}</p>
                      <p>Gênero: {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</p>
                      <p>Visualizações: {movie.views}</p>
                    </div>
                    
                    {canEditMovie(movie) && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(movie)}
                          className="border-border"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(movie.id)}
                          className="border-border text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                  ))}
                </div>
              );
            })()}

            {movies.length === 0 || (movieSearch.trim() && movies.filter(m => {
              const term = movieSearch.trim().toLocaleLowerCase('pt-BR');
              const genresText = Array.isArray(m.genre) ? m.genre.join(', ') : m.genre;
              return (
                m.title.toLocaleLowerCase('pt-BR').includes(term) ||
                m.director.toLocaleLowerCase('pt-BR').includes(term) ||
                String(m.year).includes(term) ||
                genresText.toLocaleLowerCase('pt-BR').includes(term)
              );
            }).length === 0) ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhum filme encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  {canManageAllMovies() 
                    ? 'Comece adicionando seu primeiro filme ao catálogo.' 
                    : 'Você ainda não criou nenhum filme.'}
                </p>
              </div>
            ) : null}
          </TabsContent>

          {canManageUsers() && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}
          {userRole === 'master' && (
            <TabsContent value="genres" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground flex items-center gap-2"><Tag className="w-6 h-6" /> Gerenciar Gêneros</h2>
                  <p className="text-muted-foreground mt-1">Adicionar, remover e organizar gêneros do catálogo.</p>
                </div>
              </div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Novo Gênero</CardTitle>
                  <CardDescription className="text-muted-foreground">Crie um gênero padronizando nome em Title Case.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!updatingGenre && newGenreName.trim()) addGenre();
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <Input
                      id="new-genre"
                      placeholder="Ex.: Documentário"
                      value={newGenreName}
                      onChange={(e) => setNewGenreName(e.target.value)}
                      className="bg-input border-border w-full sm:w-auto"
                    />
                    <Button type="submit" disabled={updatingGenre || !newGenreName.trim()} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      {updatingGenre ? 'Processando...' : 'Adicionar'}
                    </Button>
                  </form>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative w-full sm:w-80">
                      <Input
                        id="search-genre"
                        placeholder="Buscar gênero"
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        className="bg-input border-border pr-10"
                      />
                      {genreSearch && (
                        <button
                          type="button"
                          onClick={() => setGenreSearch('')}
                          aria-label="Limpar busca de gênero"
                          className="absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Gêneros Cadastrados ({genres.length})</CardTitle>
                  <CardDescription className="text-muted-foreground">Clique na lixeira para remover.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {genres.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Nenhum gênero cadastrado.</span>
                    ) : (
                      genres
                        .filter(g => {
                          if (!genreSearch.trim()) return true;
                          return g.name.toLocaleLowerCase('pt-BR').includes(genreSearch.trim().toLocaleLowerCase('pt-BR'));
                        })
                        .map((g) => (
                        <div key={g.id} className="flex items-center gap-2 border border-border rounded px-2 py-1">
                          {editingGenreId === g.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!updatingGenre) saveEditGenre();
                              }}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={editingGenreName}
                                onChange={(e) => setEditingGenreName(e.target.value)}
                                className="h-8 bg-input border-border"
                                autoFocus
                              />
                              <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                disabled={updatingGenre}
                                aria-label="Salvar gênero"
                                className="border-border text-green-600 hover:text-green-600 flex items-center justify-center"
                              >
                                ✓
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={updatingGenre}
                                onClick={cancelEditGenre}
                                aria-label="Cancelar edição"
                                className="border-border flex items-center justify-center"
                              >
                                ✕
                              </Button>
                            </form>
                          ) : (
                            <>
                              <span className="text-sm text-foreground">{g.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updatingGenre}
                                onClick={() => startEditGenre(g)}
                                aria-label="Editar gênero"
                                className="border-border"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteGenre(g.id)}
                                disabled={updatingGenre}
                                className="border-border text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;