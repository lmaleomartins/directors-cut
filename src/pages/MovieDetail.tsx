import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Calendar, Clock, Eye, Film } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
}

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

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
      // Increment views count using SQL function
      const { error } = await supabase
        .from('movies')
        .update({ views: supabase.sql`views + 1` })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      // Silently fail - views increment is not critical
      console.error('Failed to increment views:', error);
    }
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
                onClick={() => window.open(movie.video_url!, '_blank')}
              >
                <Play className="w-5 h-5 mr-2" />
                Assistir Filme
              </Button>
            )}
          </div>

          {/* Movie Information */}
          <div className="lg:col-span-2">
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
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {movie.year}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {movie.duration}
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
                    <p className="text-foreground font-medium">{movie.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gênero:</span>
                    <p className="text-foreground font-medium">{movie.genre}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visualizações:</span>
                    <p className="text-foreground font-medium">{movie.views.toLocaleString()}</p>
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