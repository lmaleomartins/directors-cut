import { useState, useEffect } from 'react';
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
import { Film, Plus, Edit, Trash2, LogOut, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserManagement } from '@/components/UserManagement';

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
const YEAR_OPTIONS = Array.from({ length: 2024 - 1895 + 1 }, (_, i) => 2024 - i);

const DURATION_OPTIONS = [
  { value: "Menos de 30 min", label: "Menos de 30 min (Curta-metragem)" },
  { value: "30-60 min", label: "30-60 min" },
  { value: "60-90 min", label: "60-90 min" },
  { value: "90-120 min", label: "90-120 min" },
  { value: "120-150 min", label: "120-150 min" },
  { value: "150-180 min", label: "150-180 min" },
  { value: "Mais de 180 min", label: "Mais de 180 min (Épico)" },
];

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

const Admin = () => {
  const { user, signOut } = useAuth();
  const { userRole, canManageAllMovies, canManageUsers, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState('');
  const [genre, setGenre] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!roleLoading) {
      fetchMovies();
    }
  }, [user, navigate, roleLoading, canManageAllMovies]);

  const fetchMovies = async () => {
    try {
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      // Se não for admin ou master, mostrar apenas filmes criados pelo usuário
      if (!canManageAllMovies() && user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMovies(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar filmes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDirector('');
    setYear(new Date().getFullYear());
    setDuration('');
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
    setGenre(Array.isArray(movie.genre) ? movie.genre : [movie.genre]);
    setThumbnail(movie.thumbnail || '');
    setVideoUrl(movie.video_url || '');
    setSynopsis(movie.synopsis || '');
    setFeatured(movie.featured);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const movieData = {
      title,
      director,
      year,
      duration,
      genre: genre.join(', '),
      thumbnail: thumbnail || null,
      video_url: videoUrl || null,
      synopsis: synopsis || null,
      featured,
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
    } catch (error: any) {
      toast.error('Erro ao salvar filme: ' + error.message);
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
    } catch (error: any) {
      toast.error('Erro ao excluir filme: ' + error.message);
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Film className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Perfil:</p>
                <Badge variant={getRoleBadgeVariant()}>
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-border"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-border text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movies">
              <Film className="w-4 h-4 mr-2" />
              Filmes
            </TabsTrigger>
            {canManageUsers() && (
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="movies" className="space-y-6">
            <div className="flex items-center justify-between">
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={resetForm}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Filme
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      {editingMovie ? 'Editar Filme' : 'Adicionar Filme'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Preencha as informações do filme abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-3 gap-4">
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
                        <Label htmlFor="duration">Duração *</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Selecione a duração" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {DURATION_OPTIONS.map((durationOption) => (
                              <SelectItem key={durationOption.value} value={durationOption.value}>
                                {durationOption.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="genre">Gênero(s) *</Label>
                        <div className="space-y-2">
                          <Select onValueChange={(value) => {
                            if (!genre.includes(value)) {
                              setGenre([...genre, value]);
                            }
                          }}>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Adicione gêneros" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border max-h-60">
                              {GENRE_OPTIONS.filter(option => !genre.includes(option)).map((genreOption) => (
                                <SelectItem key={genreOption} value={genreOption}>
                                  {genreOption}
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
                                  {selectedGenre} ×
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
                        placeholder="https://example.com/image.jpg"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">URL do Vídeo</Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://example.com/video.mp4"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="bg-input border-border"
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={featured}
                        onCheckedChange={setFeatured}
                      />
                      <Label htmlFor="featured" className="text-sm">
                        Filme em destaque
                      </Label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        {editingMovie ? 'Salvar Alterações' : 'Adicionar Filme'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
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
                      <div className="flex justify-end space-x-2">
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

            {movies.length === 0 && (
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
            )}
          </TabsContent>

          {canManageUsers() && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;