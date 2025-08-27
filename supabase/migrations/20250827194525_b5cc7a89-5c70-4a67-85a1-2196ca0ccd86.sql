-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration TEXT NOT NULL,
  genre TEXT NOT NULL,
  thumbnail TEXT,
  video_url TEXT,
  views INTEGER DEFAULT 0,
  synopsis TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Create policies for movies (public read, authenticated write)
CREATE POLICY "Anyone can view movies" 
ON public.movies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create movies" 
ON public.movies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update movies" 
ON public.movies 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete movies" 
ON public.movies 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_movies_updated_at
BEFORE UPDATE ON public.movies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.movies (title, director, year, duration, genre, thumbnail, views, synopsis, featured) VALUES
('Eraserhead', 'David Lynch', 1977, '89 min', 'Surreal Horror', '/src/assets/movie-placeholder-1.jpg', 15420, 'Henry Spencer tries to survive his industrial environment, his angry girlfriend, and the unbearable screams of his newly born mutant child.', true),
('Mulholland Drive', 'David Lynch', 2001, '147 min', 'Neo-noir', '/src/assets/movie-placeholder-2.jpg', 23150, 'After a car wreck on the winding Mulholland Drive renders a woman amnesiac, she and a perky Hollywood-hopeful search for clues and answers across Los Angeles.', false),
('Holy Motors', 'Leos Carax', 2012, '115 min', 'Arthouse', '/src/assets/movie-placeholder-3.jpg', 8930, 'A man boards a limousine to be driven around Los Angeles for a day of strange and surreal appointments.', false),
('The House That Jack Built', 'Lars von Trier', 2018, '155 min', 'Psychological Horror', '/src/assets/movie-placeholder-1.jpg', 12780, 'The story follows Jack, a highly intelligent serial killer, over the course of twelve years, and depicts the murders that really develop his inner madman.', false),
('Enter the Void', 'Gaspar Noé', 2009, '161 min', 'Experimental', '/src/assets/movie-placeholder-2.jpg', 19240, 'An American drug dealer living in Tokyo is betrayed by his best friend and killed in a drug deal. His soul, observing the repercussions of his death, seeks resurrection.', true),
('The Cook, the Thief, His Wife & Her Lover', 'Peter Greenaway', 1989, '124 min', 'Art Drama', '/src/assets/movie-placeholder-3.jpg', 6850, 'At Le Hollandais gourmet restaurant, every night is filled with opulence, decadence and gluttony. But when the cook, a thief, his wife and her lover all come together, they unleash a shocking torrent of sex, food, murder and revenge.', false);