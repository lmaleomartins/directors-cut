import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Calendar, Clock, Eye, Film, Maximize, Minimize } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoEmbedWithFallback from '@/components/VideoEmbedWithFallback';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { movieSchema } from '@/lib/validationSchemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Movie {
  id: string;
  title: string;
  director: string;
  year: number;
  duration: string;
  genre: string;
  thumbnail: string | null;
  video_url: string | null;
  views: number;
  synopsis: string | null;
  featured: boolean;
  created_by?: string | null;
}

const MovieDetail = () => {
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const { user } = useAuth();
  const { canManageAllMovies } = useUserRole();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDirector, setEditDirector] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [editGenre, setEditGenre] = useState<string[]>([]);
  const [editFeatured, setEditFeatured] = useState(false);
  const [featuredCount, setFeaturedCount] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const CURRENT_YEAR = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1895 + 1 }, (_, i) => CURRENT_YEAR - i);
  const GENRE_OPTIONS = [
    "Ação", "Adulto", "Análise", "Animação", "Antologia", "Arthouse",
    "Aventura", "Biografia", "Comédia", "Crime", "Cult", "Cyberpunk",
    "Debate", "Distopia", "Documentário", "Drama", "Educativo", "Entrevista",
    "Esporte", "Experimental", "Família", "Fantasia", "Ficção Científica",
    "Film-Noir", "Found Footage", "Game Show", "Gameplay", "Guerra",
    "História", "Horror", "Independente", "Infantil", "LGBTQ+", "Mesa Redonda",
    "Minissérie", "Mistério", "Mockumentário", "Musical", "Noir", "Notícias",
    "Palestra", "Podcast", "Reality Show", "Resenha", "Romance", "Stand-up",
    "Steampunk", "Supernatural", "Talk Show", "Teen", "Thriller", "Tutorial",
    "Utopia", "Vlog", "Web Series", "Western"
  ];
  const formatDuration = (dur: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(dur);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const parts = [] as string[];
      if (h > 0) parts.push(`${h}h`);
      parts.push(`${m}m`);
      return parts.join(' ');
    }
    const minMatch = /(\d+)\s*min/.exec(dur);
    if (minMatch) {
      const totalMin = parseInt(minMatch[1], 10);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const parts = [] as string[];
      if (h > 0) parts.push(`${h}h`);
      parts.push(`${m}m`);
      return parts.join(' ');
    }
    return dur;
  };

  useEffect(() => {
    if (id) {
      fetchMovie();
      incrementViews();
    }
  }, [id]);

  const fetchMovie = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Filme não encontrado');
          navigate('/');
          return;
        }
        throw error;
      }

      setMovie(data);
      // prepare edit fields
      setEditTitle(data.title || '');
      setEditDirector(data.director || '');
      setEditDuration(data.duration || '');
      setEditThumbnail(data.thumbnail || '');
      setEditVideoUrl(data.video_url || '');
      setEditSynopsis(data.synopsis || '');
      setEditYear(data.year);
      setEditGenre(String(data.genre).split(',').map(g => g.trim()).filter(Boolean));
      setEditFeatured(!!data.featured);
      // fetch current featured count excluding this movie
      try {
        const { count } = await supabase
          .from('movies')
          .select('id', { count: 'exact', head: true })
          .eq('featured', true)
          .neq('id', data.id);
        setFeaturedCount(count || 0);
      } catch {
        setFeaturedCount(0);
      }
      const m = /^(\d{1,2}):(\d{2})$/.exec(data.duration || '');
      if (m) {
        setDurationHours(parseInt(m[1]));
        setDurationMinutes(parseInt(m[2]));
      } else {
        const minMatch = /(\d+)\s*min/.exec(data.duration || '');
        const total = minMatch ? parseInt(minMatch[1]) : 0;
        setDurationHours(Math.floor(total / 60));
        setDurationMinutes(total % 60);
      }

      // Buscar nome do usuário que inseriu o filme
      if (data?.created_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', data.created_by)
          .single();
        if (profileData) {
          const name = [profileData.first_name, profileData.last_name].filter(Boolean).join(' ');
          setCreatorName(name || null);
        } else {
          setCreatorName(null);
        }
      } else {
        setCreatorName(null);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar filme: ' + error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    if (!id) return;
    
    try {
      // Increment views count using RPC function
      const { error } = await supabase.rpc('increment_movie_views', {
        movie_id: id
      });
      
      if (error) throw error;
    } catch (error) {
      // Silently fail - views increment is not critical
      console.error('Failed to increment views:', error);
    }
  };

  const canEditHere = () => {
    if (!movie) return false;
    return canManageAllMovies() || (user && movie.created_by === user.id);
  };

  const handleInlineUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;

    const composedDuration = `${String(durationHours).padStart(2, '0')}:${String(durationMinutes).padStart(2, '0')}`;
    const validation = movieSchema.safeParse({
      title: editTitle,
      director: editDirector,
      year: editYear,
      duration: composedDuration,
      genre: editGenre,
      synopsis: editSynopsis || undefined,
      thumbnail: editThumbnail || '',
      video_url: editVideoUrl
    });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    try {
      const updateData = {
        title: validation.data.title,
        director: validation.data.director,
        year: validation.data.year,
        duration: validation.data.duration,
        genre: validation.data.genre.join(', '),
        thumbnail: validation.data.thumbnail || null,
        video_url: validation.data.video_url || null,
        synopsis: validation.data.synopsis || null,
        featured: canManageAllMovies() ? editFeatured : (movie?.featured || false),
      };

      const { error } = await supabase
        .from('movies')
        .update(updateData)
        .eq('id', movie.id);
      if (error) throw error;
      toast.success('Filme atualizado com sucesso!');
      setEditOpen(false);
      await fetchMovie();
    } catch (err: any) {
      toast.error('Erro ao atualizar filme');
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Dailymotion
    const dailymotionRegex = /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    if (dailymotionMatch) {
      return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
    }
    
    // Twitch
    const twitchRegex = /(?:twitch\.tv\/videos\/)(\d+)/;
    const twitchMatch = url.match(twitchRegex);
    if (twitchMatch) {
      return `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=${window.location.hostname}`;
    }
    
    // Facebook Video
    const facebookRegex = /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)(\d+)/;
    const facebookMatch = url.match(facebookRegex);
    if (facebookMatch) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }
    
    // Return original URL for direct video files
    return url;
  };

  const isEmbeddableVideo = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)/,
      /(?:vimeo\.com\/)/,
      /(?:dailymotion\.com\/video\/|dai\.ly\/)/,
      /(?:twitch\.tv\/videos\/)/,
      /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Film className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Carregando filme...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Filme não encontrado</h1>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Catálogo
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 border-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster/Thumbnail */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden shadow-cinema">
              {movie.thumbnail ? (
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-card">
                  <Film className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {movie.video_url && (
              <Button 
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                onClick={() => setShowPlayer(!showPlayer)}
              >
                <Play className="w-5 h-5 mr-2" />
                {showPlayer ? 'Ocultar Player' : 'Assistir Filme'}
              </Button>
            )}
          </div>

          {/* Movie Information */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {showPlayer && movie.video_url && (
              <div className="mb-8">
                <div className="bg-black rounded-lg overflow-hidden shadow-cinema">
                  {isEmbeddableVideo(movie.video_url) ? (
                    <VideoEmbedWithFallback url={movie.video_url} title={movie.title} />
                  ) : (
                    <video 
                      controls 
                      className="w-full aspect-video"
                      poster={movie.thumbnail || undefined}
                    >
                      <source src={movie.video_url} type="video/mp4" />
                      <source src={movie.video_url} type="video/webm" />
                      <source src={movie.video_url} type="video/ogg" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      {movie.title}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Dirigido por {movie.director}
                    </p>
                  </div>
                  
                  {movie.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Em Destaque
                    </Badge>
                  )}
                  {canEditHere() && (
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="ml-4 border-border">Editar</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Editar Filme</DialogTitle>
                          <DialogDescription className="text-muted-foreground">Atualize os campos abaixo e salve.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInlineUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Título *</Label>
                              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-director">Diretor *</Label>
                              <Input id="edit-director" value={editDirector} onChange={(e) => setEditDirector(e.target.value)} required />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-year">Ano *</Label>
                              <Select value={String(editYear)} onValueChange={(v) => setEditYear(parseInt(v))}>
                                <SelectTrigger id="edit-year" className="bg-input border-border">
                                  <SelectValue placeholder="Selecione o ano" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border max-h-60">
                                  {YEAR_OPTIONS.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Duração *</Label>
                              <div className="grid grid-cols-2 gap-2 items-end">
                                <div>
                                  <Label htmlFor="edit-duration-hours" className="sr-only">Horas</Label>
                                  <Select value={String(durationHours)} onValueChange={(v) => setDurationHours(parseInt(v))}>
                                    <SelectTrigger id="edit-duration-hours" className="bg-input border-border w-full h-10 justify-center text-center">
                                      <SelectValue placeholder="Horas (HH)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border max-h-60 text-center">
                                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                        <SelectItem key={h} value={String(h)} className="text-center">{String(h).padStart(2, '0')}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-duration-minutes" className="sr-only">Minutos</Label>
                                  <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(parseInt(v))}>
                                    <SelectTrigger id="edit-duration-minutes" className="bg-input border-border w-full h-10 justify-center text-center">
                                      <SelectValue placeholder="Minutos (MM)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border max-h-60 text-center">
                                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                        <SelectItem key={m} value={String(m)} className="text-center">{String(m).padStart(2, '0')}</SelectItem>
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
                              <Label htmlFor="edit-genre">Gênero(s) *</Label>
                              <Select onValueChange={(value) => {
                                if (value === "Adulto" && editGenre.includes("Infantil")) {
                                  setEditGenre(editGenre.filter(g => g !== "Infantil").concat(value));
                                  return;
                                }
                                if (value === "Infantil" && editGenre.includes("Adulto")) {
                                  setEditGenre(editGenre.filter(g => g !== "Adulto").concat(value));
                                  return;
                                }
                                if (!editGenre.includes(value)) {
                                  setEditGenre([...editGenre, value]);
                                }
                              }}>
                                <SelectTrigger className="bg-input border-border">
                                  <SelectValue placeholder="Adicione gêneros" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border max-h-60">
                                  {GENRE_OPTIONS.filter(option => !editGenre.includes(option)).map((genreOption) => (
                                    <SelectItem key={genreOption} value={genreOption}>{genreOption}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {editGenre.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {editGenre.map((selectedGenre) => (
                                    <Badge
                                      key={selectedGenre}
                                      variant="secondary"
                                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={() => setEditGenre(editGenre.filter(g => g !== selectedGenre))}
                                    >
                                      {selectedGenre} ×
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-thumbnail">URL da Imagem</Label>
                            <Input id="edit-thumbnail" value={editThumbnail} onChange={(e) => setEditThumbnail(e.target.value)} placeholder="https://exemplo.com/image.jpg" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-video">URL do Vídeo *</Label>
                            <Input id="edit-video" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)} placeholder="https://exemplo.com/video.mp4" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-synopsis">Sinopse</Label>
                            <Textarea id="edit-synopsis" value={editSynopsis} onChange={(e) => setEditSynopsis(e.target.value)} placeholder="Descrição do filme..." />
                          </div>
                          {canManageAllMovies() && (
                            <div className="flex items-center space-x-2">
                              <Switch id="edit-featured" checked={editFeatured} onCheckedChange={setEditFeatured} />
                              <div className="flex flex-col">
                                <Label htmlFor="edit-featured" className="text-sm">Filme em destaque</Label>
                                <span className="text-xs text-muted-foreground">{featuredCount}/3 filmes em destaque</span>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">Salvar</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {movie.year}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDuration(movie.duration)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    {movie.views.toLocaleString()} visualizações
                  </div>
                </div>
              </div>

              {/* Genre */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Gênero</h3>
                <Badge variant="secondary" className="text-sm">
                  {movie.genre}
                </Badge>
              </div>

              {/* Synopsis */}
              {movie.synopsis && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Sinopse</h3>
                  <div className="bg-gradient-card p-6 rounded-lg border border-border">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {movie.synopsis}
                    </p>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes Técnicos</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Título:</span>
                    <p className="text-foreground font-medium">{movie.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diretor:</span>
                    <p className="text-foreground font-medium">{movie.director}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ano:</span>
                    <p className="text-foreground font-medium">{movie.year}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duração:</span>
                    <p className="text-foreground font-medium">{formatDuration(movie.duration)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gênero:</span>
                    <p className="text-foreground font-medium">{movie.genre}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visualizações:</span>
                    <p className="text-foreground font-medium">{movie.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inserido por:</span>
                    <p className="text-foreground font-medium">{creatorName ? creatorName : 'Desconhecido'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MovieDetail;