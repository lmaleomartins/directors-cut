import VideoCard from "./VideoCard";
import moviePlaceholder1 from "@/assets/movie-placeholder-1.jpg";
import moviePlaceholder2 from "@/assets/movie-placeholder-2.jpg";
import moviePlaceholder3 from "@/assets/movie-placeholder-3.jpg";

const VideoGrid = () => {
  // Mock data para demonstração
  const videos = [
    {
      id: "1",
      title: "Eraserhead",
      director: "David Lynch",
      year: 1977,
      duration: "89 min",
      genre: "Surreal Horror",
      thumbnail: moviePlaceholder1,
      views: 15420,
      featured: true
    },
    {
      id: "2", 
      title: "Mulholland Drive",
      director: "David Lynch",
      year: 2001,
      duration: "147 min",
      genre: "Neo-noir",
      thumbnail: moviePlaceholder2,
      views: 23150
    },
    {
      id: "3",
      title: "Holy Motors",
      director: "Leos Carax", 
      year: 2012,
      duration: "115 min",
      genre: "Arthouse",
      thumbnail: moviePlaceholder3,
      views: 8930
    },
    {
      id: "4",
      title: "The House That Jack Built",
      director: "Lars von Trier",
      year: 2018,
      duration: "155 min", 
      genre: "Psychological Horror",
      thumbnail: moviePlaceholder1,
      views: 12780
    },
    {
      id: "5",
      title: "Enter the Void",
      director: "Gaspar Noé",
      year: 2009,
      duration: "161 min",
      genre: "Experimental",
      thumbnail: moviePlaceholder2,
      views: 19240,
      featured: true
    },
    {
      id: "6",
      title: "The Cook, the Thief, His Wife & Her Lover",
      director: "Peter Greenaway",
      year: 1989,
      duration: "124 min",
      genre: "Art Drama",
      thumbnail: moviePlaceholder3,
      views: 6850
    }
  ];

  const featuredVideos = videos.filter(video => video.featured);
  const regularVideos = videos.filter(video => !video.featured);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Seção em Destaque */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Em Destaque
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>

      {/* Catálogo Principal */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
          Catálogo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default VideoGrid;