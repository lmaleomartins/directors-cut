import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Clock, Film } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  director: string;
  year: number;
  duration: string;
  genre: string;
  thumbnail: string | null;
  views: number;
  featured?: boolean;
}

const VideoCard = ({ 
  id,
  title, 
  director, 
  year, 
  duration, 
  genre, 
  thumbnail, 
  views, 
  featured = false 
}: VideoCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${id}`);
  };
  return (
    <Card 
      className={`group overflow-hidden bg-gradient-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer ${
        featured ? 'ring-2 ring-primary' : ''
      } h-full w-full max-w-xs flex flex-col`}
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Film className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
        {featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Em Destaque
          </Badge>
        )}
        <div className="absolute bottom-2 right-2 flex items-center space-x-2 text-white text-sm">
          <span className="flex items-center justify-center bg-black/70 rounded-full px-3 py-1 text-white text-xs font-semibold shadow-md">
            <Clock className="w-4 h-4 mr-1" />
            {duration}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">
          Dir. {director} • {year}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {genre}
          </Badge>
          <div className="flex items-center text-muted-foreground text-xs">
            <Eye className="w-3 h-3 mr-1" />
            {views.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard;